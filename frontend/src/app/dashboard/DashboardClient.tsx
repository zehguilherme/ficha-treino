'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts } from '@/lib/api';
import { getExercisePreview } from '@/lib/dashboard';
import type { WeekDay } from '@/schemas/api';

const DAY_NAMES: Record<WeekDay, string> = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

export const DashboardClient = (): React.JSX.Element => {
  const { status } = useAuth();
  const authenticated = status === 'authenticated';
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<number, boolean>>({});
  const workouts = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
    enabled: authenticated,
  });
  const retryWorkouts = async (): Promise<void> => {
    setDismissedError(null);
    setIsRetrying(true);
    try {
      await workouts.refetch();
    } finally {
      setIsRetrying(false);
    }
  };
  useEffect(() => {
    if (status === 'anonymous') window.location.replace('/login');
  }, [status]);
  if (status === 'anonymous')
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center bg-background">
          <Loading message="Carregando Login..." />
        </main>
        <Footer />
      </>
    );
  if (workouts.isError || isRetrying)
    return (
      <>
        <Header />
        <ErrorAlertDialog
          open={workouts.isError && dismissedError !== 'workouts-error'}
          onOpenChange={(open) => {
            if (!open) setDismissedError('workouts-error');
          }}
          message="Não foi possível carregar seus treinos."
        />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-4">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar seus treinos.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void retryWorkouts()}
            loading={workouts.isFetching}
          >
            {workouts.isFetching ? 'Tentando novamente…' : 'Tentar novamente'}
          </Button>
        </main>
        <Footer />
      </>
    );
  if (status !== 'authenticated' || workouts.isPending)
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center bg-background">
          <Loading message="Carregando treinos..." />
        </main>
        <Footer />
      </>
    );
  return (
    <>
      <Header />
      <main className="flex-1 bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[80rem]">
          <h1 className="text-2xl font-semibold tracking-tight">Meus Treinos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Selecione um dia para gerenciar seus exercícios
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
            {workouts.data.workouts.map((workout) => {
              const preview = getExercisePreview(workout.exercises);
              const exercises = expandedWorkouts[workout.id]
                ? workout.exercises
                : preview.exercises;
              const expanded = expandedWorkouts[workout.id] ?? false;
              return (
                <article
                  key={workout.id}
                  className="relative isolate flex flex-col rounded-[calc(var(--radius)+0.125rem)] border border-border bg-card p-5 transition hover:border-ring/15 hover:shadow-sm"
                >
                  <Link
                    href={`/workout/${workout.weekDay}`}
                    className={`-m-5 block h-full flex-1 rounded-[calc(var(--radius)+0.125rem)] p-5 ${preview.remaining > 0 ? 'pb-16' : 'pb-5'} outline-none focus-visible:ring-1 focus-visible:ring-ring`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[0.9375rem] font-medium">
                        {DAY_NAMES[workout.weekDay]}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {workout.exerciseCount}
                      </span>
                    </div>
                    <ul
                      id={`workout-exercises-${workout.id}`}
                      className="mt-4 space-y-2 text-sm text-muted-foreground"
                    >
                      {exercises.map(({ name, done }) => (
                        <li
                          key={name}
                          className={`break-words ${done ? 'line-through' : ''}`}
                          title={name}
                        >
                          <span
                            aria-hidden="true"
                            className={`mr-2 inline-block size-1.5 rounded-full align-middle ${done ? 'bg-primary' : 'bg-muted-foreground'}`}
                          />
                          {name}
                          {done ? <span className="sr-only"> (concluído)</span> : null}
                        </li>
                      ))}
                      {exercises.length === 0 ? <li className="italic">Nenhum exercício</li> : null}
                    </ul>
                  </Link>
                  {preview.remaining > 0 ? (
                    <Button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`workout-exercises-${workout.id}`}
                      aria-label={expanded ? 'Ocultar exercícios' : 'Mostrar todos os exercícios'}
                      onClick={() =>
                        setExpandedWorkouts((current) => ({ ...current, [workout.id]: !expanded }))
                      }
                      variant="ghost"
                      className="absolute bottom-5 left-5 z-20 border-0 px-0 py-0 text-sm italic text-muted-foreground underline underline-offset-4 hover:bg-transparent hover:opacity-100 focus-visible:outline-none focus-visible:ring-1"
                    >
                      {expanded
                        ? 'Ocultar exercícios'
                        : `Mostrar mais ${preview.remaining} exercícios`}
                    </Button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
