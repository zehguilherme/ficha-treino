const SESSION_KEY = 'ficha_treino_token';
const SESSION_EVENT = 'ficha-treino-session-change';

const notifySessionChange = (): void => {
  window.dispatchEvent(new Event(SESSION_EVENT));
};

export const setSession = (jwt: string): void => {
  localStorage.setItem(SESSION_KEY, jwt);
  notifySessionChange();
};

export const getSession = (): string | null => localStorage.getItem(SESSION_KEY);

export const getServerSession = (): undefined => undefined;

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  notifySessionChange();
};

export const subscribeToSession = (onStoreChange: () => void): (() => void) => {
  window.addEventListener(SESSION_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return (): void => {
    window.removeEventListener(SESSION_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
};
