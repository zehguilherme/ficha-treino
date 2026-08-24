jest.mock('@/lib/api', () => ({
  addWorkoutExercise: jest.fn(),
  clearWorkout: jest.fn(),
  getWorkout: jest.fn(),
  getExercises: jest.fn(),
  removeWorkoutExercise: jest.fn(),
  toggleWorkoutExercise: jest.fn(),
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
import {
  addWorkoutExercise,
  clearWorkout,
  getExercises,
  getWorkout,
  removeWorkoutExercise,
  toggleWorkoutExercise,
} from '@/lib/api';
import type { ExercisesResponse } from '@/schemas/api';
import { toast } from 'sonner';
import WorkoutDayPage from './page';

const mockedGetWorkout = jest.mocked(getWorkout);
const mockedGetExercises = jest.mocked(getExercises);
const mockedAddWorkoutExercise = jest.mocked(addWorkoutExercise);
const mockedClearWorkout = jest.mocked(clearWorkout);
const mockedToast = jest.mocked(toast);
const mockedToggleWorkoutExercise = jest.mocked(toggleWorkoutExercise);
const mockedRemoveWorkoutExercise = jest.mocked(removeWorkoutExercise);

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
    mockedClearWorkout.mockResolvedValue({ cleared: 1 });
    mockedRemoveWorkoutExercise.mockResolvedValue({ deleted: true });
    mockedToggleWorkoutExercise.mockResolvedValue({
      id: 45,
      exerciseId: 'barbell-bench-press',
      done: true,
    });
  });

  /**
   * User opens a workout day while its data is loading.
   * Mock: the workout request remains pending until the test resolves it.
   * Assert: an accessible spinner is rendered for the workout loading state.
   */
  test('shows a spinner while the workout is loading', async () => {
    let resolveWorkout: ((value: typeof workout) => void) | undefined;
    mockedGetWorkout.mockReturnValue(
      new Promise((resolve) => {
        resolveWorkout = resolve;
      }),
    );

    renderPage();

    expect(screen.getByRole('status', { name: 'Carregando treino...' })).toBeInTheDocument();
    resolveWorkout?.(workout);
    expect(await screen.findByText('Supino reto')).toBeInTheDocument();
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
    const exerciseCard = screen.getByRole('article');
    expect(exerciseCard).toHaveClass('overflow-hidden', 'rounded-[calc(var(--radius)+0.125rem)]');
    expect(within(exerciseCard).getByText('Músculo primário')).toHaveClass(
      'text-[0.6875rem]',
      'uppercase',
    );
    expect(within(exerciseCard).getByText('Peito')).toHaveClass('pl-4', 'text-xs');
    const primaryMuscleLabel = within(exerciseCard).getByText('Músculo primário');
    const secondaryMuscleLabel = within(exerciseCard).getByText('Músculo secundário');
    expect(primaryMuscleLabel.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
    expect(secondaryMuscleLabel.querySelector('svg')).toHaveAttribute('fill', 'none');
    expect(screen.getByRole('checkbox', { name: 'Feito: Supino reto' })).toBeInTheDocument();
    const instructionsButton = screen.getByRole('button', { name: 'Instruções: Supino reto' });
    expect(instructionsButton).toHaveClass('h-9', 'px-4', 'py-2', 'text-sm');
    expect(instructionsButton).toHaveClass('max-[640px]:col-span-1', 'max-[640px]:w-full');
    expect(instructionsButton.parentElement).toHaveClass('gap-2');
    expect(instructionsButton.parentElement).toHaveClass(
      'max-[640px]:grid',
      'max-[640px]:grid-cols-1',
      'max-[640px]:gap-y-2',
    );
    expect(instructionsButton).toHaveClass('gap-1', 'sm:gap-2');
    expect(instructionsButton).toHaveAttribute('aria-expanded', 'false');
    const removeButton = screen.getByRole('button', { name: 'Remover Supino reto' });
    expect(removeButton).toBeEnabled();
    expect(removeButton).toHaveClass('h-9', 'px-4', 'py-2', 'text-sm');
    expect(removeButton).toHaveClass(
      'ml-auto',
      'gap-1.5',
      'max-[640px]:col-span-1',
      'max-[640px]:ml-0',
      'max-[640px]:w-full',
      'bg-destructive',
      'text-primary-foreground',
      'hover:bg-destructive/90',
    );
    expect(removeButton.querySelector('svg')).toHaveClass('size-3.5');
    const workoutCarousel = screen.getByRole('region', {
      name: 'Imagens de Supino reto',
    });
    expect(workoutCarousel.className).not.toMatch(/aspect-/);
    expect(within(workoutCarousel).getAllByRole('img')).toHaveLength(2);
    const firstWorkoutImage = within(workoutCarousel).getByRole('img', {
      name: 'Supino reto — imagem 1',
    });
    const secondWorkoutImage = within(workoutCarousel).getByRole('img', {
      name: 'Supino reto — imagem 2',
    });
    expect(firstWorkoutImage).toHaveClass('block', 'h-auto', 'w-full', 'object-contain');
    expect(firstWorkoutImage).toHaveAttribute('loading', 'eager');
    expect(secondWorkoutImage).toHaveClass('block', 'h-auto', 'w-full', 'object-contain');
    expect(secondWorkoutImage).toHaveAttribute('loading', 'lazy');
    expect(
      within(workoutCarousel).getByRole('button', { name: 'Imagem anterior' }),
    ).toBeInTheDocument();
    expect(within(workoutCarousel).getByRole('button', { name: 'Próxima imagem' })).toHaveClass(
      'opacity-100',
    );
    expect(within(workoutCarousel).getByRole('button', { name: 'Próxima imagem' })).not.toHaveClass(
      'sm:opacity-0',
      'group-hover:opacity-100',
      'transition-opacity',
    );
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
      screen.getByRole('heading', { name: 'Terça-feira', level: 2 }).parentElement,
    ).toHaveClass('mb-4');
    expect(
      screen.getByRole('searchbox', { name: 'Buscar exercícios' }).parentElement?.parentElement
        ?.parentElement,
    ).toHaveClass('sticky', 'top-14', 'mb-6');
    expect(
      screen.getByRole('searchbox', { name: 'Buscar exercícios' }).parentElement?.parentElement
        ?.parentElement,
    ).toHaveClass('py-3');
    expect(
      screen.getByRole('searchbox', { name: 'Buscar exercícios' }).parentElement?.parentElement
        ?.parentElement,
    ).toHaveClass('sticky', 'top-14');
    expect(screen.getByRole('button', { name: 'Limpar treino' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Feito: Supino reto' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Imagem anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima imagem' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Imagem 1' })).toBeInTheDocument();
  });

  /**
   * Initial empty search does not schedule unnecessary debounce work.
   * Mock: authenticated workout loads with an empty search field.
   * Assert: no timer is pending after the initial render.
   */
  test('does not schedule a debounce timer for an empty initial search', async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    try {
      renderPage();

      expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 1000);
    } finally {
      jest.clearAllTimers();
      setTimeoutSpy.mockRestore();
      jest.useRealTimers();
    }
  });

  /**
   * Populated workout renders only its first visible image eagerly.
   * Mock: API returns two exercises, each with two carousel images.
   * Assert: the first image is eager while all remaining images stay lazy.
   */
  test('loads only the first workout image eagerly', async () => {
    mockedGetWorkout.mockResolvedValue({
      workout: {
        ...workout.workout,
        exercises: [
          ...workout.workout.exercises,
          {
            ...workout.workout.exercises[0],
            id: 46,
            exercise: {
              ...workout.workout.exercises[0].exercise,
              id: 'triceps-pushdown',
              name: 'Tríceps na polia',
            },
          },
        ],
      },
    });

    renderPage();

    const firstCarousel = await screen.findByRole('region', { name: 'Imagens de Supino reto' });
    const secondCarousel = screen.getByRole('region', { name: 'Imagens de Tríceps na polia' });

    expect(
      within(firstCarousel).getByRole('img', { name: 'Supino reto — imagem 1' }),
    ).toHaveAttribute('loading', 'eager');
    expect(
      within(firstCarousel).getByRole('img', { name: 'Supino reto — imagem 2' }),
    ).toHaveAttribute('loading', 'lazy');
    expect(
      within(secondCarousel).getByRole('img', { name: 'Tríceps na polia — imagem 1' }),
    ).toHaveAttribute('loading', 'lazy');
    expect(
      within(secondCarousel).getByRole('img', { name: 'Tríceps na polia — imagem 2' }),
    ).toHaveAttribute('loading', 'lazy');
  });

  /**
   * User marks an exercise as completed.
   * Mock: PATCH returns the toggled association and the workout query is refreshed afterward.
   * Assert: the association ID is sent and the checkbox enters a pending state during the request.
   */
  test('toggles an exercise completion state', async () => {
    mockedGetWorkout.mockResolvedValueOnce(workout).mockResolvedValueOnce({
      workout: {
        ...workout.workout,
        exercises: [{ ...workout.workout.exercises[0], done: true }],
      },
    });
    let resolveToggle: (response: { id: number; exerciseId: string; done: boolean }) => void = () =>
      undefined;
    mockedToggleWorkoutExercise.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveToggle = resolve;
      }),
    );
    const user = userEvent.setup();

    renderPage();
    const checkbox = await screen.findByRole('checkbox', { name: 'Feito: Supino reto' });
    await user.click(checkbox);

    expect(mockedToggleWorkoutExercise).toHaveBeenCalledWith(45);
    expect(checkbox).toBeDisabled();

    resolveToggle({ id: 45, exerciseId: 'barbell-bench-press', done: true });
    expect(await screen.findByText('1 / 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar treino' })).toBeEnabled();
  });

  /**
   * User confirms clearing the workout.
   * Mock: clear endpoint returns the number of reset associations and the workout query is refreshed.
   * Assert: the confirmation dialog is accessible, Escape cancels it, and confirmation calls the weekday endpoint.
   */
  test('confirms clearing all exercise completions', async () => {
    mockedGetWorkout.mockResolvedValueOnce({
      workout: {
        ...workout.workout,
        exercises: [{ ...workout.workout.exercises[0], done: true }],
      },
    });
    let resolveClear: (response: { cleared: number }) => void = () => undefined;
    mockedClearWorkout.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveClear = resolve;
      }),
    );
    const user = userEvent.setup();

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Limpar treino' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Limpar treino?');
    expect(dialog).toHaveTextContent('Terça-feira');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar treino' }));
    await user.click(await screen.findByRole('button', { name: 'Sim, limpar' }));

    expect(mockedClearWorkout).toHaveBeenCalledWith('TERCA');
    expect(screen.getByRole('button', { name: /Limpando…/ })).toBeDisabled();

    resolveClear({ cleared: 1 });
    expect(await screen.findByText('0 / 1')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Feito: Supino reto' })).not.toBeChecked();
  });

  /**
   * User confirms removing an exercise from the workout.
   * Mock: DELETE remains pending, then resolves successfully.
   * Assert: confirmation, pending state, API variables, visible removal and counter update.
   */
  test('removes an exercise after confirmation', async () => {
    mockedGetWorkout.mockResolvedValueOnce(workout).mockResolvedValue({
      workout: { ...workout.workout, exercises: [] },
    });
    let resolveRemove: (response: { deleted: true }) => void = () => undefined;
    mockedRemoveWorkoutExercise.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRemove = resolve;
      }),
    );
    const user = userEvent.setup();

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Remover Supino reto' }));
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Supino reto');

    await user.click(screen.getByRole('button', { name: 'Sim, remover' }));

    expect(mockedRemoveWorkoutExercise).toHaveBeenCalledWith('TERCA', 'barbell-bench-press');
    expect(screen.getByRole('button', { name: /Removendo…/ })).toBeDisabled();

    resolveRemove({ deleted: true });
    expect(await screen.findByText('0 / 0')).toBeInTheDocument();
    expect(screen.queryByText('Supino reto')).not.toBeInTheDocument();
  });

  /**
   * User encounters a failed remove request.
   * Mock: DELETE rejects with a generic error.
   * Assert: error dialog appears and the current exercise remains visible.
   */
  test('keeps the exercise visible when removal fails', async () => {
    mockedRemoveWorkoutExercise.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Remover Supino reto' }));
    await user.click(screen.getByRole('button', { name: 'Sim, remover' }));

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      'Não foi possível remover o exercício.',
    );
    expect(
      within(screen.getByRole('article', { hidden: true })).getByText('Supino reto'),
    ).toBeInTheDocument();
  });

  /**
   * User expands exercise instructions and types a search query.
   * Mock: populated workout with completion and clear mutations available.
   * Assert: instructions become visible and the search input keeps its value.
   */
  test('expands instructions and accepts a search query', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Supino reto');
    await user.click(screen.getByRole('button', { name: 'Instruções: Supino reto' }));
    const instructions = screen.getByText('• Deite-se no banco.').parentElement;
    expect(instructions).toBeVisible();
    expect(instructions).toHaveClass('rounded-[var(--radius)]', 'bg-secondary');
    expect(instructions?.querySelectorAll('p')).toHaveLength(1);
    expect(instructions?.querySelector('p')).toHaveClass('mb-1.5');
    expect(screen.getByRole('button', { name: 'Instruções: Supino reto' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

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
    let resolveExercises: ((value: ExercisesResponse) => void) | undefined;
    mockedGetExercises.mockReturnValue(
      new Promise((resolve) => {
        resolveExercises = resolve;
      }),
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();
    await screen.findByText('Supino reto');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'triceps');
    expect(mockedGetExercises).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByRole('status', { name: 'Buscando exercícios...' })).toBeInTheDocument();
    resolveExercises?.({
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

    expect(await screen.findByText('Tríceps na polia')).toBeInTheDocument();
    expect(mockedGetExercises).toHaveBeenCalledWith('triceps', 20, 0, expect.anything());
    const carousel = screen.getByRole('region', {
      name: 'Imagens de Tríceps na polia',
    });
    expect(carousel.className).not.toMatch(/aspect-/);
    expect(within(carousel).getAllByRole('img')).toHaveLength(2);
    const firstSearchImage = within(carousel).getByRole('img', {
      name: 'Tríceps na polia — imagem 1',
    });
    const secondSearchImage = within(carousel).getByRole('img', {
      name: 'Tríceps na polia — imagem 2',
    });
    expect(firstSearchImage).toHaveClass('block', 'h-auto', 'w-full', 'object-contain');
    expect(firstSearchImage).toHaveAttribute('loading', 'eager');
    expect(secondSearchImage).toHaveClass('block', 'h-auto', 'w-full', 'object-contain');
    expect(secondSearchImage).toHaveAttribute('loading', 'lazy');
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
   * User views an exercise with a long name in both workout states.
   * Mock: the workout and catalog return the same long exercise name.
   * Assert: both cards allow the complete name to wrap instead of truncating it.
   */
  test('shows complete long exercise names in search and workout cards', async () => {
    jest.useFakeTimers();
    const longExerciseName = 'Alongamento de Isquiotibiais e Panturrilhas em Pé com Apoio';
    mockedGetWorkout.mockResolvedValue({
      workout: {
        ...workout.workout,
        exercises: [
          {
            ...workout.workout.exercises[0],
            exercise: { ...workout.workout.exercises[0].exercise, name: longExerciseName },
          },
        ],
      },
    });
    mockedGetExercises.mockResolvedValue({
      items: [
        {
          id: 'long-exercise',
          name: longExerciseName,
          force: 'pull',
          level: 'beginner',
          mechanic: 'compound',
          equipment: 'body only',
          primaryMuscles: ['posterior da coxa'],
          secondaryMuscles: [],
          instructions: ['Alongue-se.'],
          category: 'stretching',
          images: ['0.jpg', '1.jpg'],
        },
      ],
      total: 1,
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderPage();

    const workoutHeading = await screen.findByRole('heading', { name: longExerciseName });
    expect(workoutHeading).toHaveClass('break-words');
    expect(workoutHeading).not.toHaveClass('truncate');

    await user.type(screen.getByRole('searchbox', { name: 'Buscar exercícios' }), 'alongamento');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const results = await screen.findByRole('list', { name: 'Resultados da busca' });
    const searchHeading = within(results).getByRole('heading', { name: longExerciseName });
    expect(searchHeading).toHaveClass('break-words');
    expect(searchHeading).not.toHaveClass('truncate');
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
    expect(addButton).toHaveClass('h-9', 'px-4', 'py-2', 'text-sm');
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
   * Mock: the first debounced request fails and the retry remains pending before succeeding.
   * Assert: closing the modal reveals an accessible retry state that preserves the query.
   */
  test('retries a failed catalog search', async () => {
    jest.useFakeTimers();
    let resolveRetry: ((value: ExercisesResponse) => void) | undefined;
    mockedGetExercises.mockRejectedValueOnce(new Error('Network error')).mockReturnValueOnce(
      new Promise<ExercisesResponse>((resolve) => {
        resolveRetry = resolve;
      }),
    );
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
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' })[1]);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível buscar exercícios.');
    const retryButton = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(retryButton).toBeEnabled();
    expect(screen.getByRole('searchbox', { name: 'Buscar exercícios' })).toHaveValue('triceps');

    await user.click(retryButton);
    expect(screen.getByRole('button', { name: /Tentando novamente/ })).toBeDisabled();
    resolveRetry?.({
      items: [
        {
          id: 'triceps-pushdown',
          name: 'Tríceps pulley',
          force: 'push',
          level: 'intermediate',
          mechanic: 'isolation',
          equipment: 'cable',
          primaryMuscles: ['tríceps'],
          secondaryMuscles: [],
          instructions: ['Empurre a barra para baixo.'],
          category: 'strength',
          images: ['0.jpg'],
        },
      ],
      total: 1,
    });
    expect(await screen.findByText('Tríceps pulley')).toBeInTheDocument();
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

    expect(screen.getByRole('button', { name: /Tentando novamente…/ })).toBeDisabled();
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
    const loadingButton = screen.getByRole('button', { name: /Carregando exercícios/ });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    expect(within(loadingButton).getByRole('status', { name: 'Carregando' })).toBeInTheDocument();

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
    expect(screen.getByRole('button', { name: 'Limpar treino' })).toBeDisabled();
  });
});
