jest.mock('@/lib/api', () => ({
  getWorkout: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated' }),
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ weekDay: 'TERCA' }),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getWorkout } from '@/lib/api';
import WorkoutDayPage from './page';

const mockedGetWorkout = jest.mocked(getWorkout);

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
    mockedGetWorkout.mockResolvedValue(workout);
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
    expect(screen.getByRole('textbox', { name: 'Buscar exercícios' })).toHaveAttribute(
      'placeholder',
      'Buscar exercícios para adicionar...',
    );
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

    const search = screen.getByRole('textbox', { name: 'Buscar exercícios' });
    await user.type(search, 'supino');
    expect(search).toHaveValue('supino');
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
