import { render, screen, waitFor } from '@testing-library/react';
import GoogleCallbackPage from './page';
import { setSession } from '@/lib/auth';

const STATE_KEY = 'ficha_treino_google_state';

let mockReplace: jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/lib/auth', () => ({
  setSession: jest.fn(),
}));

const fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;

const jsonResponse = (body: object): Response =>
  ({ ok: true, json: async () => body }) as unknown as Response;

beforeEach(() => {
  jest.clearAllMocks();
  mockReplace = jest.fn();
  globalThis.fetch = fetchMock;
  window.history.replaceState({}, '', '/auth/google/callback?code=test-code&state=test-state');
  sessionStorage.setItem(STATE_KEY, 'test-state');
});

afterEach(() => {
  sessionStorage.clear();
});

describe('GoogleCallbackPage', () => {
  /**
   * Exchanges the code and redirects to the dashboard on success.
   * Mock: fetch returns JWT token, URL has code and state.
   * Assert: POST /api/auth/google with code, setSession called, redirect /dashboard, state cleared.
   */
  test('exchanges the code and redirects to the dashboard on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ token: 'jwt-token' }));

    render(<GoogleCallbackPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'test-code' }),
    });
    expect(setSession).toHaveBeenCalledWith('jwt-token');
    expect(sessionStorage.getItem(STATE_KEY)).toBeNull();
  });

  /**
   * Shows an error when the OAuth state does not match.
   * Mock: URL has code and wrong state.
   * Assert: error message displayed, no fetch called, no redirect, state cleared.
   */
  test('shows an error when the OAuth state does not match', async () => {
    window.history.replaceState({}, '', '/auth/google/callback?code=test-code&state=wrong-state');

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha na autenticação com o Google. Tente novamente.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STATE_KEY)).toBeNull();
  });

  /**
   * Shows an error when code or state is missing.
   * Mock: URL without code or state params.
   * Assert: error message displayed.
   */
  test('shows an error when code or state is missing', async () => {
    window.history.replaceState({}, '', '/auth/google/callback');

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha na autenticação com o Google. Tente novamente.',
    );
  });

  /**
   * Redirects to login when the user denies access.
   * Mock: URL with error=access_denied.
   * Assert: redirect /login, no fetch called.
   */
  test('redirects to login when the user denies access', async () => {
    window.history.replaceState({}, '', '/auth/google/callback?error=access_denied');

    render(<GoogleCallbackPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * Shows an error when the backend rejects the code.
   * Mock: fetch returns ok: false.
   * Assert: error message "Não foi possível autenticar" displayed.
   */
  test('shows an error when the backend rejects the code', async () => {
    fetchMock.mockResolvedValue({ ok: false } as Response);

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível autenticar com o Google. Tente novamente.',
    );
  });

  /**
   * Shows a connection error when the fetch fails.
   * Mock: fetch rejects with network error.
   * Assert: error message "Não foi possível conectar ao servidor" displayed.
   */
  test('shows a connection error when the fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  });
});
