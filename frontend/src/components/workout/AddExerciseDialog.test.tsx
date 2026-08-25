jest.mock('@/lib/api', () => ({
  addWorkoutExercise: jest.fn(),
  getExercises: jest.fn(),
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { getExercises } from '@/lib/api';
import { AddExerciseDialog } from './AddExerciseDialog';

const mockedGetExercises = jest.mocked(getExercises);

const renderDialog = (): void => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <DialogHarness />
    </QueryClientProvider>,
  );
};

const DialogHarness = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Adicionar exercício
      </Button>
      <AddExerciseDialog
        weekDay="TERCA"
        open={open}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
      />
    </>
  );
};

describe('AddExerciseDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });
  });

  /**
   * User opens the exercise search and closes it with Escape.
   * Mock: the authenticated exercise catalog is empty.
   * Assert: the search receives focus and the trigger regains focus after closing.
   */
  test('opens with the search focused and restores trigger focus after Escape', async () => {
    const user = userEvent.setup();

    renderDialog();

    const trigger = screen.getByRole('button', { name: 'Adicionar exercício' });
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Adicionar exercício' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Adicionar exercício' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  /**
   * User clears a typed exercise search with the input clear button.
   * Mock: the authenticated exercise catalog is empty.
   * Assert: the search is empty and retains focus after clearing.
   */
  test('returns focus to the search after clearing it', async () => {
    const user = userEvent.setup();

    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'triceps');
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));

    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
  });
});
