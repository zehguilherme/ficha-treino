import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClearWorkoutDialog } from './ClearWorkoutDialog';

describe('ClearWorkoutDialog', () => {
  test('renders the confirmation content and closes through X, cancel, and Escape', async () => {
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
