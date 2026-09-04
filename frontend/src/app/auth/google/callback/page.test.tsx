import { render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import userEvent from '@testing-library/user-event';
import GoogleCallbackPage from './page';
import { exchangeGoogleCode } from '@/lib/api';

const STATE_KEY = 'ficha_treino_google_state';

let mockReplace: jest.Mock;
let mockLogin: jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock('@/lib/api', () => ({
  exchangeGoogleCode: jest.fn(),
}));

const mockExchangeGoogleCode = jest.mocked(exchangeGoogleCode);

beforeEach(() => {
  jest.clearAllMocks();
  mockReplace = jest.fn();
  mockLogin = jest.fn();
  window.history.replaceState({}, '', '/auth/google/callback?code=test-code&state=test-state');
  sessionStorage.setItem(STATE_KEY, 'test-state');
});

afterEach(() => {
  sessionStorage.clear();
});

describe('GoogleCallbackPage', () => {
  /**
   * Displays the authentication loading state on the page background.
   * Mock: OAuth code and state are valid while the exchange remains pending.
   * Assert: the loading message is not wrapped in the card surface used by errors.
   */
  test('renders authentication loading without a card surface', () => {
    mockExchangeGoogleCode.mockReturnValue(new Promise(() => undefined));

    render(<GoogleCallbackPage />);

    expect(screen.getByText('Autenticando...').closest('.bg-card')).toBeNull();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  /**
   * Exchanges the code and redirects to the dashboard on success.
   * Mock: exchangeGoogleCode resolves with a JWT token, URL has code and state.
   * Assert: POST /api/auth/google with code, context login called, redirect /dashboard, state cleared.
   */
  test('exchanges the code and redirects to the dashboard on success', async () => {
    mockExchangeGoogleCode.mockResolvedValue({
      token: 'jwt-token',
      name: 'Test User',
      email: 'test@example.com',
    });

    render(
      <StrictMode>
        <GoogleCallbackPage />
      </StrictMode>,
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    expect(mockExchangeGoogleCode).toHaveBeenCalledTimes(1);
    expect(mockExchangeGoogleCode).toHaveBeenCalledWith('test-code');
    expect(mockLogin).toHaveBeenCalledWith('jwt-token');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(STATE_KEY)).toBeNull();
  });

  /**
   * Shows an error when the OAuth state does not match.
   * Mock: URL has code and wrong state.
   * Assert: error message displayed, no API call, no redirect, state cleared.
   */
  test('shows an error when the OAuth state does not match', async () => {
    window.history.replaceState({}, '', '/auth/google/callback?code=test-code&state=wrong-state');

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Falha na autenticação com o Google. Tente novamente.',
    );
    expect(mockExchangeGoogleCode).not.toHaveBeenCalled();
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

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Falha na autenticação com o Google. Tente novamente.',
    );
  });

  /**
   * Redirects to login when the user denies access.
   * Mock: URL with error=access_denied.
   * Assert: redirect /login, no API call.
   */
  test('redirects to login when the user denies access', async () => {
    window.history.replaceState({}, '', '/auth/google/callback?error=access_denied');

    render(<GoogleCallbackPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
    expect(mockExchangeGoogleCode).not.toHaveBeenCalled();
  });

  /**
   * Shows an error when the backend rejects the code.
   * Mock: exchangeGoogleCode rejects with an AxiosError-like error carrying a response.
   * Assert: error message "Não foi possível autenticar" displayed.
   */
  test('shows an error when the backend rejects the code', async () => {
    mockExchangeGoogleCode.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    } as unknown as Error);

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Não foi possível autenticar com o Google. Tente novamente.',
    );
  });

  /**
   * Shows a connection error when the API call fails at network level.
   * Mock: exchangeGoogleCode rejects with a plain Error (no Axios response).
   * Assert: error message "Não foi possível conectar ao servidor" displayed.
   */
  test('shows a connection error when the API call fails', async () => {
    mockExchangeGoogleCode.mockRejectedValue(new Error('network'));

    render(<GoogleCallbackPage />);

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  });

  /**
   * OAuth failures can be dismissed from the shared error dialog.
   * Mock: the Google code exchange fails with a network error.
   * Assert: closing the dialog returns the user to the login page.
   */
  test('returns to login after dismissing an OAuth error dialog', async () => {
    const user = userEvent.setup();
    mockExchangeGoogleCode.mockRejectedValue(new Error('network'));

    render(<GoogleCallbackPage />);

    const closeButtons = await screen.findAllByRole('button', { name: 'Fechar' });
    await user.click(closeButtons[1]);

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
