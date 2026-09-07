jest.mock('@/lib/api', () => ({
  addWorkoutExercise: jest.fn(),
  getExercises: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated' }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), warning: jest.fn() },
}));

const mockedReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ weekDay: 'TERCA' })),
  useRouter: jest.fn(() => ({ replace: mockedReplace })),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { addWorkoutExercise, getExercises } from '@/lib/api';
import AddExercisePage from './page';

const mockedGetExercises = jest.mocked(getExercises);
const mockedAddWorkoutExercise = jest.mocked(addWorkoutExercise);

const renderPage = (): void => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AddExercisePage />
    </QueryClientProvider>,
  );
};

describe('AddExercisePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: jest.fn() });
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });
    mockedAddWorkoutExercise.mockResolvedValue({ id: 1, exerciseId: 'supino-reto', done: false });
  });

  test('renders a full-page exercise search with a link back to the workout', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Adicionar exercício', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o treino' })).toHaveAttribute(
      'href',
      '/workout/TERCA',
    );
    expect(screen.getByRole('button', { name: 'Mais filtros' }).parentElement).toHaveClass('mt-3');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /**
   * A user scrolls through a long exercise catalog and needs to refine the search.
   * Mock: the authenticated dedicated add-exercise page renders its existing controls.
   * Assert: only the compact search controls stay sticky; the expanded filter panel remains in normal flow.
   */
  test('keeps compact search controls sticky while filters stay collapsible in page flow', async () => {
    renderPage();

    const shell = document.querySelector('[data-slot="exercise-search-shell"]');
    const controls = document.querySelector('[data-slot="exercise-search-controls"]');
    const filters = document.querySelector('[role="region"][aria-label="Filtros de exercícios"]');

    expect(shell).toHaveClass('contents');
    expect(controls).toHaveClass('sticky', 'top-14', 'z-10');
    expect(filters).not.toHaveClass('sticky');
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  /**
   * A desktop user opens advanced filters while browsing a long catalog.
   * Mock: the dedicated page renders the desktop-responsive search shell.
   * Assert: the compact controls remain sticky while the expanded panel and actions stay in flow.
   */
  test('keeps expanded filters and actions in normal flow on desktop', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));

    const shell = document.querySelector('[data-slot="exercise-search-shell"]');
    const filterPanel = screen.getByRole('region', { name: 'Filtros de exercícios' });
    const searchButton = screen.getByRole('button', { name: 'Pesquisar exercícios' });

    expect(shell).toHaveClass('contents');
    expect(filterPanel.closest('[data-slot="exercise-search-shell"]')).toBe(shell);
    expect(searchButton.closest('[data-slot="exercise-search-shell"]')).toBe(shell);
    expect(filterPanel).not.toHaveClass('sticky');
    expect(searchButton.parentElement).not.toHaveClass('sticky');
  });

  /**
   * A user scrolls while advanced filters are open and needs to apply the draft values.
   * Mock: the dedicated page renders the expanded filter panel and its actions.
   * Assert: the action bar is fixed, safe-area aware, and reserves space below the results.
   */
  test('keeps filter actions fixed and reserves result space while filters are open', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));

    const actionBar = document.querySelector('[data-slot="exercise-action-bar"]');
    const results = document.querySelector('[data-slot="exercise-search-results"]');

    expect(actionBar).toHaveClass(
      'fixed',
      'bottom-0',
      'z-30',
      'pb-[calc(1rem+env(safe-area-inset-bottom))]',
      'sm:flex-row',
    );
    expect(actionBar).not.toHaveClass('sticky');
    expect(results).toHaveClass('pb-32', 'sm:pb-24');
    expect(screen.getByRole('button', { name: 'Limpar busca e filtros' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pesquisar exercícios' })).toBeInTheDocument();
  });

  /**
   * A user confirms a search from the fixed action bar.
   * Mock: the search request returns an empty result set.
   * Assert: the panel closes and focus returns to the advanced filters trigger.
   */
  test('closes filters and restores focus after searching from the action bar', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveFocus();
    expect(document.querySelector('[data-slot="exercise-action-bar"]')).not.toBeInTheDocument();
  });

  /**
   * A user abandons a draft filter selection from the fixed action bar.
   * Mock: the category select contains its normal options and no search request is needed.
   * Assert: all draft values are cleared and focus returns to the filters trigger.
   */
  test('clears draft filters and restores focus from the fixed action bar', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await user.click(screen.getByRole('option', { name: 'Força' }));
    await user.click(screen.getByRole('button', { name: 'Limpar busca e filtros' }));

    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Mais filtros' })).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Remover filtro Categoria' }),
    ).not.toBeInTheDocument();
  });

  /**
   * A user submits a new search after scrolling through previous results.
   * Mock: the browser scroll API is captured while the page submits the search.
   * Assert: the viewport returns to the top of the page.
   */
  test('returns the page scroll to the top when submitting a new search', async () => {
    const user = userEvent.setup();
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderPage();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    scrollTo.mockRestore();
  });

  /**
   * A user opens advanced filters before applying a refined search.
   * Mock: the dedicated page renders the existing collapsible filter controls.
   * Assert: both actions move below the expanded filter panel.
   */
  test('places search actions below expanded filters', async () => {
    const user = userEvent.setup();
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'supino-reto',
          name: 'Supino reto',
          force: 'push',
          level: 'beginner',
          mechanic: 'compound',
          equipment: 'barbell',
          primaryMuscles: ['peito'],
          secondaryMuscles: [],
          instructions: ['Deite-se no banco.'],
          category: 'strength',
          images: ['supino-reto/0.jpg'],
        },
      ],
      total: 1,
    });
    renderPage();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await screen.findByRole('heading', { name: 'Supino reto' });
    await user.click(screen.getByRole('button', { name: 'Mais filtros' }));

    const filterPanel = screen.getByRole('region', { name: 'Filtros de exercícios' });
    const clearButton = screen.getByRole('button', { name: 'Limpar busca e filtros' });
    const searchButton = screen.getByRole('button', { name: 'Pesquisar exercícios' });

    expect(
      filterPanel.compareDocumentPosition(clearButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      filterPanel.compareDocumentPosition(searchButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const results = screen.getByRole('list', { name: 'Resultados da busca' });
    expect(results).toBeVisible();
    expect(
      searchButton.compareDocumentPosition(results) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test('returns to the workout after adding an exercise', async () => {
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'supino-reto',
          name: 'Supino reto',
          force: 'push',
          level: 'beginner',
          mechanic: 'compound',
          equipment: 'barbell',
          primaryMuscles: ['peito'],
          secondaryMuscles: [],
          instructions: ['Deite-se no banco.'],
          category: 'strength',
          images: ['supino-reto/0.jpg'],
        },
      ],
      total: 1,
    });

    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'supino');
    await user.click(screen.getByRole('button', { name: 'Pesquisar exercícios' }));
    await user.click(await screen.findByRole('button', { name: 'Adicionar Supino reto' }));

    await waitFor(() => expect(mockedReplace).toHaveBeenCalledWith('/workout/TERCA'));
    expect(mockedAddWorkoutExercise).toHaveBeenCalledWith('TERCA', 'supino-reto');
  });
});
