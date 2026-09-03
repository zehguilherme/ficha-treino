import { render, screen } from '@testing-library/react';
import { UserInitialsButton } from './UserInitialsButton';

describe('UserInitialsButton', () => {
  /**
   * An authenticated user has a complete name.
   * Mock: the button receives the user's name.
   * Assert: initials, accessible name and visual sizing are preserved.
   */
  test('renders the user initials button with the existing design', () => {
    render(<UserInitialsButton name="João Teste" />);

    const button = screen.getByRole('button', { name: 'Abrir menu do usuário' });
    expect(button).toHaveTextContent('JT');
    expect(button).toHaveClass('size-8', 'rounded-full', 'bg-muted');
  });
});
