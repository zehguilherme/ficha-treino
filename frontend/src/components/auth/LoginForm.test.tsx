import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

jest.mock('@/hooks/useGoogleLogin', () => ({
  useGoogleLogin: jest.fn(),
}));

const mockUseGoogleLogin = jest.mocked(useGoogleLogin);
const mockStartLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGoogleLogin.mockReturnValue({
    status: 'idle',
    error: null,
    startLogin: mockStartLogin,
  });
});

describe('LoginForm', () => {
  /**
   * Renders the Google login button.
   * Mock: useGoogleLogin returns status 'idle'.
   * Assert: button with text 'Entrar com Google' is present.
   */
  test('renders the Google login button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeInTheDocument();
  });

  /**
   * Starts the Google login flow on click.
   * Mock: useGoogleLogin returns status 'idle'.
   * Assert: startLogin called once after click.
   */
  test('starts the Google login flow on click', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Entrar com Google' }));

    expect(mockStartLogin).toHaveBeenCalledTimes(1);
  });

  /**
   * Shows loading state while logging in.
   * Mock: useGoogleLogin returns status 'loading'.
   * Assert: button disabled + aria-busy='true' + text 'Entrando...'.
   */
  test('shows loading state while logging in', () => {
    mockUseGoogleLogin.mockReturnValue({
      status: 'loading',
      error: null,
      startLogin: mockStartLogin,
    });
    render(<LoginForm />);

    const button = screen.getByRole('button', { name: /entrando/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  /**
   * Shows the error message when login fails.
   * Mock: useGoogleLogin returns status 'error'.
   * Assert: error message displayed in role="alert".
   */
  test('shows the error message when login fails', () => {
    mockUseGoogleLogin.mockReturnValue({
      status: 'error',
      error: 'Login com Google indisponível no momento.',
      startLogin: mockStartLogin,
    });
    render(<LoginForm />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Login com Google indisponível no momento.',
    );
  });
});
