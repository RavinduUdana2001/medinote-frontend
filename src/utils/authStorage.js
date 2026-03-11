export const TOKEN_KEY = "medinote_token";
export const USER_KEY = "medinote_user";

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const raw =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = ({ token, user, remember = true }) => {
  const store = remember ? localStorage : sessionStorage;

  if (token) {
    store.setItem(TOKEN_KEY, token);
  }

  if (user) {
    store.setItem(USER_KEY, JSON.stringify(user));
  }

  const otherStore = remember ? sessionStorage : localStorage;
  otherStore.removeItem(TOKEN_KEY);
  otherStore.removeItem(USER_KEY);
};

export const updateStoredUser = (user) => {
  if (localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  if (sessionStorage.getItem(USER_KEY)) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};