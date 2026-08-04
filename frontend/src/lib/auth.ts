const SESSION_KEY = 'ficha_treino_token';

export const setSession = (jwt: string): void => {
  localStorage.setItem(SESSION_KEY, jwt);
};

export const getSession = (): string | null => localStorage.getItem(SESSION_KEY);

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
