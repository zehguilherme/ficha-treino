import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { getWorkouts } from '@/lib/api';
import { DashboardClient } from './DashboardClient';

jest.mock('@/components/layout/Header', () => ({
  Header: () => <header />,
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

  /**
   * The dashboard request fails and the user retries it.
   * Mock: the first request rejects and the retry resolves after a deferred promise.
   * Assert: retry matches the outline design and exposes the internal loading state.
   */
  test('uses the outline retry button and shows loading while retrying', async () => {
    let resolveRetry: ((value: Awaited<ReturnType<typeof getWorkouts>>) => void) | undefined;
    mockedGetWorkouts.mockRejectedValueOnce(new Error('request failed')).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRetry = resolve;
        }),
    );

    renderDashboard();

    const retryButton = await screen.findByRole('button', { name: 'Tentar novamente' });
    expect(retryButton).toHaveClass('border', 'border-border');
    expect(retryButton).toBeEnabled();

    await userEvent.click(retryButton);

    const loadingButton = await screen.findByRole('button', { name: /Tentando novamente…/ });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    expect(loadingButton).toHaveClass('border', 'border-border');
    expect(within(loadingButton).getByRole('status', { name: 'Carregando' })).toBeInTheDocument();

    resolveRetry?.({ workouts: [] });
    expect(await screen.findByText('Meus Treinos')).toBeInTheDocument();
  });
});
