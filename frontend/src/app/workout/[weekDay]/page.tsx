'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { Loading } from '@/components/ui/Loading';
import { AddExerciseDialog } from '@/components/workout/AddExerciseDialog';
import { ClearWorkoutDialog } from '@/components/workout/ClearWorkoutDialog';
import { RemoveWorkoutExerciseDialog } from '@/components/workout/RemoveWorkoutExerciseDialog';
import { ArrowLeftIcon, BrushIcon, TrashIcon } from '@/components/ui/WorkoutIcons';
import { useAuth } from '@/contexts/AuthContext';
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
        <Header />
        <main className="flex flex-1 items-center justify-center bg-background px-4 py-8 sm:px-6">
          <section
            aria-labelledby="invalid-workout-title"
            className="w-full max-w-[26rem] rounded-[calc(var(--radius)+0.25rem)] border border-border bg-card px-10 py-12 text-center max-sm:px-6 max-sm:py-8"
          >
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <DumbbellIcon className="size-7" aria-hidden="true" />
            </div>
            <h1 id="invalid-workout-title" className="text-xl font-semibold tracking-tight">
              Esse treino não existe
            </h1>
            <p className="mx-auto mt-3 max-w-[26rem] text-sm leading-6 text-muted-foreground">
              O endereço pode estar incorreto ou este dia não faz parte da sua ficha.
            </p>
            <Button asChild className="mt-8 w-full sm:w-auto">
              <Link href="/dashboard">Voltar para meus treinos</Link>
            </Button>
          </section>
        </main>
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
          <div className="mb-4 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold tracking-tight">{dayName}</h2>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {weekDay ? (
                <>
                  <Button
                    ref={addExerciseTriggerRef}
                    type="button"
                    onClick={() => setAddExerciseDialogOpen(true)}
                    className="w-full sm:w-auto"
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
                className="w-full gap-1.5 border-border text-muted-foreground hover:border-destructive/30 hover:text-destructive disabled:hover:border-border disabled:hover:text-muted-foreground sm:w-auto"
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
                const isRemoving = removeExercise?.exerciseId === exercise.id;
                return (
                  <ExerciseCard
                    key={id}
                    exercise={exercise}
                    aboveTheFold={index === 0}
                    instructionsOpen={instructionsOpen}
                    onToggleInstructions={() => setOpenInstructions(instructionsOpen ? null : id)}
                    leadingActions={
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
                    }
                    trailingActions={
                      <Button
                        variant="default"
                        disabled={
                          removeWorkoutExerciseMutation.isPending || clearWorkoutMutation.isPending
                        }
                        aria-busy={isRemoving && removeWorkoutExerciseMutation.isPending}
                        aria-label={`Remover ${exercise.name}`}
                        onClick={() =>
                          setRemoveExercise({
                            exerciseId: exercise.id,
                            exerciseName: exercise.name,
                          })
                        }
                        className="ml-auto gap-1.5 bg-destructive text-primary-foreground hover:bg-destructive/90 max-[640px]:col-span-1 max-[640px]:ml-0 max-[640px]:w-full"
                      >
                        <TrashIcon className="size-3.5" />
                        {isRemoving && removeWorkoutExerciseMutation.isPending
                          ? 'Removendo…'
                          : 'Remover'}
                      </Button>
                    }
                  />
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
