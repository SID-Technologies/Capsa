// Copied from Torch/apps/web/src/contexts/AuthContext.tsx
// Same token exchange + refresh pattern against platform-core.
// Simplified: no onboarding flow (docs app doesn't need it).

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { FC, ReactNode } from 'react';

import Cookie from '../lib/cookies';
import { apiRetry } from '../lib/retry';
import type { User } from '../types/user';

// Inline types from @sid-technologies/api-client — until that package is available
// in this repo (workspace ref or npm publish), we define what we need locally.
// TODO: Replace with `import type { components } from '@sid-technologies/api-client'`
export interface Person {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  onboarding_status?: string;
}

export interface ExternalUserInfo {
  external_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

function personToUser(person: Person): User {
  return {
    id: person.id || '',
    email: person.email || '',
    name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
    avatar: '',
  };
}

interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

interface AuthContextValue extends State {
  exchangeWorkOSToken: (workosAccessToken: string, userInfo?: ExternalUserInfo) => Promise<void>;
  refreshAccessToken: () => Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  } | null>;
  logout: () => Promise<void>;
  isTokenExpired: () => boolean;
  getValidAccessToken: () => Promise<string | null>;
}

type Action =
  | { type: 'INITIALIZE'; payload: Omit<State, 'isInitialized'> & { isAuthenticated: boolean } }
  | {
      type: 'AUTHENTICATED';
      payload: { user: User; accessToken: string; refreshToken: string; expiresAt: Date };
    }
  | { type: 'TOKEN_REFRESHED'; payload: { accessToken: string; refreshToken: string; expiresAt: Date } }
  | { type: 'LOGOUT' };

const initialState: State = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

function setTokenCookies(accessToken: string, refreshToken: string, expiresAt: Date, personId: string): void {
  Cookie.setCookie(Cookie.Keys.ACCESS_TOKEN, accessToken, 1);
  Cookie.setCookie(Cookie.Keys.REFRESH_TOKEN, refreshToken, 7);
  Cookie.setCookie(Cookie.Keys.TOKEN_EXPIRES_AT, expiresAt.toISOString(), 7);
  Cookie.setCookie(Cookie.Keys.PERSON_ID, personId, 7);
}

function clearTokenCookies(): void {
  Cookie.deleteCookie(Cookie.Keys.ACCESS_TOKEN);
  Cookie.deleteCookie(Cookie.Keys.REFRESH_TOKEN);
  Cookie.deleteCookie(Cookie.Keys.TOKEN_EXPIRES_AT);
  Cookie.deleteCookie(Cookie.Keys.PERSON_ID);
}

function getStoredTokens() {
  const accessToken = Cookie.hasCookie(Cookie.Keys.ACCESS_TOKEN)
    ? Cookie.getCookie(Cookie.Keys.ACCESS_TOKEN)
    : null;
  const refreshToken = Cookie.hasCookie(Cookie.Keys.REFRESH_TOKEN)
    ? Cookie.getCookie(Cookie.Keys.REFRESH_TOKEN)
    : null;
  const expiresAtStr = Cookie.hasCookie(Cookie.Keys.TOKEN_EXPIRES_AT)
    ? Cookie.getCookie(Cookie.Keys.TOKEN_EXPIRES_AT)
    : null;
  const personId = Cookie.hasCookie(Cookie.Keys.PERSON_ID) ? Cookie.getCookie(Cookie.Keys.PERSON_ID) : null;
  return { accessToken, refreshToken, expiresAt: expiresAtStr ? new Date(expiresAtStr) : null, personId };
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isInitialized: true, ...action.payload };
    case 'AUTHENTICATED':
      return { ...state, isAuthenticated: true, ...action.payload };
    case 'TOKEN_REFRESHED':
      return { ...state, ...action.payload };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  exchangeWorkOSToken: () => Promise.resolve(),
  refreshAccessToken: () => Promise.resolve(null),
  logout: () => Promise.resolve(),
  isTokenExpired: () => true,
  getValidAccessToken: () => Promise.resolve(null),
});

export const useAuth = () => useContext(AuthContext);

const MAX_REFRESH_FAILURES = 3;

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const refreshInProgressRef = useRef<Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  } | null> | null>(null);
  const refreshFailureCountRef = useRef(0);

  const baseUrl = import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:8080';

  // TODO: Replace with `getPlatformClient()` from @sid-technologies/api-client
  // once the package is available in this repo.
  const exchangeTokenAPI = async (provider: string, accessToken: string, userInfo?: ExternalUserInfo) => {
    return apiRetry(async () => {
      const res = await fetch(`${baseUrl}/v1/identity/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, access_token: accessToken, user_info: userInfo }),
      });
      if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
      return res.json();
    });
  };

  const refreshTokenAPI = async (refreshTokenValue: string) => {
    return apiRetry(async () => {
      const res = await fetch(`${baseUrl}/v1/identity/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });
      if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
      return res.json();
    });
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { accessToken, refreshToken, expiresAt, personId } = getStoredTokens();

        if (accessToken && refreshToken && expiresAt && personId) {
          const tokenExpired = expiresAt <= new Date();

          if (tokenExpired) {
            try {
              const response = await refreshTokenAPI(refreshToken);
              const newExpiresAt = new Date(response.expires_at);
              setTokenCookies(
                response.access_token,
                response.refresh_token,
                newExpiresAt,
                response.person.id || '',
              );
              dispatch({
                type: 'INITIALIZE',
                payload: {
                  isAuthenticated: true,
                  user: personToUser(response.person),
                  accessToken: response.access_token,
                  refreshToken: response.refresh_token,
                  expiresAt: newExpiresAt,
                },
              });
              return;
            } catch {
              clearTokenCookies();
            }
          } else {
            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: true,
                user: { id: personId, email: '', name: '', avatar: '' },
                accessToken,
                refreshToken,
                expiresAt,
              },
            });
            return;
          }
        }

        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          },
        });
      } catch {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          },
        });
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const exchangeWorkOSToken = useCallback(async (workosAccessToken: string, userInfo?: ExternalUserInfo) => {
    const response = await exchangeTokenAPI('workos', workosAccessToken, userInfo);
    const expiresAt = new Date(response.expires_at);
    setTokenCookies(response.access_token, response.refresh_token, expiresAt, response.person.id || '');
    dispatch({
      type: 'AUTHENTICATED',
      payload: {
        user: personToUser(response.person),
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable token-exchange fn
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!state.refreshToken) throw new Error('No refresh token available');
    if (refreshInProgressRef.current) return refreshInProgressRef.current;

    if (refreshFailureCountRef.current >= MAX_REFRESH_FAILURES) {
      clearTokenCookies();
      dispatch({ type: 'LOGOUT' });
      throw new Error('Token refresh failed too many times');
    }

    const promise = (async () => {
      try {
        const response = await refreshTokenAPI(state.refreshToken!);
        const expiresAt = new Date(response.expires_at);
        setTokenCookies(response.access_token, response.refresh_token, expiresAt, response.person.id || '');
        dispatch({
          type: 'TOKEN_REFRESHED',
          payload: { accessToken: response.access_token, refreshToken: response.refresh_token, expiresAt },
        });
        refreshFailureCountRef.current = 0;
        return { accessToken: response.access_token, refreshToken: response.refresh_token, expiresAt };
      } catch (error) {
        refreshFailureCountRef.current += 1;
        if (refreshFailureCountRef.current >= MAX_REFRESH_FAILURES) {
          clearTokenCookies();
          dispatch({ type: 'LOGOUT' });
        }
        throw error;
      } finally {
        refreshInProgressRef.current = null;
      }
    })();

    refreshInProgressRef.current = promise;
    return promise;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refresh fn
  }, [state.refreshToken]);

  const logout = useCallback(async () => {
    clearTokenCookies();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const isTokenExpired = useCallback(() => {
    if (!state.expiresAt) return true;
    return state.expiresAt.getTime() - 30_000 <= Date.now();
  }, [state.expiresAt]);

  const getValidAccessToken = useCallback(async () => {
    if (!state.accessToken) return null;
    if (isTokenExpired()) {
      try {
        const result = await refreshAccessToken();
        return result?.accessToken ?? null;
      } catch {
        return null;
      }
    }
    return state.accessToken;
  }, [state.accessToken, isTokenExpired, refreshAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      exchangeWorkOSToken,
      refreshAccessToken,
      logout,
      isTokenExpired,
      getValidAccessToken,
    }),
    [state, exchangeWorkOSToken, refreshAccessToken, logout, isTokenExpired, getValidAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
