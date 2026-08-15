'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/Carousel';
import { Checkbox } from '@/components/ui/Checkbox';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeftIcon,
  BrushIcon,
  ChevronDownIcon,
  SearchIcon,
  TargetIcon,
  TrashIcon,
} from '@/components/ui/WorkoutIcons';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkout } from '@/lib/api';
import { getExerciseImageUrl } from '@/lib/exerciseImage';
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

const getWeekDay = (value: string | string[] | undefined): WeekDay | null => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && candidate in DAY_NAMES ? (candidate as WeekDay) : null;
};

const formatLabel = (value: string): string =>
  value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const WorkoutDayPage = (): React.JSX.Element => {
  const params = useParams<{ weekDay: string }>();
  const { status } = useAuth();
  const weekDay = getWeekDay(params.weekDay);
  const [search, setSearch] = useState('');
  const [openInstructions, setOpenInstructions] = useState<number | null>(null);
  const workout = useQuery({
    queryKey: ['workout', weekDay],
    queryFn: () => getWorkout(weekDay ?? ''),
    enabled: status === 'authenticated' && weekDay !== null,
  });

  if (status !== 'authenticated') return <main className="flex-1 bg-background" />;
  if (!weekDay) return <main className="flex-1 bg-background p-8">Treino não encontrado</main>;
  if (workout.isPending)
    return (
      <main className="flex flex-1 items-center justify-center bg-background">
        <p role="status" className="text-sm text-muted-foreground">
          Carregando treino...
        </p>
      </main>
    );
  if (workout.isError)
    return (
      <main className="flex flex-1 items-center justify-center bg-background px-4">
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar o treino.
        </p>
      </main>
    );

  const exercises = workout.data.workout.exercises;
  const filteredExercises = exercises.filter(({ exercise }) =>
    exercise.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
  );
  const completed = exercises.filter(({ done }) => done).length;
  const dayName = DAY_NAMES[weekDay];

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 px-4 sm:px-6">
          <Button asChild variant="outline" size="icon" aria-label="Voltar para o dashboard">
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <h1 className="flex-1 text-base font-semibold tracking-tight">{dayName}</h1>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {completed} / {exercises.length}
          </span>
        </div>
      </header>
      <main className="flex-1 bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">{dayName}</h2>
            <Button
              variant="outline"
              disabled
              aria-label="Limpar treino"
              className="gap-1.5 border-border px-3 py-1.5 text-muted-foreground hover:border-destructive/30 hover:text-destructive disabled:hover:border-border disabled:hover:text-muted-foreground"
            >
              <BrushIcon className="size-4" />
              Limpar treino
            </Button>
          </div>
          <div className="relative mb-6">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Buscar exercícios"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar exercícios para adicionar..."
              className="pl-9"
            />
          </div>
          {exercises.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
              <DumbbellIcon className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Nenhum exercício neste treino.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use a busca acima para adicionar exercícios.
              </p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum exercício encontrado.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredExercises.map(({ id, done, exercise }) => {
                const instructionsOpen = openInstructions === id;
                return (
                  <article
                    key={id}
                    className="overflow-hidden rounded-[calc(var(--radius)+0.125rem)] border border-border bg-card transition-colors hover:border-ring/15"
                  >
                    <div className="p-5">
                      <Carousel
                        className="group mb-4 aspect-video overflow-hidden rounded-[var(--radius)] bg-secondary"
                        opts={{ loop: false }}
                      >
                        <CarouselContent className="h-full">
                          {[0, 1].map((imageIndex) => (
                            <CarouselItem key={imageIndex} className="h-full">
                              <img
                                src={getExerciseImageUrl(exercise.id, imageIndex as 0 | 1)}
                                alt={`${exercise.name} — imagem ${imageIndex + 1}`}
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                        <CarouselDots count={2} />
                      </Carousel>
                      <h3 className="text-[0.9375rem] font-semibold">{exercise.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[exercise.category, exercise.equipment].filter(Boolean).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-wide text-secondary-foreground"
                          >
                            {formatLabel(tag ?? '')}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <TargetIcon className="size-4" aria-hidden="true" />
                          <span>
                            <strong className="font-medium text-foreground">
                              Músculo primário:
                            </strong>{' '}
                            {exercise.primaryMuscles.map(formatLabel).join(', ')}
                          </span>
                        </p>
                        {exercise.secondaryMuscles.length > 0 ? (
                          <p className="flex items-center gap-2">
                            <TargetIcon className="size-4" aria-hidden="true" />
                            <span>
                              <strong className="font-medium text-foreground">
                                Músculo secundário:
                              </strong>{' '}
                              {exercise.secondaryMuscles.map(formatLabel).join(', ')}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Checkbox
                            checked={done}
                            disabled
                            aria-label={`Feito: ${exercise.name}`}
                          />
                          Feito
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenInstructions(instructionsOpen ? null : id)}
                          aria-expanded={instructionsOpen}
                          aria-label={`Instruções: ${exercise.name}`}
                        >
                          Instruções
                          <ChevronDownIcon
                            className={`size-3 transition-transform ${instructionsOpen ? 'rotate-180' : ''}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          aria-label={`Remover ${exercise.name}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="size-4" />
                          Remover
                        </Button>
                      </div>
                      {instructionsOpen ? (
                        <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                          {exercise.instructions.map((instruction) => (
                            <p key={instruction}>• {instruction}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default WorkoutDayPage;
