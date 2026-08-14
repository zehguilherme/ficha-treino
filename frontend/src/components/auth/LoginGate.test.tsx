import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LoginGate } from './LoginGate';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ui/Spinner', () => ({
  Spinner: ({ 'aria-label': ariaLabel }: { 'aria-label': string }) => (
    <div role="status" aria-label={ariaLabel} />
  ),
}));

const mockedUseAuth = jest.mocked(useAuth);

interface ChildProps {
  children: ReactNode;
}

const Child = ({ children }: ChildProps): React.JSX.Element => <div>{children}</div>;

describe('LoginGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * An anonymous visitor opens the login page.
   * Mock: auth status is anonymous.
   * Assert: the login content remains available.
   */
  test('renders login content for anonymous users', () => {
    mockedUseAuth.mockReturnValue({
      status: 'anonymous',
      user: undefined,
      isProfilePending: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <LoginGate>
        <Child>Entrar</Child>
      </LoginGate>,
    );

    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  /**
   * An authenticated user opens the login page.
   * Mock: auth status is authenticated.
   * Assert: the user is redirected to the dashboard and login content is hidden.
   */
  test('redirects authenticated users to the dashboard', async () => {
    const navigate = jest.fn<(url: string) => void, [url: string]>();
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      user: undefined,
      isProfilePending: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <LoginGate navigate={navigate}>
        <Child>Entrar</Child>
      </LoginGate>,
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });

  /**
   * Session hydration has not finished yet.
   * Mock: auth status is loading.
   * Assert: login content is withheld behind an accessible loading state.
   */
  test('shows loading while the session is unresolved', () => {
    mockedUseAuth.mockReturnValue({
      status: 'loading',
      user: undefined,
      isProfilePending: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <LoginGate>
        <Child>Entrar</Child>
      </LoginGate>,
    );

    expect(screen.getByRole('status', { name: 'Carregando login' })).toBeInTheDocument();
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });
});
