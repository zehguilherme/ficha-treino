import { render, screen } from '@testing-library/react';
import { HomeCta } from './HomeCta';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

describe('HomeCta', () => {
  /**
   * An anonymous visitor opens the public landing page.
   * Mock: auth status is anonymous.
   * Assert: the CTA starts the login flow.
   */
  test('links anonymous visitors to login', () => {
    mockedUseAuth.mockReturnValue({
      status: 'anonymous',
      user: undefined,
      isProfilePending: false,
      isProfileError: false,
      refetchProfile: jest.fn().mockResolvedValue(undefined),
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<HomeCta />);

    expect(screen.getByRole('link', { name: 'Começar agora' })).toHaveAttribute('href', '/login');
  });

  /**
   * An authenticated user opens the public landing page.
   * Mock: auth status is authenticated.
   * Assert: the CTA sends the user to their workouts.
   */
  test('links authenticated users to the dashboard', () => {
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      user: undefined,
      isProfilePending: false,
      isProfileError: false,
      refetchProfile: jest.fn().mockResolvedValue(undefined),
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<HomeCta />);

    expect(screen.getByRole('link', { name: 'Ir para meus treinos' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  /**
   * Session hydration has not finished yet.
   * Mock: auth status is loading.
   * Assert: the CTA cannot navigate to an incorrect destination.
   */
  test('disables the CTA while the session is loading', () => {
    mockedUseAuth.mockReturnValue({
      status: 'loading',
      user: undefined,
      isProfilePending: false,
      isProfileError: false,
      refetchProfile: jest.fn().mockResolvedValue(undefined),
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<HomeCta />);

    expect(screen.getByRole('button', { name: /Carregando…/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Carregando…/ })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
