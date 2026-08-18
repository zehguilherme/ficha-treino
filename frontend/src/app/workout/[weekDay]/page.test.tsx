jest.mock('@/lib/api', () => ({
  getWorkout: jest.fn(),
  getExercises: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated' }),
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ weekDay: 'TERCA' }),
}));

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getExercises, getWorkout } from '@/lib/api';
import type { ExercisesResponse } from '@/schemas/api';
import WorkoutDayPage from './page';

const mockedGetWorkout = jest.mocked(getWorkout);
const mockedGetExercises = jest.mocked(getExercises);

const workout = {
  workout: {
    id: 2,
    weekDay: 'TERCA' as const,
    exercises: [
      {
        id: 45,
        done: false,
        exercise: {
          id: 'barbell-bench-press',
          name: 'Supino reto',
          force: 'push',
          level: 'intermediate',
          mechanic: 'compound',
          equipment: 'barbell',
          primaryMuscles: ['peito'],
          secondaryMuscles: ['tríceps'],
          instructions: ['Deite-se no banco.'],
          category: 'strength',
          images: ['0.jpg', '1.jpg'],
        },
      },
    ],
  },
};

const renderPage = (): void => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <WorkoutDayPage />
    </QueryClientProvider>,
  );
};

describe('WorkoutDayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetWorkout.mockResolvedValue(workout);
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });
  });

  /**
   * Authenticated user with a populated workout.
   * Mock: API returns one exercise with complete details and two images.
   * Assert: page renders the day, counter, exercise metadata and ShadCN controls.
   */
  test('renders the workout day and exercise details', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Terça-feira', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
    expect(screen.getByText('Supino reto')).toBeInTheDocument();
    expect(screen.getByText('Peito')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Feito: Supino reto' })).toBeInTheDocument();
    const workoutCarousel = screen.getByRole('region', {
      name: 'Imagens de Supino reto',
    });
    expect(workoutCarousel.className).not.toMatch(/aspect-/);
    expect(within(workoutCarousel).getAllByRole('img')).toHaveLength(2);
    expect(
      within(workoutCarousel).getByRole('img', { name: 'Supino reto — imagem 1' }),
    ).toHaveClass('block', 'h-auto', 'w-full', 'object-contain');
    expect(
      within(workoutCarousel).getByRole('img', { name: 'Supino reto — imagem 2' }),
    ).toHaveClass('block', 'h-auto', 'w-full', 'object-contain');
    expect(
      within(workoutCarousel).getByRole('button', { name: 'Imagem anterior' }),
    ).toBeInTheDocument();
    expect(
      within(workoutCarousel).getByRole('button', { name: 'Próxima imagem' }),
    ).toBeInTheDocument();
    expect(within(workoutCarousel).getByRole('button', { name: 'Imagem 1' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveAttribute(
      'placeholder',
      'Buscar exercícios para adicionar...',
    );
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveAttribute(
      'type',
      'search',
    );
    expect(
      screen.getByRole('searchbox', { name: 'Buscar exercícios' }).parentElement?.parentElement
        ?.parentElement,
    ).toHaveClass('sticky', 'top-14');
    expect(screen.getByRole('button', { name: 'Limpar treino' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Feito: Supino reto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Imagem anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima imagem' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Imagem 1' })).toBeInTheDocument();
  });

  /**
   * User expands exercise instructions and types a search query.
   * Mock: populated workout; mutation controls remain disabled until backend APIs exist.
   * Assert: instructions become visible and the search input keeps its value.
   */
  test('expands instructions and accepts a search query', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Supino reto');
    await user.click(screen.getByRole('button', { name: 'Instruções: Supino reto' }));
    expect(screen.getByText('• Deite-se no banco.')).toBeVisible();

    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');
    expect(search).toHaveValue('supino');
  });

  /**
   * User clears an active catalog search.
   * Mock: the debounced API returns one catalog result.
   * Assert: the input is empty and the initial workout view is restored immediately.
   */
  test('clears the search and restores the initial results', async () => {
    jest.useFakeTimers();
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'triceps-pushdown',
          name: 'Tríceps na polia',
          force: 'push',
          level: 'intermediate',
          mechanic: 'isolation',
          equipment: 'cable',
          primaryMuscles: ['tríceps'],
          secondaryMuscles: [],
          instructions: ['Empurre a barra.'],
          category: 'strength',
          images: ['0.jpg', '1.jpg'],
        },
      ],
      total: 1,
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    const search = screen.getByRole('searchbox', { name: 'Buscar exercícios' });
    await user.type(search, 'triceps');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(await screen.findByText('Tríceps na polia')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));

    expect(search).toHaveValue('');
    expect(screen.queryByText('Tríceps na polia')).not.toBeInTheDocument();
    expect(screen.getByText('Supino reto')).toBeInTheDocument();
    jest.useRealTimers();
  });

  /**
   * User searches the exercise catalog after entering a term.
   * Mock: the debounced API returns one exercise outside the current workout.
   * Assert: the result appears only after the debounce and the query uses the typed term.
   */
  test('loads catalog results after the search debounce', async () => {
    jest.useFakeTimers();
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'triceps-pushdown',
          name: 'Tríceps na polia',
          force: 'push',
          level: 'intermediate',
          mechanic: 'isolation',
          equipment: 'cable',
          primaryMuscles: ['tríceps'],
          secondaryMuscles: [],
          instructions: ['Empurre a barra.'],
          category: 'strength',
          images: ['0.jpg', '1.jpg'],
        },
      ],
      total: 1,
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'triceps');
    expect(mockedGetExercises).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(await screen.findByText('Tríceps na polia')).toBeInTheDocument();
    expect(mockedGetExercises).toHaveBeenCalledWith('triceps', 20, 0, expect.anything());
    const carousel = screen.getByRole('region', {
      name: 'Imagens de Tríceps na polia',
    });
    expect(carousel.className).not.toMatch(/aspect-/);
    expect(within(carousel).getAllByRole('img')).toHaveLength(2);
    expect(within(carousel).getByRole('img', { name: 'Tríceps na polia — imagem 1' })).toHaveClass(
      'block',
      'h-auto',
      'w-full',
      'object-contain',
    );
    expect(within(carousel).getByRole('img', { name: 'Tríceps na polia — imagem 2' })).toHaveClass(
      'block',
      'h-auto',
      'w-full',
      'object-contain',
    );
    expect(within(carousel).getByRole('button', { name: 'Imagem anterior' })).toBeInTheDocument();
    expect(within(carousel).getByRole('button', { name: 'Próxima imagem' })).toHaveClass(
      'opacity-100',
      'focus-visible:ring-ring',
    );
    expect(within(carousel).getByRole('button', { name: 'Imagem 1' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  /**
   * User requests more results after the first catalog page is loaded.
   * Mock: the first page contains one result and the second page contains another result.
   * Assert: both pages render and the next request uses the following offset.
   */
  test('loads the next catalog page when requested', async () => {
    jest.useFakeTimers();
    let resolveNextPage: (response: ExercisesResponse) => void = () => undefined;
    const nextPage = new Promise<ExercisesResponse>((resolve) => {
      resolveNextPage = resolve;
    });
    mockedGetExercises
      .mockResolvedValueOnce({
        items: [
          {
            id: 'triceps-pushdown',
            name: 'Tríceps na polia',
            force: 'push',
            level: 'intermediate',
            mechanic: 'isolation',
            equipment: 'cable',
            primaryMuscles: ['tríceps'],
            secondaryMuscles: [],
            instructions: ['Empurre a barra.'],
            category: 'strength',
            images: ['0.jpg', '1.jpg'],
          },
        ],
        total: 21,
      })
      .mockReturnValueOnce(nextPage);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'triceps');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(await screen.findByText('Tríceps na polia')).toBeInTheDocument();
    const loadMoreButton = screen.getByRole('button', { name: 'Carregar mais exercícios' });
    await user.click(loadMoreButton);
    const loadingButton = screen.getByRole('button', { name: 'Carregando exercícios...' });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    resolveNextPage({
      items: [
        {
          id: 'triceps-dip',
          name: 'Mergulho para tríceps',
          force: 'push',
          level: 'intermediate',
          mechanic: 'compound',
          equipment: 'body only',
          primaryMuscles: ['tríceps'],
          secondaryMuscles: [],
          instructions: ['Desça controladamente.'],
          category: 'strength',
          images: ['0.jpg', '1.jpg'],
        },
      ],
      total: 21,
    });

    expect(await screen.findByText('Mergulho para tríceps')).toBeInTheDocument();
    expect(mockedGetExercises).toHaveBeenLastCalledWith('triceps', 20, 20, expect.anything());
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toBeVisible();
    expect(
      screen.getByRole('searchbox', { name: 'Buscar exercícios' }).parentElement?.parentElement
        ?.parentElement,
    ).toHaveClass('sticky', 'top-14');
    expect(
      screen.queryByRole('button', { name: 'Carregar mais exercícios' }),
    ).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  /**
   * Authenticated user with no exercises in the selected workout.
   * Mock: API returns an empty exercise array.
   * Assert: empty state explains that search will add exercises later.
   */
  test('renders the empty state', async () => {
    mockedGetWorkout.mockResolvedValue({
      workout: { id: 2, weekDay: 'TERCA', exercises: [] },
    });
    renderPage();

    expect(await screen.findByText('Nenhum exercício neste treino.')).toBeInTheDocument();
    expect(screen.getByText('Use a busca acima para adicionar exercícios.')).toBeInTheDocument();
  });
});
