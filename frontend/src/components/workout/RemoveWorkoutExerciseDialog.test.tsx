import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RemoveWorkoutExerciseDialog } from './RemoveWorkoutExerciseDialog';

describe('RemoveWorkoutExerciseDialog', () => {
  test('renders confirmation content and closes with cancel or Escape', async () => {
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
