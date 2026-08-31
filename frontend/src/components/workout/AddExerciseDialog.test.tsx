jest.mock('@/lib/api', () => ({
  addWorkoutExercise: jest.fn(),
  getExercises: jest.fn(),
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { addWorkoutExercise, getExercises } from '@/lib/api';
import { AddExerciseDialog } from './AddExerciseDialog';

const mockedGetExercises = jest.mocked(getExercises);
const mockedAddWorkoutExercise = jest.mocked(addWorkoutExercise);

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
    mockedAddWorkoutExercise.mockResolvedValue({
      id: 1,
      exerciseId: 'abdominais-obliquos',
      done: false,
    });
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

  test('clears only the search text when its clear button is clicked', async () => {
    const user = userEvent.setup();

    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));

    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));

    expect(search).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveTextContent('Força');

    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    expect(screen.getByText('Categoria: Força')).toBeInTheDocument();
  });

  test('keeps the search button disabled until text or a filter is provided', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));

    const searchButton = screen.getByRole('button', { name: 'Pesquisar exercícios' });
    expect(searchButton).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(mockedGetExercises).not.toHaveBeenCalled();
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveFocus();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    expect(searchButton).toBeEnabled();
  });

  test('disables clearing when there are no filters or exercise results', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));

    expect(screen.getByRole('button', { name: 'Limpar busca e filtros' })).toBeDisabled();
  });

  test('submits the same search action when pressing Enter', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(mockedGetExercises).toHaveBeenCalledWith('supino', 20, 0, expect.any(AbortSignal)),
    );
  });

  test('renders one labeled select for each exercise filter', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));

    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveAttribute(
      'placeholder',
      'Buscar pelo nome do exercício...',
    );
    expect(screen.getByText('Selecionar categoria')).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));

    expect(screen.getByRole('button', { name: 'Pesquisar exercícios' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toBeVisible();
    const filterPanel = screen.getByRole('region', { name: 'Filtros de exercícios' });
    expect(filterPanel).toHaveClass('border-border', 'bg-muted/50', 'p-3');
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveClass('bg-card');
    expect(
      within(filterPanel).queryByRole('button', { name: 'Limpar busca e filtros' }),
    ).toBeNull();
    expect(within(filterPanel).queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Limpar busca e filtros' })).toHaveClass(
      'w-full',
      'sm:w-auto',
    );
    expect(within(filterPanel).queryByRole('button', { name: 'Pesquisar exercícios' })).toBeNull();
    for (const definition of [
      'Categoria',
      'Equipamento',
      'Nível',
      'Tipo de força',
      'Mecânica',
      'Músculo primário',
      'Músculo secundário',
    ]) {
      expect(screen.getByRole('combobox', { name: definition })).toBeInTheDocument();
    }
  });

  test('renders level options from beginner to advanced', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Nível' }));

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Iniciante',
      'Intermediário',
      'Avançado',
    ]);
  });

  test('renders force type options alphabetically', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Tipo de força' }));

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Empurrar',
      'Estático',
      'Puxar',
    ]);
  });

  test('shows active filter chips and removes only the selected filter', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));
    await user.click(screen.getByRole('combobox', { name: 'Nível' }));
    await user.click(screen.getByRole('option', { name: 'Iniciante' }));

    expect(screen.getByText('Categoria: Força')).toBeInTheDocument();
    expect(screen.getByText('Nível: Iniciante')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    expect(screen.getByText('Categoria: Força')).toBeInTheDocument();
    expect(screen.getByText('Nível: Iniciante')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Pesquisa iniciada com 2 filtros.');
    await screen.findByText('Nenhum exercício encontrado.');
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveFocus();

    const callsBeforeRemovingChip = mockedGetExercises.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Remover filtro Categoria' }));

    expect(screen.queryByText('Categoria: Força')).not.toBeInTheDocument();
    expect(screen.getByText('Nível: Iniciante')).toBeInTheDocument();
    expect(mockedGetExercises).toHaveBeenCalledTimes(callsBeforeRemovingChip);
    expect(screen.getByRole('button', { name: 'Pesquisar exercícios' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveTextContent(
      'Selecionar categoria',
    );
  });

  test('preserves provisional filters when the panel is closed and reopened', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));

    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveTextContent('Força');
  });

  test('shows selected filter chips immediately and places actions below the filters', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    const filterPanel = screen.getByRole('region', { name: 'Filtros de exercícios' });
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));

    expect(screen.getByText('Categoria: Força')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Adicionar exercício' })).toHaveClass(
      'min-w-0',
      'max-w-3xl',
    );
    expect(screen.getByLabelText('Filtros ativos')).toHaveClass(
      'min-w-0',
      'overflow-x-auto',
      'overscroll-x-contain',
    );
    const clearButton = screen.getByRole('button', { name: 'Limpar busca e filtros' });
    const searchButton = screen.getByRole('button', { name: 'Pesquisar exercícios' });
    expect(
      filterPanel.compareDocumentPosition(clearButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      filterPanel.compareDocumentPosition(searchButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(filterPanel).not.toHaveClass('h-full');
    expect(filterPanel).toHaveClass('min-w-0');
    expect(document.querySelector('[data-slot="exercise-search-results"]')).toHaveClass(
      'min-w-0',
      'overflow-y-auto',
    );
    expect(document.querySelector('[data-slot="exercise-search-results"]')).toHaveClass(
      'mt-4',
      'flex-1',
    );
  });

  test('clears all search and returns to the initial empty state', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'supino-reto',
          name: 'Supino reto',
          force: 'push',
          level: 'iniciante',
          mechanic: 'composto',
          equipment: 'barra',
          primaryMuscles: ['peito'],
          secondaryMuscles: [],
          instructions: ['Deite-se no banco.'],
          category: 'forca',
          images: ['supino-reto/0.jpg'],
        },
      ],
      total: 1,
    });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await screen.findByText('Supino reto');
    const callsBeforeClear = mockedGetExercises.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'Limpar busca e filtros' }));

    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveValue('');
    expect(screen.queryByText('Categoria: Força')).not.toBeInTheDocument();
    expect(screen.queryByText('Supino reto')).not.toBeInTheDocument();
    expect(mockedGetExercises).toHaveBeenCalledTimes(callsBeforeClear);
    expect(screen.getByRole('button', { name: 'Limpar busca e filtros' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveFocus();
  });

  test('resets the filters section when the dialog closes', async () => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText('Categoria: Força')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Adicionar exercício' })).not.toBeInTheDocument();
  });

  test('resets search, filters, and results after closing and reopening', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'supino-reto',
          name: 'Supino reto',
          force: 'push',
          level: 'iniciante',
          mechanic: 'composto',
          equipment: 'barra',
          primaryMuscles: ['peito'],
          secondaryMuscles: [],
          instructions: ['Deite-se no banco.'],
          category: 'forca',
          images: ['supino-reto/0.jpg'],
        },
      ],
      total: 1,
    });

    renderDialog();
    const trigger = screen.getByRole('button', { name: 'Adicionar exercício' });
    await user.click(trigger);
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await screen.findByText('Supino reto');

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await user.click(trigger);

    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveValue('');
    expect(screen.queryByText('Supino reto')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remover filtro/ })).not.toBeInTheDocument();
  });

  test('searches using the selected filter and clears it without a Todos option', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));

    expect(mockedGetExercises).not.toHaveBeenCalled();
    expect(screen.queryByRole('option', { name: 'Todos' })).not.toBeInTheDocument();

    const clearFilterButton = screen.getByRole('button', { name: 'Limpar filtro Categoria' });
    expect(clearFilterButton.parentElement).toHaveClass('relative');
    expect(clearFilterButton).toHaveClass('absolute', 'right-2', 'top-1/2', '-translate-y-1/2');

    await user.click(clearFilterButton);
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveTextContent(
      'Selecionar categoria',
    );

    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    expect(mockedGetExercises).not.toHaveBeenCalled();
  });

  test('combines the name with selected filters', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Nível' }));
    await user.click(screen.getByRole('option', { name: 'Iniciante' }));

    expect(mockedGetExercises).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    await screen.findByText('Nenhum exercício encontrado.');
    await waitFor(() =>
      expect(mockedGetExercises).toHaveBeenCalledWith(
        'supino',
        20,
        0,
        expect.any(AbortSignal),
        expect.objectContaining({ level: 'iniciante' }),
      ),
    );
  });

  test('searches only after clicking the search button and closes the filters', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');

    expect(screen.getByRole('dialog', { name: 'Adicionar exercício' })).toHaveClass(
      'grid-rows-[auto_auto_auto_minmax(0,1fr)]',
    );
    expect(mockedGetExercises).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await waitFor(() =>
      expect(mockedGetExercises).toHaveBeenCalledWith('supino', 20, 0, expect.any(AbortSignal)),
    );
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveFocus();
  });

  test('removes focus from the search input when submitting with Enter', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(mockedGetExercises).toHaveBeenCalled());
    expect(search).not.toHaveFocus();
  });

  test('returns the results scroll to the top after a new search', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await screen.findByText('Nenhum exercício encontrado.');

    const results = document.querySelector<HTMLElement>('[data-slot="exercise-search-results"]');
    if (!results) throw new Error('Exercise results container was not rendered');
    results.scrollTop = 240;

    await user.clear(search);
    await user.type(search, 'agachamento');
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    expect(results.scrollTop).toBe(0);
  });

  test('resets pagination when a filter changes', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValueOnce({
      items: [
        {
          id: 'supino-reto',
          name: 'Supino reto',
          force: 'push',
          level: 'iniciante',
          mechanic: 'composto',
          equipment: 'barra',
          primaryMuscles: ['peito'],
          secondaryMuscles: [],
          instructions: ['Deite-se no banco.'],
          category: 'forca',
          images: ['supino-reto/0.jpg'],
        },
      ],
      total: 21,
    });
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'agachamento-livre',
          name: 'Agachamento livre',
          force: 'push',
          level: 'iniciante',
          mechanic: 'composto',
          equipment: 'barra',
          primaryMuscles: ['quadriceps'],
          secondaryMuscles: [],
          instructions: ['Fique em pé.'],
          category: 'forca',
          images: ['agachamento-livre/0.jpg'],
        },
      ],
      total: 21,
    });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await screen.findByRole('button', { name: 'Carregar mais exercícios' });

    await user.click(screen.getByRole('button', { name: 'Carregar mais exercícios' }));
    await waitFor(() =>
      expect(mockedGetExercises).toHaveBeenLastCalledWith(
        '',
        20,
        20,
        expect.any(AbortSignal),
        expect.objectContaining({ category: 'forca' }),
      ),
    );

    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Cardio' }));
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await waitFor(() =>
      expect(mockedGetExercises).toHaveBeenLastCalledWith(
        '',
        20,
        0,
        expect.any(AbortSignal),
        expect.objectContaining({ category: 'cardio' }),
      ),
    );
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
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    const addButton = await screen.findByRole(
      'button',
      { name: 'Adicionar Abdominais oblíquos' },
      { timeout: 3000 },
    );
    expect(addButton).toHaveClass('bg-foreground', 'text-primary-foreground');
    expect(addButton).toHaveClass('max-[640px]:w-full');

    const resultItem = addButton.closest('li');
    if (!resultItem) throw new Error('Exercise result item was not rendered');
    const resultActions = addButton.parentElement;
    expect(resultActions).toHaveClass('flex', 'items-center', 'border-t', 'border-border');
    expect(
      within(resultItem).getByRole('heading', { name: 'Abdominais oblíquos' }),
    ).toBeInTheDocument();
    expect(resultActions?.children[1]).toContainElement(addButton);
  });

  /**
   * A user opens instructions for an exercise found in the catalog.
   * Mock: the catalog returns one exercise with one instruction.
   * Assert: the result uses the shared card instruction interaction.
   */
  test('renders and toggles result instructions', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    const instructionsButton = await screen.findByRole(
      'button',
      { name: 'Instruções: Abdominais oblíquos' },
      { timeout: 3000 },
    );
    await user.click(instructionsButton);

    expect(screen.getByText('• Deite-se no chão.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Feito: Abdominais oblíquos' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remover Abdominais oblíquos' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Adicionar Abdominais oblíquos' }));
    expect(mockedAddWorkoutExercise).toHaveBeenCalledWith('TERCA', 'abdominais-obliquos');
  });
});
