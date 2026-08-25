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
   * Primary buttons expose the shared visible focus treatment.
   * Assert: the default button includes the two-pixel focus ring.
   */
  test('uses the shared two-pixel visible focus ring', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
    );
  });

  /**
   * Primary and secondary text actions share the same base touch target.
   * Assert: default and outline variants use the shared 36px button spacing.
   */
  test('keeps default and outline variants at the same base size', () => {
    render(
      <>
        <Button>Primária</Button>
        <Button variant="outline">Secundária</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Primária' })).toHaveClass('px-4', 'py-2', 'text-sm');
    expect(screen.getByRole('button', { name: 'Secundária' })).toHaveClass(
      'px-4',
      'py-2',
      'text-sm',
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

  /**
   * Loading native buttons expose a busy disabled state and the standard inline spinner.
   * Assert: spinner is rendered before the label with the shadcn icon position attribute.
   */
  test('renders an inline spinner while loading', () => {
    render(<Button loading>Salvar</Button>);

    const button = screen.getByRole('button', { name: /Salvar/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('[role="status"]')).toHaveAttribute('data-icon', 'inline-start');
    expect(button.textContent?.indexOf('Salvar')).toBeGreaterThan(-1);
  });

  /**
   * Loading links rendered through Button asChild remain inert during an async operation.
   * Assert: aria-disabled, aria-busy and the inline spinner are present.
   */
  test('renders loading state for links rendered with asChild', () => {
    render(
      <Button asChild loading>
        <a href="/saving">Salvar</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: /Salvar/ });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link.querySelector('[role="status"]')).toHaveAttribute('data-icon', 'inline-start');
  });
});
