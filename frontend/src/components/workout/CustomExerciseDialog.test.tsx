import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { CustomExerciseDialog } from './CustomExerciseDialog';

describe('CustomExerciseDialog', () => {
  test('keeps cancel before the primary action in DOM and Tab order', async () => {
    const user = userEvent.setup();

    render(
      <CustomExerciseDialog open onOpenChange={jest.fn()} isPending={false} onSubmit={jest.fn()} />,
    );

    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    const primary = screen.getByRole('button', { name: 'Criar exercício personalizado' });
    expect(cancel.parentElement).toHaveClass('flex-col', 'sm:flex-row');
    expect(cancel.parentElement).not.toHaveClass('flex-col-reverse');
    expect(cancel.compareDocumentPosition(primary)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(screen.getByRole('textbox', { name: 'Nome do exercício' })).toHaveFocus();
    await user.type(screen.getByRole('textbox', { name: 'Nome do exercício' }), 'Teste');
    await user.click(screen.getByRole('combobox', { name: 'Músculo principal' }));
    await user.click(await screen.findByRole('option', { name: 'Peito' }));
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab();
    expect(primary).toHaveFocus();
  });

  test('submits the custom exercise name and primary muscle', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <CustomExerciseDialog open onOpenChange={jest.fn()} isPending={false} onSubmit={onSubmit} />,
    );

    await user.type(
      screen.getByRole('textbox', { name: 'Nome do exercício' }),
      'Supino personalizado',
    );
    await user.click(screen.getByRole('combobox', { name: 'Músculo principal' }));
    await user.click(await screen.findByRole('option', { name: 'Peito' }));
    await user.click(screen.getByRole('button', { name: 'Criar exercício personalizado' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Supino personalizado', primaryMuscle: 'peito' });
  });

  test('shows and clears the name error after the field loses focus', async () => {
    const user = userEvent.setup();

    render(
      <CustomExerciseDialog open onOpenChange={jest.fn()} isPending={false} onSubmit={jest.fn()} />,
    );

    const name = screen.getByRole('textbox', { name: 'Nome do exercício' });
    expect(screen.queryByText('Informe pelo menos 2 caracteres.')).not.toBeInTheDocument();

    await user.click(name);
    await user.tab();
    expect(screen.getByText('Informe pelo menos 2 caracteres.')).toBeInTheDocument();
    expect(name.compareDocumentPosition(screen.getByText('Informe pelo menos 2 caracteres.'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAttribute('aria-describedby', 'custom-exercise-name-error');

    await user.type(name, 'A');
    expect(screen.getByText('Informe pelo menos 2 caracteres.')).toBeInTheDocument();
    await user.type(name, 'B');
    expect(screen.queryByText('Informe pelo menos 2 caracteres.')).not.toBeInTheDocument();
    expect(name).toHaveAttribute('aria-invalid', 'false');
  });

  test('shows the muscle error only after leaving the select without choosing', async () => {
    const user = userEvent.setup();

    render(
      <CustomExerciseDialog open onOpenChange={jest.fn()} isPending={false} onSubmit={jest.fn()} />,
    );

    const muscle = screen.getByRole('combobox', { name: 'Músculo principal' });
    await user.click(muscle);
    expect(screen.queryByText('Selecione o músculo principal.')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.tab();

    expect(screen.getByText('Selecione o músculo principal.')).toBeInTheDocument();
    expect(muscle).toHaveAttribute('aria-invalid', 'true');
    expect(muscle).toHaveAttribute('aria-describedby', 'custom-exercise-muscle-error');
    expect(muscle.compareDocumentPosition(screen.getByText('Selecione o músculo principal.'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    await user.click(muscle);
    await user.click(await screen.findByRole('option', { name: 'Peito' }));
    expect(screen.queryByText('Selecione o músculo principal.')).not.toBeInTheDocument();
    expect(muscle).toHaveAttribute('aria-invalid', 'false');
  });

  test('shows the empty name error after a mouse click moves to another field', async () => {
    const user = userEvent.setup();

    render(
      <CustomExerciseDialog open onOpenChange={jest.fn()} isPending={false} onSubmit={jest.fn()} />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Músculo principal' }));

    expect(screen.getByText('Informe pelo menos 2 caracteres.')).toBeInTheDocument();
  });

  test('shows the muscle error after dismissing the open select and clicking another field', async () => {
    const user = userEvent.setup();

    render(
      <CustomExerciseDialog open onOpenChange={jest.fn()} isPending={false} onSubmit={jest.fn()} />,
    );

    const muscle = screen.getByRole('combobox', { name: 'Músculo principal' });
    await user.click(muscle);
    expect(screen.queryByText('Selecione o músculo principal.')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    const name = document.querySelector<HTMLInputElement>('#custom-exercise-name');
    expect(name).not.toBeNull();
    await user.click(name as HTMLInputElement);

    expect(screen.getByText('Selecione o músculo principal.')).toBeInTheDocument();
  });

  test('validates an edited exercise after its name is cleared', async () => {
    const user = userEvent.setup();

    render(
      <CustomExerciseDialog
        open
        onOpenChange={jest.fn()}
        isPending={false}
        initialExercise={{
          id: 'custom-1',
          name: 'Supino personalizado',
          isCustom: true,
          force: null,
          level: null,
          mechanic: null,
          equipment: null,
          primaryMuscles: ['peito'],
          secondaryMuscles: [],
          instructions: [],
          category: null,
          images: [],
        }}
        onSubmit={jest.fn()}
      />,
    );

    const name = screen.getByRole('textbox', { name: 'Nome do exercício' });
    expect(name).toHaveValue('Supino personalizado');
    expect(screen.queryByText('Informe pelo menos 2 caracteres.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Editar exercício personalizado' }),
    ).toBeInTheDocument();

    await user.clear(name);
    await user.tab();

    expect(screen.getByText('Informe pelo menos 2 caracteres.')).toBeInTheDocument();
  });
});
