'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts } from '@/lib/api';
import { getExercisePreview } from '@/lib/dashboard';
import type { WeekDay } from '@/schemas/api';

const DAY_NAMES: Record<WeekDay, string> = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERÇA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

export const DashboardClient = (): React.JSX.Element => {
  const { status } = useAuth();
  const authenticated = status === 'authenticated';
  const workouts = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
    enabled: authenticated,
  });
  useEffect(() => {
    if (status === 'anonymous') window.location.replace('/login');
  }, [status]);
  if (!authenticated || workouts.isPending)
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center bg-background">
          <Spinner aria-label="Carregando treinos" />
        </main>
      </>
    );
  if (workouts.isError)
    return (
      <>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-4">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar seus treinos.
          </p>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm outline-none hover:bg-secondary focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => void workouts.refetch()}
          >
            Tentar novamente
          </button>
        </main>
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
              const preview = getExercisePreview(workout.exerciseNames);
              return (
                <Link
                  key={workout.id}
                  href={`/workout/${workout.weekDay}`}
                  className="rounded-[calc(var(--radius)+0.125rem)] border border-border bg-card p-5 outline-none transition hover:border-ring/15 hover:shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.9375rem] font-medium">
                      {DAY_NAMES[workout.weekDay]}
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {workout.exerciseCount}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {preview.names.map((name) => (
                      <p key={name} className="truncate" title={name}>
                        <span
                          aria-hidden="true"
                          className="mr-2 inline-block size-1.5 rounded-full bg-muted-foreground align-middle"
                        />
                        {name}
                      </p>
                    ))}
                    {preview.remaining > 0 ? (
                      <p className="italic">Mais {preview.remaining} exercícios</p>
                    ) : null}
                    {preview.names.length === 0 ? <p className="italic">Nenhum exercício</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};
