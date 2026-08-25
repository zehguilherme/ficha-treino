import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RemoveWorkoutExerciseDialog } from './RemoveWorkoutExerciseDialog';

describe('RemoveWorkoutExerciseDialog', () => {
  test('renders confirmation content and closes with cancel', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RemoveWorkoutExerciseDialog
        open
        onOpenChange={onOpenChange}
        exerciseName="Supino reto"
        isPending={false}
        onConfirm={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Remover exercício?');
    expect(dialog).toHaveTextContent('Supino reto');
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sim, remover' })).toBeInTheDocument();
    const primaryAction = screen.getByRole('button', { name: 'Sim, remover' });
    const secondaryAction = screen.getByRole('button', { name: 'Cancelar' });
    expect(primaryAction.compareDocumentPosition(secondaryAction)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(primaryAction).toHaveClass('w-full', 'sm:w-auto');
    expect(secondaryAction).toHaveClass('w-full', 'sm:w-auto');

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * User presses Escape while the remove confirmation is open.
   * Mock: the confirmation is controlled by an open change spy.
   * Assert: Escape requests dismissal.
   */
  test('closes through Escape', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RemoveWorkoutExerciseDialog
        open
        onOpenChange={onOpenChange}
        exerciseName="Supino reto"
        isPending={false}
        onConfirm={jest.fn()}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * User clicks the page outside the remove confirmation.
   * Mock: the destructive confirmation is open and idle.
   * Assert: clicking outside does not dismiss it.
   */
  test('remains open after clicking outside', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RemoveWorkoutExerciseDialog
        open
        onOpenChange={onOpenChange}
        exerciseName="Supino reto"
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
   * User presses Escape while removing is pending.
   * Mock: destructive operation controls are disabled while the request runs.
   * Assert: Escape still requests dismissal, matching the selected interaction policy.
   */
  test('allows Escape while the remove operation is pending', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RemoveWorkoutExerciseDialog
        open
        onOpenChange={onOpenChange}
        exerciseName="Supino reto"
        isPending
        onConfirm={jest.fn()}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('confirms the action and disables controls while pending', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <RemoveWorkoutExerciseDialog
        open
        onOpenChange={jest.fn()}
        exerciseName="Supino reto"
        isPending={false}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sim, remover' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <RemoveWorkoutExerciseDialog
        open
        onOpenChange={jest.fn()}
        exerciseName="Supino reto"
        isPending
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('button', { name: /Removendo…/ })).toBeDisabled();
    expect(screen.getByRole('status', { name: 'Carregando' })).toHaveAttribute(
      'data-icon',
      'inline-start',
    );
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled();
  });
});
