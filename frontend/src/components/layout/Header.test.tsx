import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/lib/api';
import { setSession } from '@/lib/auth';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('@/lib/api', () => ({
  getCurrentUser: jest.fn(),
}));

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

interface WrapperProps {
  children: ReactNode;
}

const Wrapper = ({ children }: WrapperProps): React.JSX.Element => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  /**
   * An anonymous user visits the public header.
   * Mock: no session is stored.
   * Assert: the logo and title link to the public landing page.
   */
  test('links anonymous users to the landing page', async () => {
    render(<Header />, { wrapper: Wrapper });

    expect(await screen.findByRole('link', { name: 'Ficha de Treino' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  /**
   * An authenticated user visits the header.
   * Mock: a JWT and a valid user profile are available.
   * Assert: the logo and title link to the authenticated dashboard.
   */
  test('links authenticated users to the dashboard', async () => {
    setSession('jwt-token');
    mockedGetCurrentUser.mockResolvedValue({
      name: 'João Teste',
      email: 'joao@teste.com',
      google_id: 'google-123',
    });

    render(<Header />, { wrapper: Wrapper });

    expect(await screen.findByRole('link', { name: 'Ficha de Treino' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  /**
   * A JWT exists but loading the user profile fails temporarily.
   * Mock: getCurrentUser rejects with a network error.
   * Assert: the authenticated menu remains available with fallback initials.
   */
  test('shows the authenticated fallback when the profile is unavailable', async () => {
    setSession('jwt-token');
    mockedGetCurrentUser.mockRejectedValue(new Error('network'));

    render(<Header />, { wrapper: Wrapper });

    expect(await screen.findByRole('button', { name: 'Abrir menu do usuário' })).toHaveTextContent(
      'U',
    );
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument();
  });

  /**
   * A JWT exists while the profile request is still pending.
   * Mock: getCurrentUser never settles.
   * Assert: neither the fallback avatar nor the public login action is shown prematurely.
   */
  test('keeps the account action loading while the profile is pending', async () => {
    setSession('jwt-token');
    mockedGetCurrentUser.mockImplementation(() => new Promise(() => undefined));

    render(<Header />, { wrapper: Wrapper });

    await screen.findByRole('link', { name: 'Ficha de Treino' });
    expect(screen.queryByRole('button', { name: 'Abrir menu do usuário' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument();
  });

  /**
   * An authenticated user opens the account menu with the keyboard.
   * Mock: getCurrentUser resolves with a complete profile.
   * Assert: Radix moves focus into the menu and Escape restores it to the trigger.
   */
  test('manages keyboard focus through the account dropdown', async () => {
    const user = userEvent.setup();
    setSession('jwt-token');
    mockedGetCurrentUser.mockResolvedValue({
      name: 'João Teste',
      email: 'joao@teste.com',
      google_id: 'google-123',
    });
    render(<Header />, { wrapper: Wrapper });

    const trigger = await screen.findByRole('button', { name: 'Abrir menu do usuário' });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('menuitem', { name: 'Minha conta' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  /**
   * The authenticated menu uses the approved design-system surface and spacing.
   * Mock: getCurrentUser resolves with a complete profile and the trigger is clicked.
   * Assert: content and items expose the card, muted-hover, width and shadow tokens.
   */
  test('keeps the approved dropdown visual tokens', async () => {
    const user = userEvent.setup();
    setSession('jwt-token');
    mockedGetCurrentUser.mockResolvedValue({
      name: 'João Teste',
      email: 'joao@teste.com',
      google_id: 'google-123',
    });
    render(<Header />, { wrapper: Wrapper });

    await user.click(await screen.findByRole('button', { name: 'Abrir menu do usuário' }));

    const content = await screen.findByRole('menu');
    expect(content).toHaveClass('min-w-40', 'bg-card', 'border-border', 'z-[100]');
    expect(content).toHaveClass('shadow-[0_4px_12px_hsl(var(--foreground)/0.06)]');
    expect(screen.getByRole('menuitem', { name: 'Minha conta' })).toHaveClass(
      'px-3',
      'py-2',
      'text-[0.8125rem]',
      'hover:bg-muted',
    );
  });
});
