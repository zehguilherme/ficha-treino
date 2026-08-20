jest.mock('@/lib/api', () => ({
  addWorkoutExercise: jest.fn(),
  getWorkout: jest.fn(),
  getExercises: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated' }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ weekDay: 'TERCA' }),
}));

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { addWorkoutExercise, getExercises, getWorkout } from '@/lib/api';
import type { ExercisesResponse } from '@/schemas/api';
import { toast } from 'sonner';
import WorkoutDayPage from './page';

const mockedGetWorkout = jest.mocked(getWorkout);
const mockedGetExercises = jest.mocked(getExercises);
const mockedAddWorkoutExercise = jest.mocked(addWorkoutExercise);
const mockedToast = jest.mocked(toast);

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
    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    mockedGetWorkout.mockResolvedValue(workout);
    mockedGetExercises.mockResolvedValue({ items: [], total: 0 });
    mockedAddWorkoutExercise.mockResolvedValue({
      id: 46,
      exerciseId: 'triceps-pushdown',
      done: false,
    });
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
    expect(await screen.findByText('Supino reto')).toBeInTheDocument();
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
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

  test('renders primary and secondary muscles in search results', async () => {
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
          primaryMuscles: ['tríceps', 'peito'],
          secondaryMuscles: ['ombro', 'costas'],
          instructions: ['Empurre a barra.'],
          category: 'strength',
          images: ['0.jpg', '1.jpg'],
        },
        {
          id: 'bodyweight-squat',
          name: 'Agachamento livre',
          force: 'push',
          level: 'beginner',
          mechanic: 'compound',
          equipment: 'body only',
          primaryMuscles: ['quadríceps'],
          secondaryMuscles: [],
          instructions: ['Desça controladamente.'],
          category: 'strength',
          images: ['0.jpg', '1.jpg'],
        },
      ],
      total: 2,
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'exercício');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const results = await screen.findByRole('list', { name: 'Resultados da busca' });
    const resultItems = within(results).getAllByRole('listitem');
    expect(resultItems[0]).toHaveTextContent('Músculo primário: Tríceps, Peito');
    expect(resultItems[0]).toHaveTextContent('Músculos secundários: Ombro, Costas');
    expect(resultItems[1]).toHaveTextContent('Músculo primário: Quadríceps');
    expect(resultItems[1]).not.toHaveTextContent('Músculos secundários:');
    jest.useRealTimers();
  });

  /**
   * User adds an exercise from the catalog to the current workout.
   * Mock: catalog result, successful POST, then refreshed workout containing the new exercise.
   * Assert: mutation payload, pending state, cleared search and refreshed workout are visible.
   */
  test('adds a searched exercise to the workout', async () => {
    jest.useFakeTimers();
    const updatedWorkout = {
      workout: {
        ...workout.workout,
        exercises: [
          ...workout.workout.exercises,
          {
            id: 46,
            done: false,
            exercise: {
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
          },
        ],
      },
    };
    mockedGetWorkout.mockResolvedValueOnce(workout).mockResolvedValueOnce(updatedWorkout);
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

    const addButton = await screen.findByRole('button', { name: 'Adicionar Tríceps na polia' });
    await user.click(addButton);

    expect(mockedAddWorkoutExercise).toHaveBeenCalledWith('TERCA', 'triceps-pushdown');
    expect(mockedToast.success).toHaveBeenCalledWith('Exercício adicionado ao treino.');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(search).toHaveValue('');
    expect(await screen.findByText('Tríceps na polia')).toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector('span')).toHaveTextContent('0 / 2');
    jest.useRealTimers();
  });

  /**
   * User tries to add an exercise already present in the workout.
   * Mock: POST rejects with the backend duplicate status.
   * Assert: duplicate-specific alert remains visible with the search result.
   */
  test('shows a duplicate error when the exercise is already in the workout', async () => {
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
    mockedAddWorkoutExercise.mockRejectedValue(
      new AxiosError('Duplicate exercise', AxiosError.ERR_BAD_REQUEST, undefined, undefined, {
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: { error: 'Exercício já está no treino' },
      }),
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'triceps');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await user.click(await screen.findByRole('button', { name: 'Adicionar Tríceps na polia' }));

    expect(mockedToast.warning).toHaveBeenCalledWith('Este exercício já está no treino.');
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Tríceps na polia')).toBeInTheDocument();
    jest.useRealTimers();
  });

  /**
   * User encounters a non-duplicate add failure.
   * Mock: POST rejects with a generic network/server error.
   * Assert: an accessible error dialog is shown and no warning toast is emitted.
   */
  test('shows a modal error for a generic add failure', async () => {
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
    mockedAddWorkoutExercise.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'triceps');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await user.click(await screen.findByRole('button', { name: 'Adicionar Tríceps na polia' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Algo deu errado');
    expect(dialog).toHaveTextContent('Não foi possível adicionar o exercício.');
    expect(dialog.querySelector('[data-slot="alert-dialog-icon"]')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' })[1]);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mockedToast.warning).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  /**
   * User searches the exercise catalog and the request fails.
   * Mock: debounced catalog request rejects with a generic network/server error.
   * Assert: closing the modal reveals the dashboard-style recovery state.
   */
  test('shows a modal error when catalog search fails', async () => {
    jest.useFakeTimers();
    mockedGetExercises.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'triceps');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Não foi possível buscar exercícios.',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  /**
   * User opens a workout day whose request fails.
   * Mock: workout request rejects with a generic network/server error.
   * Assert: the failure appears in an accessible modal instead of inline content.
   */
  test('shows a modal error when workout loading fails', async () => {
    mockedGetWorkout.mockRejectedValue(new Error('Network error'));

    renderPage();

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Não foi possível carregar o treino.');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' })[0]);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Terça-feira', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o treino.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveClass('border');
    expect(screen.queryByRole('link', { name: 'Voltar ao dashboard' })).not.toBeInTheDocument();
  });

  /**
   * User retries a failed workout request after closing its modal.
   * Mock: first request rejects and the retry resolves with the workout.
   * Assert: retry becomes busy and restores the normal workout view.
   */
  test('retries a failed workout request', async () => {
    let resolveRetry: (response: typeof workout) => void = () => undefined;
    const retry = new Promise<typeof workout>((resolve) => {
      resolveRetry = resolve;
    });
    mockedGetWorkout.mockRejectedValueOnce(new Error('Network error')).mockReturnValueOnce(retry);
    const user = userEvent.setup();

    renderPage();
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' })[1]);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(screen.getByRole('button', { name: 'Tentando novamente...' })).toBeDisabled();
    resolveRetry(workout);

    expect(await screen.findByText('Supino reto')).toBeInTheDocument();
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
