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

  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));

  // clear other storage
  (remember ? sessionStorage : localStorage).removeItem(TOKEN_KEY);
  (remember ? sessionStorage : localStorage).removeItem(USER_KEY);
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};