import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  /**
   * Disabled native buttons expose the unavailable state without removing the cursor target.
   * Assert: disabled cursor and opacity classes are present.
   */
  test('shows the not-allowed cursor when disabled', () => {
    render(<Button disabled>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    );
  });

  /**
   * A disabled Button rendered as a link must remain focusable but inert.
   * Assert: aria-disabled is exposed and the click handler is not called.
   */
  test('blocks actions for disabled links rendered with asChild', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/blocked">Blocked</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Blocked' });
    await user.click(link);

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveClass('aria-disabled:cursor-not-allowed');
    expect(onClick).not.toHaveBeenCalled();
  });
});
