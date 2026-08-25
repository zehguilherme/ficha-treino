jest.mock('@/lib/api', () => ({
  addWorkoutExercise: jest.fn(),
  getExercises: jest.fn(),
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
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
   * User clicks the page outside the exercise search dialog.
   * Mock: the authenticated exercise catalog is empty.
   * Assert: the dialog closes and focus returns to its trigger.
   */
  test('closes and restores trigger focus after clicking outside', async () => {
    const user = userEvent.setup();

    renderDialog();

    const trigger = screen.getByRole('button', { name: 'Adicionar exercício' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Adicionar exercício' });
    const overlay = dialog.parentElement?.querySelector('[data-state="open"]:not([role])');
    if (!overlay) throw new Error('Dialog overlay was not rendered');
    await user.click(overlay);

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

  /**
   * A search result exposes its main action with the primary button treatment.
   * Mock: the catalog returns one exercise after the dialog opens.
   * Assert: the result action uses the filled default variant.
   */
  test('renders the result add action as a primary button', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValueOnce({
      items: [
        {
          id: 'abdominais-obliquos',
          name: 'Abdominais oblíquos',
          force: null,
          level: 'beginner',
          mechanic: null,
          equipment: 'body only',
          primaryMuscles: ['abdominais'],
          secondaryMuscles: [],
          instructions: ['Deite-se no chão.'],
          category: 'strength',
          images: ['abdominais-obliquos/0.jpg'],
        },
      ],
      total: 1,
    });

    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'abdominais');

    const addButton = await screen.findByRole(
      'button',
      { name: 'Adicionar Abdominais oblíquos' },
      { timeout: 3000 },
    );
    expect(addButton).toHaveClass('bg-foreground', 'text-primary-foreground');
    expect(addButton).toHaveClass('w-full', 'sm:w-auto');

    const resultItem = addButton.closest('li');
    if (!resultItem) throw new Error('Exercise result item was not rendered');
    const resultActions = addButton.parentElement;
    expect(resultActions).toHaveClass('flex-col', 'sm:flex-row', 'sm:items-center');
    expect(
      within(resultItem).getByRole('heading', { name: 'Abdominais oblíquos' }),
    ).toBeInTheDocument();
    expect(resultActions?.children[1]).toContainElement(addButton);
  });
});
