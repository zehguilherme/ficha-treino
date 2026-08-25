import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClearWorkoutDialog } from './ClearWorkoutDialog';

describe('ClearWorkoutDialog', () => {
  test('renders the confirmation content and closes through X and cancel', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <ClearWorkoutDialog
        open
        onOpenChange={onOpenChange}
        dayName="Terça-feira"
        isPending={false}
        onConfirm={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Limpar treino?');
    expect(dialog).toHaveTextContent('Esta ação irá desmarcar todos os exercícios de Terça-feira.');
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sim, limpar' })).toBeInTheDocument();
    const primaryAction = screen.getByRole('button', { name: 'Sim, limpar' });
    const secondaryAction = screen.getByRole('button', { name: 'Cancelar' });
    expect(primaryAction.compareDocumentPosition(secondaryAction)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(primaryAction).toHaveClass('w-full', 'sm:w-auto');
    expect(secondaryAction).toHaveClass('w-full', 'sm:w-auto');

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * User presses Escape while the clear confirmation is open.
   * Mock: the confirmation is controlled by an open change spy.
   * Assert: Escape requests dismissal.
   */
  test('closes through Escape', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <ClearWorkoutDialog
        open
        onOpenChange={onOpenChange}
        dayName="Terça-feira"
        isPending={false}
        onConfirm={jest.fn()}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * User clicks the page outside the clear confirmation.
   * Mock: the destructive confirmation is open and idle.
   * Assert: clicking outside does not dismiss it.
   */
  test('remains open after clicking outside', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <ClearWorkoutDialog
        open
        onOpenChange={onOpenChange}
        dayName="Terça-feira"
        isPending={false}
        onConfirm={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('alertdialog');
    const overlay = dialog.parentElement?.querySelector('[data-state="open"]:not([role])');
    if (!overlay) throw new Error('Alert dialog overlay was not rendered');
    await user.click(overlay);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * User presses Escape while clearing is pending.
   * Mock: destructive operation controls are disabled while the request runs.
   * Assert: Escape still requests dismissal, matching the selected interaction policy.
   */
  test('allows Escape while the clear operation is pending', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <ClearWorkoutDialog
        open
        onOpenChange={onOpenChange}
        dayName="Terça-feira"
        isPending
        onConfirm={jest.fn()}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('confirms the action and shows the pending state', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ClearWorkoutDialog
        open
        onOpenChange={jest.fn()}
        dayName="Terça-feira"
        isPending={false}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sim, limpar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <ClearWorkoutDialog
        open
        onOpenChange={jest.fn()}
        dayName="Terça-feira"
        isPending
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('button', { name: /Limpando…/ })).toBeDisabled();
    expect(screen.getByRole('status', { name: 'Carregando' })).toHaveAttribute(
      'data-icon',
      'inline-start',
    );
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Limpando…/ })).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    );
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    );
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    );
  });
});
