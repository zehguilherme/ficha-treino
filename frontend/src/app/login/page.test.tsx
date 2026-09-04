import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/auth/LoginGate', () => ({
  LoginGate: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/auth/LoginForm', () => ({
  LoginForm: () => <div>Login form</div>,
}));

import LoginPage from './page';

describe('LoginPage', () => {
  /**
   * The public login page includes the shared site footer.
   * Mock: authentication gate and login form are isolated from the page shell.
   * Assert: the footer landmark is rendered alongside the login content.
   */
  test('renders the shared footer', () => {
    render(<LoginPage />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
