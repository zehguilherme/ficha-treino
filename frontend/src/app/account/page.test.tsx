jest.mock('@/lib/api', () => ({
  deleteAccount: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/account'),
}));

import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAccount } from '@/lib/api';
import { useRouter } from 'next/navigation';
import AccountPage from './page';

const mockedUseAuth = jest.mocked(useAuth);
const mockedDeleteAccount = jest.mocked(deleteAccount);
const mockedUseRouter = jest.mocked(useRouter);

const renderPage = (): void => {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <AccountPage />
    </QueryClientProvider>,
  );
};

describe('AccountPage', () => {
  const replace = jest.fn();
  const logout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: jest.fn(),
      prefetch: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      user: { name: 'Maria Silva', email: 'maria@example.com' },
      isProfilePending: false,
      isProfileError: false,
      refetchProfile: jest.fn().mockResolvedValue(undefined),
      login: jest.fn(),
      logout,
    });
    mockedDeleteAccount.mockResolvedValue({ message: 'Conta excluída' });
  });

  /**
   * Account loading fills the page so the indicator is centered like other page loadings.
   * Mock: auth status is still loading and no user is available.
   * Assert: the loading state uses the full-page centered main container.
   */
  test('centers the loading state across the full page', () => {
    mockedUseAuth.mockReturnValue({
      status: 'loading',
      user: undefined,
      isProfilePending: false,
      isProfileError: false,
      refetchProfile: jest.fn().mockResolvedValue(undefined),
      login: jest.fn(),
      logout,
    });
    renderPage();

    expect(screen.getByRole('main')).toHaveClass(
      'flex',
      'flex-1',
      'items-center',
      'justify-center',
      'bg-background',
    );
  });

  /**
   * Profile request fails after authentication is available.
   * Mock: auth exposes a profile error and a retry function.
   * Assert: the error dialog and an accessible retry action are shown.
   */
  test('shows profile loading error and retries the request', async () => {
    const refetchProfile = jest.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      user: undefined,
      isProfilePending: false,
      isProfileError: true,
      refetchProfile,
      login: jest.fn(),
      logout,
    });
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('alertdialog')).getAllByRole('button', { name: 'Fechar' })[0],
    );
    const retryButton = screen.getByRole('button', { name: 'Tentar novamente' });
    await user.click(retryButton);

    expect(refetchProfile).toHaveBeenCalledTimes(1);
  });

  test('shows profile and opens confirmation modal', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Minha Conta' })).toBeInTheDocument();
    expect(screen.queryByText('Ficha de Treino')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveClass('transition-all');
    expect(screen.getByRole('button', { name: 'Abrir menu do usuário' })).toHaveTextContent('MS');
    expect(screen.getByRole('button', { name: 'Excluir minha conta' })).toHaveClass(
      'w-full',
      'sm:w-auto',
      'rounded-[var(--radius)]',
      'transition-all',
    );
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar de Maria Silva')).toHaveTextContent('MS');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Excluir conta?' })).toBeInTheDocument();
  });

  test('logs out from the account menu', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Abrir menu do usuário' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/login');
  });

  test('deletes account, logs out, and redirects to login', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

    await waitFor(() => expect(mockedDeleteAccount).toHaveBeenCalledTimes(1));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/login');
  });

  test('closes confirmation with cancel and Escape', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('redirects anonymous users to login', async () => {
    mockedUseAuth.mockReturnValue({
      status: 'anonymous',
      user: undefined,
      isProfilePending: false,
      isProfileError: false,
      refetchProfile: jest.fn().mockResolvedValue(undefined),
      login: jest.fn(),
      logout,
    });
    renderPage();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
  });
});
