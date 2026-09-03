import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  /**
   * An authenticated user opens the global menu.
   * Mock: the menu enables the account link and receives a logout callback.
   * Assert: both existing menu actions are available with the current surface.
   */
  test('renders the account and logout actions', async () => {
    const user = userEvent.setup();
    render(<UserMenu name="João Teste" showAccountLink onLogout={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Abrir menu do usuário' }));

    expect(screen.getByRole('menuitem', { name: 'Minha conta' })).toHaveAttribute(
      'href',
      '/account',
    );
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  });

  /**
   * The account page uses the same menu without an account link.
   * Mock: showAccountLink is disabled.
   * Assert: only the logout action is exposed.
   */
  test('can hide the account action', async () => {
    const user = userEvent.setup();
    render(<UserMenu name="João Teste" showAccountLink={false} onLogout={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Abrir menu do usuário' }));

    expect(screen.queryByRole('menuitem', { name: 'Minha conta' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  });

  /**
   * An authenticated user navigates the menu by keyboard.
   * Mock: the trigger receives focus before opening.
   * Assert: Radix focuses the first item and restores focus after Escape.
   */
  test('preserves keyboard focus management', async () => {
    const user = userEvent.setup();
    render(<UserMenu name="João Teste" showAccountLink onLogout={jest.fn()} />);

    const trigger = screen.getByRole('button', { name: 'Abrir menu do usuário' });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('menuitem', { name: 'Minha conta' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
