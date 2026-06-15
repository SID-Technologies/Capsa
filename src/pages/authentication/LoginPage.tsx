// Example WorkOS auth flow: WorkOS sign-in → token exchange → redirect to docs.
// Only rendered when VITE_WORKOS_CLIENT_ID is set (see lib/auth + App routing).
import { useEffect, useRef, useState } from 'react';

import { useAuth as useWorkOSAuth } from '@workos-inc/authkit-react';
import { useNavigate } from 'react-router-dom';
import { YStack, Paragraph, Spinner, Button, H2 } from 'tamagui';

import { useAuth } from '../../contexts/AuthContext';
import { SITE_NAME } from '../../lib/site';

const LOADING_TIMEOUT_MS = 15000;

export default function LoginPage() {
  const navigate = useNavigate();
  const { isLoading: workosLoading, user: workosUser, getAccessToken, signIn, signOut } = useWorkOSAuth();
  const { isAuthenticated, isInitialized, exchangeWorkOSToken } = useAuth();

  const [isExchanging, setIsExchanging] = useState(false);
  const [isTakingLong, setIsTakingLong] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exchangeAttemptedRef = useRef(false);

  // Loading timeout
  useEffect(() => {
    if (!isExchanging || isTakingLong) return;
    const timeout = setTimeout(() => setIsTakingLong(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isExchanging, isTakingLong]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      navigate('/docs', { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Token exchange when WorkOS user exists but app auth doesn't
  useEffect(() => {
    const exchangeToken = async () => {
      if (exchangeAttemptedRef.current || isExchanging) return;
      if (!workosUser || !isInitialized || isAuthenticated) return;

      exchangeAttemptedRef.current = true;
      setIsExchanging(true);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Failed to get WorkOS access token');

        await exchangeWorkOSToken(token, {
          external_id: workosUser.id,
          email: workosUser.email || undefined,
          first_name: workosUser.firstName || undefined,
          last_name: workosUser.lastName || undefined,
          profile_picture_url: workosUser.profilePictureUrl || undefined,
        });

        navigate('/docs', { replace: true });
      } catch (err) {
        console.error('Token exchange failed:', err);
        try {
          await signOut();
        } catch {}
        setError('Authentication failed. Please try again.');
      } finally {
        setIsExchanging(false);
      }
    };

    exchangeToken();
  }, [
    workosUser,
    isInitialized,
    isAuthenticated,
    isExchanging,
    getAccessToken,
    exchangeWorkOSToken,
    signOut,
    navigate,
  ]);

  // Show loading while WorkOS or exchange is in progress
  if (workosLoading || isExchanging) {
    if (isTakingLong) {
      return (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
          gap="$4"
          minHeight="100vh"
          backgroundColor="$background"
        >
          <Spinner size="large" />
          <Paragraph fontWeight="600">Taking longer than expected...</Paragraph>
          <Button
            size="$4"
            onPress={() => {
              exchangeAttemptedRef.current = false;
              setIsTakingLong(false);
              setIsExchanging(false);
            }}
          >
            Retry
          </Button>
        </YStack>
      );
    }

    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$6"
        minHeight="100vh"
        backgroundColor="$background"
      >
        <Spinner size="large" />
        <Paragraph marginTop="$4">{isExchanging ? 'Signing you in...' : 'Loading...'}</Paragraph>
      </YStack>
    );
  }

  // Landing / sign-in page
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$6"
      gap="$6"
      minHeight="100vh"
      backgroundColor="$background"
    >
      <YStack alignItems="center" gap="$3">
        <H2 fontWeight="700">{SITE_NAME}</H2>
        <Paragraph color="$colorPress" textAlign="center">
          Sign in to view the documentation
        </Paragraph>
      </YStack>

      {error && (
        <Paragraph color="$red10" textAlign="center">
          {error}
        </Paragraph>
      )}

      <Button size="$5" themeInverse onPress={() => signIn()}>
        Sign in with WorkOS
      </Button>
    </YStack>
  );
}
