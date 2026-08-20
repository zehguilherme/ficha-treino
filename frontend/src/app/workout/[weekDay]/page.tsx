'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { ExerciseImageCarousel } from '@/components/exercise/ExerciseImageCarousel';
import { Input } from '@/components/ui/Input';
import { ClearWorkoutDialog } from '@/components/workout/ClearWorkoutDialog';
import { RemoveWorkoutExerciseDialog } from '@/components/workout/RemoveWorkoutExerciseDialog';
import {
  ArrowLeftIcon,
  BrushIcon,
  ChevronDownIcon,
  MuscleIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/ui/WorkoutIcons';
import { useAuth } from '@/contexts/AuthContext';
import {
  addWorkoutExercise,
  clearWorkout,
  getExercises,
  getWorkout,
  removeWorkoutExercise,
  toggleWorkoutExercise,
} from '@/lib/api';
import type { WeekDay, WorkoutResponse } from '@/schemas/api';
import { toast } from 'sonner';

const DAY_NAMES: Record<WeekDay, string> = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

const EXERCISES_PAGE_SIZE = 20;

const getWeekDay = (value: string | string[] | undefined): WeekDay | null => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && candidate in DAY_NAMES ? (candidate as WeekDay) : null;
};

const formatLabel = (value: string): string =>
  value
    .replace(/[-_]/g, ' ')
    .replace(
      /(^|\s)(\p{L})/gu,
      (_, separator: string, letter: string) => separator + letter.toLocaleUpperCase('pt-BR'),
    );

const isDuplicateError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 409;

const WorkoutDayPage = (): React.JSX.Element => {
  const params = useParams<{ weekDay: string }>();
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const weekDay = getWeekDay(params.weekDay);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openInstructions, setOpenInstructions] = useState<number | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [removeExercise, setRemoveExercise] = useState<{
    exerciseId: string;
    exerciseName: string;
  } | null>(null);
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [isRetryingWorkout, setIsRetryingWorkout] = useState(false);
  const normalizedSearch = debouncedSearch.trim();
  const workout = useQuery({
    queryKey: ['workout', weekDay],
    queryFn: () => getWorkout(weekDay ?? ''),
    enabled: status === 'authenticated' && weekDay !== null,
  });
  const searchResults = useInfiniteQuery({
    queryKey: ['exercises', normalizedSearch],
    queryFn: ({ pageParam, signal }) =>
      getExercises(normalizedSearch, EXERCISES_PAGE_SIZE, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * EXERCISES_PAGE_SIZE;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: status === 'authenticated' && normalizedSearch.length > 0,
  });
  const addExercise = useMutation({
    mutationFn: ({
      selectedWeekDay,
      exerciseId,
    }: {
      selectedWeekDay: WeekDay;
      exerciseId: string;
    }) => addWorkoutExercise(selectedWeekDay, exerciseId),
    onMutate: () => setDismissedError(null),
    onSuccess: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Exercício adicionado ao treino.');
      clearSearch();
      searchInputRef.current?.focus();
    },
    onError: (error: unknown) => {
      if (isDuplicateError(error)) toast.warning('Este exercício já está no treino.');
    },
  });
  const toggleExercise = useMutation({
    mutationFn: (workoutExerciseId: number) => toggleWorkoutExercise(workoutExerciseId),
    onMutate: () => setDismissedError(null),
    onSuccess: (updatedExercise) => {
      queryClient.setQueryData<WorkoutResponse>(['workout', weekDay], (current) =>
        current
          ? {
              workout: {
                ...current.workout,
                exercises: current.workout.exercises.map((workoutExercise) =>
                  workoutExercise.id === updatedExercise.id
                    ? { ...workoutExercise, done: updatedExercise.done }
                    : workoutExercise,
                ),
              },
            }
          : current,
      );
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
  const clearWorkoutMutation = useMutation({
    mutationFn: (selectedWeekDay: WeekDay) => clearWorkout(selectedWeekDay),
    onMutate: () => setDismissedError(null),
    onSuccess: () => {
      queryClient.setQueryData<WorkoutResponse>(['workout', weekDay], (current) =>
        current
          ? {
              workout: {
                ...current.workout,
                exercises: current.workout.exercises.map((workoutExercise) => ({
                  ...workoutExercise,
                  done: false,
                })),
              },
            }
          : current,
      );
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setClearDialogOpen(false);
      toast.success('Treino limpo.');
    },
  });
  const removeWorkoutExerciseMutation = useMutation({
    mutationFn: ({
      selectedWeekDay,
      exerciseId,
    }: {
      selectedWeekDay: WeekDay;
      exerciseId: string;
    }) => removeWorkoutExercise(selectedWeekDay, exerciseId),
    onMutate: () => setDismissedError(null),
    onSuccess: (_response, { exerciseId }) => {
      queryClient.setQueryData<WorkoutResponse>(['workout', weekDay], (current) =>
        current
          ? {
              workout: {
                ...current.workout,
                exercises: current.workout.exercises.filter(
                  (workoutExercise) => workoutExercise.exercise.id !== exerciseId,
                ),
              },
            }
          : current,
      );
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setRemoveExercise(null);
      toast.success('Exercício removido do treino.');
    },
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 1000);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const clearSearch = (): void => {
    setSearch('');
    setDebouncedSearch('');
  };

  const retryWorkout = (): void => {
    setIsRetryingWorkout(true);
    void workout.refetch().finally(() => setIsRetryingWorkout(false));
  };

  const activeError = workout.isError
    ? { key: workout.error ?? 'workout-error', message: 'Não foi possível carregar o treino.' }
    : searchResults.isError
      ? {
          key: searchResults.error ?? 'search-error',
          message: 'Não foi possível buscar exercícios.',
        }
      : addExercise.isError && !isDuplicateError(addExercise.error)
        ? {
            key: addExercise.error ?? 'add-exercise-error',
            message: 'Não foi possível adicionar o exercício.',
          }
        : toggleExercise.isError
          ? {
              key: toggleExercise.error ?? 'toggle-exercise-error',
              message: 'Não foi possível atualizar o exercício.',
            }
          : clearWorkoutMutation.isError
            ? {
                key: clearWorkoutMutation.error ?? 'clear-workout-error',
                message: 'Não foi possível limpar o treino.',
              }
            : removeWorkoutExerciseMutation.isError
              ? {
                  key: removeWorkoutExerciseMutation.error ?? 'remove-exercise-error',
                  message: 'Não foi possível remover o exercício.',
                }
              : null;
  const errorMessage =
    activeError && activeError.key !== dismissedError ? activeError.message : null;
  const exercises = workout.data?.workout.exercises ?? [];
  const completed = exercises.filter(({ done }) => done).length;
  const dayName = weekDay ? DAY_NAMES[weekDay] : '';

  const errorDialog = (
    <ErrorAlertDialog
      open={errorMessage !== null}
      onOpenChange={(open) => {
        if (!open) setDismissedError(activeError?.key ?? null);
      }}
      message={errorMessage ?? ''}
    />
  );

  const workoutHeader = weekDay ? (
    <header className="sticky top-0 z-20 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 px-4 sm:px-6">
        <Button asChild variant="outline" size="icon" aria-label="Voltar para o dashboard">
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="flex-1 text-base font-semibold tracking-tight">{dayName}</h1>
        {workout.data ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {completed} / {exercises.length}
          </span>
        ) : null}
      </div>
    </header>
  ) : null;

  if (status !== 'authenticated')
    return (
      <>
        {errorDialog}
        <main className="flex-1 bg-background" />
      </>
    );
  if (!weekDay)
    return (
      <>
        {errorDialog}
        <main className="flex-1 bg-background p-8">Treino não encontrado</main>
      </>
    );
  if (workout.isPending && !isRetryingWorkout)
    return (
      <>
        {errorDialog}
        {workoutHeader}
        <main className="flex flex-1 items-center justify-center bg-background">
          <p role="status" className="text-sm text-muted-foreground">
            Carregando treino...
          </p>
        </main>
      </>
    );
  if (workout.isError || isRetryingWorkout)
    return (
      <>
        {errorDialog}
        {workoutHeader}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-4">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar o treino.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={retryWorkout}
            disabled={isRetryingWorkout}
            aria-busy={isRetryingWorkout}
          >
            {isRetryingWorkout ? 'Tentando novamente...' : 'Tentar novamente'}
          </Button>
        </main>
      </>
    );

  const filteredExercises = exercises.filter(({ exercise }) =>
    exercise.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
  );

  return (
    <>
      {errorDialog}
      <ClearWorkoutDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        dayName={dayName}
        isPending={clearWorkoutMutation.isPending}
        onConfirm={() => {
          if (weekDay) clearWorkoutMutation.mutate(weekDay);
        }}
      />
      <RemoveWorkoutExerciseDialog
        open={removeExercise !== null}
        onOpenChange={(open) => {
          if (!open && !removeWorkoutExerciseMutation.isPending) setRemoveExercise(null);
        }}
        exerciseName={removeExercise?.exerciseName ?? ''}
        isPending={removeWorkoutExerciseMutation.isPending}
        onConfirm={() => {
          if (weekDay && removeExercise) {
            removeWorkoutExerciseMutation.mutate({
              selectedWeekDay: weekDay,
              exerciseId: removeExercise.exerciseId,
            });
          }
        }}
      />
      {workoutHeader}
      <main className="flex-1 bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">{dayName}</h2>
            <Button
              variant="outline"
              disabled={exercises.length === 0 || clearWorkoutMutation.isPending}
              aria-label="Limpar treino"
              aria-busy={clearWorkoutMutation.isPending}
              onClick={() => setClearDialogOpen(true)}
              className="gap-1.5 border-border px-3 py-1.5 text-muted-foreground hover:border-destructive/30 hover:text-destructive disabled:hover:border-border disabled:hover:text-muted-foreground"
            >
              <BrushIcon className="size-4" />
              Limpar treino
            </Button>
          </div>
          <div className="sticky top-14 z-10 mb-6 bg-background py-3">
            <Input
              ref={searchInputRef}
              type="search"
              aria-label="Buscar exercícios"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar exercícios para adicionar..."
              leadingIcon={
                <SearchIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              }
              onClear={clearSearch}
              clearLabel="Limpar busca"
            />
          </div>
          {normalizedSearch ? (
            <>
              {searchResults.isPending ? (
                <p role="status" className="py-12 text-center text-sm text-muted-foreground">
                  Buscando exercícios...
                </p>
              ) : searchResults.isError ? (
                <div className="py-12" aria-hidden="true" />
              ) : searchResults.data.pages.flatMap(({ items }) => items).length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum exercício encontrado.
                </p>
              ) : (
                <>
                  <ul className="flex flex-col gap-3" aria-label="Resultados da busca">
                    {searchResults.data.pages
                      .flatMap(({ items }) => items)
                      .map((exercise) => (
                        <li
                          key={exercise.id}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <ExerciseImageCarousel
                            exerciseId={exercise.id}
                            exerciseName={exercise.name}
                            className="group overflow-hidden rounded-md bg-secondary"
                            controlClassName="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                          />
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold">{exercise.name}</h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {[exercise.category, exercise.equipment]
                                  .filter(Boolean)
                                  .map((tag) => formatLabel(tag ?? ''))
                                  .join(' · ')}
                              </p>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>
                                  <span className="font-medium text-foreground">
                                    Músculo primário:
                                  </span>{' '}
                                  {exercise.primaryMuscles.map(formatLabel).join(', ')}
                                </p>
                                {exercise.secondaryMuscles.length > 0 ? (
                                  <p>
                                    <span className="font-medium text-foreground">
                                      Músculos secundários:
                                    </span>{' '}
                                    {exercise.secondaryMuscles.map(formatLabel).join(', ')}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="h-9"
                              disabled={addExercise.isPending}
                              aria-busy={addExercise.isPending}
                              aria-label={'Adicionar ' + exercise.name}
                              onClick={() =>
                                addExercise.mutate({
                                  selectedWeekDay: weekDay,
                                  exerciseId: exercise.id,
                                })
                              }
                            >
                              {addExercise.isPending ? 'Adicionando...' : 'Adicionar'}
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                  {searchResults.hasNextPage ? (
                    <div className="mt-6 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void searchResults.fetchNextPage()}
                        disabled={searchResults.isFetchingNextPage}
                        aria-busy={searchResults.isFetchingNextPage}
                      >
                        {searchResults.isFetchingNextPage
                          ? 'Carregando exercícios...'
                          : 'Carregar mais exercícios'}
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : exercises.length === 0 ? (
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
                      <ExerciseImageCarousel
                        exerciseId={exercise.id}
                        exerciseName={exercise.name}
                        className="group mb-4 overflow-hidden rounded-[var(--radius)] bg-secondary"
                      />
                      <div className="min-w-0">
                        <h3 className="mb-1.5 text-[0.9375rem] font-semibold">{exercise.name}</h3>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {[exercise.category, exercise.equipment].filter(Boolean).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground"
                            >
                              {formatLabel(tag ?? '')}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em]">
                              <MuscleIcon className="size-3" filled aria-hidden="true" />
                              Músculo primário
                            </span>
                            <span className="pl-4 text-xs text-foreground">
                              {exercise.primaryMuscles.map(formatLabel).join(', ')}
                            </span>
                          </div>
                          {exercise.secondaryMuscles.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em]">
                                <MuscleIcon className="size-3" aria-hidden="true" />
                                Músculo secundário
                              </span>
                              <span className="pl-4 text-xs text-foreground">
                                {exercise.secondaryMuscles.map(formatLabel).join(', ')}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 max-[640px]:grid max-[640px]:grid-cols-1 max-[640px]:gap-y-2">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Checkbox
                            checked={done}
                            disabled={
                              toggleExercise.isPending ||
                              clearWorkoutMutation.isPending ||
                              removeWorkoutExerciseMutation.isPending
                            }
                            aria-label={`Feito: ${exercise.name}`}
                            onCheckedChange={() => toggleExercise.mutate(id)}
                          />
                          Feito
                        </label>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-9 gap-1 max-[640px]:col-span-1 max-[640px]:w-full sm:gap-2"
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
                          variant="default"
                          size="lg"
                          disabled={
                            removeWorkoutExerciseMutation.isPending ||
                            clearWorkoutMutation.isPending
                          }
                          aria-busy={removeWorkoutExerciseMutation.isPending}
                          aria-label={`Remover ${exercise.name}`}
                          onClick={() =>
                            setRemoveExercise({
                              exerciseId: exercise.id,
                              exerciseName: exercise.name,
                            })
                          }
                          className="ml-auto h-9 gap-1.5 bg-destructive text-primary-foreground hover:bg-destructive/90 max-[640px]:col-span-1 max-[640px]:ml-0 max-[640px]:w-full"
                        >
                          <TrashIcon className="size-3.5" />
                          {removeWorkoutExerciseMutation.isPending ? 'Removendo...' : 'Remover'}
                        </Button>
                      </div>
                      {instructionsOpen ? (
                        <div className="mt-3 rounded-[var(--radius)] bg-secondary p-3 text-sm leading-[1.6] text-muted-foreground">
                          {exercise.instructions.map((instruction) => (
                            <p key={instruction} className="mb-1.5">
                              • {instruction}
                            </p>
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
