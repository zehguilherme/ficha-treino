import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomExerciseMenu } from './CustomExerciseMenu';

describe('CustomExerciseMenu', () => {
  test('opens the menu and calls the edit and remove actions', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onRemove = jest.fn();

    render(
      <CustomExerciseMenu
        exerciseName="Supino reto"
        disabled={false}
        triggerRef={createRef<HTMLButtonElement>()}
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Ações para Supino reto' }));
    await user.click(screen.getByRole('menuitem', { name: /Editar/ }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Ações para Supino reto' }));
    await user.click(screen.getByRole('menuitem', { name: /Remover/ }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test('disables the menu trigger when an action is pending', () => {
    render(
      <CustomExerciseMenu
        exerciseName="Supino reto"
        disabled
        triggerRef={createRef<HTMLButtonElement>()}
        onEdit={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Ações para Supino reto' })).toBeDisabled();
  });

  test('supports keyboard navigation and restores focus after Escape', async () => {
    const user = userEvent.setup();
    render(
      <CustomExerciseMenu
        exerciseName="Supino reto"
        disabled={false}
        triggerRef={createRef<HTMLButtonElement>()}
        onEdit={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Ações para Supino reto' });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('menuitem', { name: /Editar/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
