import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getWorkouts } from '@/lib/api';
import { DashboardClient } from './DashboardClient';

jest.mock('@/components/layout/Header', () => ({
  Header: () => <header />,
}));

jest.mock('@/components/ui/Spinner', () => ({
  Spinner: () => <span />,
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated' }),
}));

jest.mock('@/lib/api', () => ({ getWorkouts: jest.fn() }));

const mockedGetWorkouts = jest.mocked(getWorkouts);

const renderDashboard = (): void => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <DashboardClient />
    </QueryClientProvider>,
  );
};

describe('DashboardClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * An authenticated user has a workout with a long exercise name and five exercises.
   * Mock: the workouts query resolves with five exercise names.
   * Assert: the visible name is complete, wraps instead of truncating, and the overflow count remains.
   */
  test('shows complete preview names and keeps the remaining count', async () => {
    mockedGetWorkouts.mockResolvedValue({
      workouts: [
        {
          id: 1,
          weekDay: 'SEGUNDA',
          exerciseCount: 5,
          exerciseNames: [
            'Alongamento de Isquiotibiais e Panturrilhas em Pé',
            'Agachamento livre',
            'Supino reto',
            'Remada curvada',
            'Rosca direta',
          ],
        },
      ],
    });

    renderDashboard();

    const exercise = await screen.findByText('Alongamento de Isquiotibiais e Panturrilhas em Pé');
    expect(exercise).toHaveClass('break-words');
    expect(exercise).not.toHaveClass('truncate');
    expect(await screen.findByText('Mais 2 exercícios')).toBeInTheDocument();
  });

  /**
   * An authenticated user has an empty workout.
   * Mock: the workouts query resolves with no exercise names.
   * Assert: the empty state remains visible.
   */
  test('shows the empty workout state', async () => {
    mockedGetWorkouts.mockResolvedValue({
      workouts: [{ id: 1, weekDay: 'SEGUNDA', exerciseCount: 0, exerciseNames: [] }],
    });

    renderDashboard();

    expect(await screen.findByText('Nenhum exercício')).toBeInTheDocument();
  });
});
