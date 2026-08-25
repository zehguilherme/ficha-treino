'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { ExerciseImageCarousel } from '@/components/exercise/ExerciseImageCarousel';
import { Loading } from '@/components/ui/Loading';
import { AddExerciseDialog } from '@/components/workout/AddExerciseDialog';
import { ClearWorkoutDialog } from '@/components/workout/ClearWorkoutDialog';
import { RemoveWorkoutExerciseDialog } from '@/components/workout/RemoveWorkoutExerciseDialog';
import {
  ArrowLeftIcon,
  BrushIcon,
  ChevronDownIcon,
  MuscleIcon,
  TrashIcon,
} from '@/components/ui/WorkoutIcons';
import { useAuth } from '@/contexts/AuthContext';
import { formatLabel } from '@/lib/utils';
import { clearWorkout, getWorkout, removeWorkoutExercise, toggleWorkoutExercise } from '@/lib/api';
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

const getWeekDay = (value: string | string[] | undefined): WeekDay | null => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && candidate in DAY_NAMES ? (candidate as WeekDay) : null;
};

const WorkoutDayPage = (): React.JSX.Element => {
  const params = useParams<{ weekDay: string }>();
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const weekDay = getWeekDay(params.weekDay);
  const [openInstructions, setOpenInstructions] = useState<number | null>(null);
  const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false);
  const addExerciseTriggerRef = useRef<HTMLButtonElement>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [removeExercise, setRemoveExercise] = useState<{
    exerciseId: string;
    exerciseName: string;
  } | null>(null);
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [isRetryingWorkout, setIsRetryingWorkout] = useState(false);
  const workout = useQuery({
    queryKey: ['workout', weekDay],
    queryFn: () => getWorkout(weekDay ?? ''),
    enabled: status === 'authenticated' && weekDay !== null,
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

  const retryWorkout = (): void => {
    setIsRetryingWorkout(true);
    void workout.refetch().finally(() => setIsRetryingWorkout(false));
  };

  const activeError = workout.isError
    ? { key: 'workout-error', message: 'Não foi possível carregar o treino.' }
    : toggleExercise.isError
      ? {
          key: 'toggle-exercise-error',
          message: 'Não foi possível atualizar o exercício.',
        }
      : clearWorkoutMutation.isError
        ? {
            key: 'clear-workout-error',
            message: 'Não foi possível limpar o treino.',
          }
        : removeWorkoutExerciseMutation.isError
          ? {
              key: 'remove-exercise-error',
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
          <Loading message="Carregando treino..." />
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
            loading={isRetryingWorkout}
          >
            {isRetryingWorkout ? 'Tentando novamente…' : 'Tentar novamente'}
          </Button>
        </main>
      </>
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
            <div className="flex items-center gap-2">
              {weekDay ? (
                <>
                  <Button
                    ref={addExerciseTriggerRef}
                    type="button"
                    onClick={() => setAddExerciseDialogOpen(true)}
                  >
                    Adicionar exercício
                  </Button>
                  <AddExerciseDialog
                    weekDay={weekDay}
                    open={addExerciseDialogOpen}
                    onOpenChange={setAddExerciseDialogOpen}
                    triggerRef={addExerciseTriggerRef}
                  />
                </>
              ) : null}
              <Button
                variant="outline"
                disabled={completed === 0 || clearWorkoutMutation.isPending}
                aria-label="Limpar treino"
                aria-busy={clearWorkoutMutation.isPending}
                onClick={() => setClearDialogOpen(true)}
                className="gap-1.5 border-border px-3 py-1.5 text-muted-foreground hover:border-destructive/30 hover:text-destructive disabled:hover:border-border disabled:hover:text-muted-foreground"
              >
                <BrushIcon className="size-4" />
                Limpar treino
              </Button>
            </div>
          </div>
          {exercises.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
              <DumbbellIcon className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Nenhum exercício neste treino.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use o botão Adicionar exercício para incluir exercícios.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exercises.map(({ id, done, exercise }, index) => {
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
                        aboveTheFold={index === 0}
                        className="group mb-4 overflow-hidden rounded-[var(--radius)] bg-secondary"
                      />
                      <div className="min-w-0">
                        <h3 className="mb-1.5 break-words text-[0.9375rem] font-semibold">
                          {exercise.name}
                        </h3>
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
                          {removeWorkoutExerciseMutation.isPending ? 'Removendo…' : 'Remover'}
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
