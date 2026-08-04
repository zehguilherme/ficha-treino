import { clearSession, getSession, setSession } from './auth';

const TOKEN = 'jwt-token';

describe('auth session helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * setSession stores the token in localStorage.
   * Mock: TOKEN constant.
   * Assert: localStorage contains the token.
   */
  test('setSession stores the token in localStorage', () => {
    setSession(TOKEN);
    expect(localStorage.getItem('ficha_treino_token')).toBe(TOKEN);
  });

  /**
   * getSession returns null when localStorage is empty.
   * Mock: localStorage cleared in beforeEach.
   * Assert: returns null.
   */
  test('getSession returns null when no token is stored', () => {
    expect(getSession()).toBeNull();
  });

  /**
   * getSession returns the stored token.
   * Mock: TOKEN stored via setSession.
   * Assert: returns the same token.
   */
  test('getSession returns the stored token', () => {
    setSession(TOKEN);
    expect(getSession()).toBe(TOKEN);
  });

  /**
   * clearSession removes the stored token.
   * Mock: TOKEN stored via setSession.
   * Assert: getSession returns null after clear.
   */
  test('clearSession removes the stored token', () => {
    setSession(TOKEN);
    clearSession();
    expect(getSession()).toBeNull();
  });
});
