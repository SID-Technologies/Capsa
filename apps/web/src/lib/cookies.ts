import Cookies from 'universal-cookie';

enum Keys {
  UUID = 'uuid_token',
  USERNAME = 'username',
  AUTH_PROVIDER_ID = 'auth_provider_id',
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  TOKEN_EXPIRES_AT = 'token_expires_at',
  PERSON_ID = 'person_id',
}

function hasCookie(value: string) {
  const cookie = new Cookies();
  const val = cookie.get(value);
  return val != null;
}

function getCookie(value: string): string {
  const cookies = new Cookies();
  const cookieVal = String(cookies.get(value));
  return cookieVal;
}

function setCookie(name: string, value: string, days: number) {
  let date = null;
  if (days) {
    date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
  const cookies = new Cookies();
  if (date != null) {
    cookies.set(name, value, { path: '/', expires: date, sameSite: 'strict' });
  } else {
    cookies.set(name, value, {
      path: '/',
      expires: new Date(Date.now() + 3600),
      sameSite: 'strict',
    });
  }
}

function deleteCookie(value: string) {
  const cookie = new Cookies();
  cookie.remove(value);
}

const Cookie = {
  hasCookie,
  setCookie,
  deleteCookie,
  getCookie,
  Keys,
};

export default Cookie;
