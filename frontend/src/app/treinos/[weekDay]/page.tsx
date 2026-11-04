'use client';

import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { IconLink } from '@/components/ui/IconLink';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { Loading } from '@/components/ui/Loading';
import { Progress } from '@/components/ui/Progress';
import { ClearWorkoutDialog } from '@/components/workout/ClearWorkoutDialog';
import { RemoveWorkoutExerciseDialog } from '@/components/workout/RemoveWorkoutExerciseDialog';
import { CustomExerciseDialog } from '@/components/workout/CustomExerciseDialog';
import { CustomExerciseMenu } from '@/components/workout/CustomExerciseMenu';
import { ArrowLeftIcon, BrushIcon, TrashIcon } from '@/components/ui/WorkoutIcons';
import { useAuth } from '@/contexts/AuthContext';
import {
  clearWorkout,
  deleteCustomExercise,
  getWorkout,
  removeWorkoutExercise,
  setWorkoutExerciseDone,
  updateCustomExercise,
} from '@/lib/api';
import { DAY_NAMES, getWeekDayFromSlug, getWeekDaySlug } from '@/lib/weekDays';
import type { WeekDay, WorkoutResponse } from '@/schemas/api';
import { toast } from 'sonner';

const completionMutationKey = ['workout-exercise-done'] as const;

interface CompletionVariables {
  weekDay: WeekDay;
  workoutExerciseId: number;
  done: boolean;
}

const WorkoutDayPage = (): React.JSX.Element => {
  const params = useParams<{ weekDay: string }>();
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const weekDay = getWeekDayFromSlug(params.weekDay);
  const [openInstructions, setOpenInstructions] = useState<number | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [removeExercise, setRemoveExercise] = useState<{
    exerciseId: string;
    exerciseName: string;
    isCustom: boolean;
  } | null>(null);
  const [editingExercise, setEditingExercise] = useState<
    WorkoutResponse['workout']['exercises'][number]['exercise'] | null
  >(null);
  const customActionTriggerRef = useRef<HTMLButtonElement>(null);
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [completionErrorKey, setCompletionErrorKey] = useState<number | null>(null);
  const [localPendingCompletionCount, setLocalPendingCompletionCount] = useState(0);
  const completionErrorSequence = useRef(0);
  const completionLockRef = useRef(false);
  const requestedCompletions = useRef(new Set<number>());
  const [isRetryingWorkout, setIsRetryingWorkout] = useState(false);
  const pendingCompletions = useMutationState<CompletionVariables>({
    filters: { mutationKey: completionMutationKey, status: 'pending' },
    select: (mutation) => mutation.state.variables as CompletionVariables,
  });
  const pendingDayCompletions = pendingCompletions.filter(
    (variables) => variables.weekDay === weekDay,
  );
  const hasPendingCompletion = localPendingCompletionCount > 0 || pendingDayCompletions.length > 0;
  const workout = useQuery({
    queryKey: ['workout', weekDay],
    queryFn: () => getWorkout(weekDay ?? ''),
    enabled: status === 'authenticated' && weekDay !== null && !hasPendingCompletion,
    refetchOnWindowFocus: !hasPendingCompletion,
    refetchOnReconnect: !hasPendingCompletion,
  });
  const toggleExercise = useMutation({
    mutationKey: completionMutationKey,
    mutationFn: ({ workoutExerciseId, done }: CompletionVariables) =>
      setWorkoutExerciseDone(workoutExerciseId, done),
    onMutate: async (variables) => {
      if (queryClient.isMutating({ mutationKey: completionMutationKey }) === 1) {
        setDismissedError(null);
        setCompletionErrorKey(null);
      }
      await queryClient.cancelQueries({ queryKey: ['workout', variables.weekDay] });
      const current = queryClient.getQueryData<WorkoutResponse>(['workout', variables.weekDay]);
      const previousDone = current?.workout.exercises.find(
        (exercise) => exercise.id === variables.workoutExerciseId,
      )?.done;
      queryClient.setQueryData<WorkoutResponse>(['workout', variables.weekDay], (current) =>
        current
          ? {
              workout: {
                ...current.workout,
                exercises: current.workout.exercises.map((workoutExercise) =>
                  workoutExercise.id === variables.workoutExerciseId
                    ? { ...workoutExercise, done: variables.done }
                    : workoutExercise,
                ),
              },
            }
          : current,
      );
      return {
        weekDay: variables.weekDay,
        workoutExerciseId: variables.workoutExerciseId,
        previousDone,
      };
    },
    onSuccess: (updatedExercise, variables) => {
      queryClient.setQueryData<WorkoutResponse>(['workout', variables.weekDay], (current) =>
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
    },
    onError: (_error, _variables, context) => {
      const previousDone = context?.previousDone;
      if (context && previousDone !== undefined) {
        queryClient.setQueryData<WorkoutResponse>(['workout', context.weekDay], (current) =>
          current
            ? {
                workout: {
                  ...current.workout,
                  exercises: current.workout.exercises.map((exercise) =>
                    exercise.id === context.workoutExerciseId
                      ? { ...exercise, done: previousDone }
                      : exercise,
                  ),
                },
              }
            : current,
        );
      }
      setCompletionErrorKey(++completionErrorSequence.current);
    },
    onSettled: async (_data, _error, variables) => {
      requestedCompletions.current.delete(variables.workoutExerciseId);
      try {
        if (queryClient.isMutating({ mutationKey: completionMutationKey }) === 1) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['workout'] }),
            queryClient.invalidateQueries({ queryKey: ['workouts'] }),
          ]);
        }
      } finally {
        if (queryClient.isMutating({ mutationKey: completionMutationKey }) === 1) {
          completionLockRef.current = false;
        }
        setLocalPendingCompletionCount((count) => count - 1);
      }
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
  const updateCustomExerciseMutation = useMutation({
    mutationFn: (value: { exerciseId: string; name: string; primaryMuscle: string }) =>
      updateCustomExercise(weekDay ?? '', value.exerciseId, value.name, value.primaryMuscle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workout'] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setEditingExercise(null);
      toast.success('Exercício personalizado atualizado.');
    },
  });
  const deleteCustomExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => deleteCustomExercise(weekDay ?? '', exerciseId),
    onSuccess: (_response, exerciseId) => {
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
      toast.success('Exercício personalizado excluído.');
    },
  });

  const hasConflictingMutation =
    clearWorkoutMutation.isPending ||
    removeWorkoutExerciseMutation.isPending ||
    updateCustomExerciseMutation.isPending ||
    deleteCustomExerciseMutation.isPending;
  const isCompletionBlocked = hasPendingCompletion || hasConflictingMutation;
  const requestCompletion = (workoutExerciseId: number, done: boolean): void => {
    if (
      !weekDay ||
      hasConflictingMutation ||
      requestedCompletions.current.has(workoutExerciseId) ||
      pendingDayCompletions.some((variables) => variables.workoutExerciseId === workoutExerciseId)
    ) {
      return;
    }
    requestedCompletions.current.add(workoutExerciseId);
    completionLockRef.current = true;
    setLocalPendingCompletionCount((count) => count + 1);
    toggleExercise.mutate({ weekDay, workoutExerciseId, done });
  };

  const retryWorkout = (): void => {
    if (hasPendingCompletion) return;
    setIsRetryingWorkout(true);
    void workout.refetch().finally(() => setIsRetryingWorkout(false));
  };

  const activeError = workout.isError
    ? { key: 'workout-error', message: 'Não foi possível carregar o treino.' }
    : completionErrorKey !== null
      ? {
          key: `completion-error-${completionErrorKey}`,
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
          : updateCustomExerciseMutation.isError
            ? {
                key: 'update-custom-exercise-error',
                message: 'Não foi possível atualizar o exercício personalizado.',
              }
            : deleteCustomExerciseMutation.isError
              ? {
                  key: 'delete-custom-exercise-error',
                  message: 'Não foi possível excluir o exercício personalizado.',
                }
              : null;
  const errorMessage =
    activeError && activeError.key !== dismissedError ? activeError.message : null;
  const exercises = workout.data?.workout.exercises ?? [];
  const completed = exercises.filter(({ done }) => done).length;
  const progressValue = exercises.length > 0 ? (completed / exercises.length) * 100 : 0;
  const progressLabel =
    exercises.length === 0
      ? 'Nenhum exercício'
      : `${completed} de ${exercises.length} exercício${exercises.length === 1 ? '' : 's'} concluído${exercises.length === 1 ? '' : 's'}`;
  const compactProgressLabel =
    exercises.length === 0
      ? 'Nenhum exercício'
      : `${completed}/${exercises.length} concluído${exercises.length === 1 ? '' : 's'}`;
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
        <IconLink
          href="/treinos"
          icon={<ArrowLeftIcon className="size-4" aria-hidden="true" />}
          variant="outline"
          size="icon"
          aria-label="Voltar para o dashboard"
        />
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
          {dayName}
        </h1>
        {workout.data ? (
          exercises.length > 0 ? (
            <div className="w-52 shrink-0 max-[640px]:w-40 max-[420px]:w-28">
              <div className="mb-1 flex min-w-0 items-center justify-between gap-2 whitespace-nowrap text-[0.6875rem] font-medium text-muted-foreground">
                <span className="min-w-0 max-[640px]:hidden">{progressLabel}</span>
                <span className="hidden max-[640px]:inline">{compactProgressLabel}</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress
                value={progressValue}
                aria-label="Progresso do treino"
                aria-valuetext={progressLabel}
                indicatorClassName={progressValue === 100 ? 'bg-success' : 'bg-primary'}
              />
            </div>
          ) : (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {progressLabel}
            </span>
          )
        ) : null}
      </div>
    </header>
  ) : null;

  if (status !== 'authenticated')
    return (
      <>
        {errorDialog}
        <main className="flex-1 bg-background" />
        <Footer />
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
              <Link href="/treinos">Voltar para meus treinos</Link>
            </Button>
          </section>
        </main>
        <Footer />
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
        <Footer />
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
        <Footer />
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
          if (weekDay && !hasPendingCompletion) clearWorkoutMutation.mutate(weekDay);
        }}
      />
      <RemoveWorkoutExerciseDialog
        open={removeExercise !== null}
        isCustom={removeExercise?.isCustom}
        onOpenChange={(open) => {
          if (
            !open &&
            !removeWorkoutExerciseMutation.isPending &&
            !deleteCustomExerciseMutation.isPending
          ) {
            setRemoveExercise(null);
          }
        }}
        exerciseName={removeExercise?.exerciseName ?? ''}
        isPending={
          removeWorkoutExerciseMutation.isPending || deleteCustomExerciseMutation.isPending
        }
        onConfirm={() => {
          if (weekDay && removeExercise && !hasPendingCompletion) {
            if (removeExercise.isCustom) {
              deleteCustomExerciseMutation.mutate(removeExercise.exerciseId);
            } else {
              removeWorkoutExerciseMutation.mutate({
                selectedWeekDay: weekDay,
                exerciseId: removeExercise.exerciseId,
              });
            }
          }
        }}
      />
      <CustomExerciseDialog
        key={`edit-${editingExercise?.id ?? 'new'}`}
        open={editingExercise !== null}
        onOpenChange={(open) => {
          if (!open && !updateCustomExerciseMutation.isPending) {
            setEditingExercise(null);
            customActionTriggerRef.current?.focus({ preventScroll: true });
          }
        }}
        initialExercise={editingExercise}
        isPending={updateCustomExerciseMutation.isPending}
        onSubmit={(value) => {
          if (editingExercise && !hasPendingCompletion) {
            updateCustomExerciseMutation.mutate({
              exerciseId: editingExercise.id,
              ...value,
            });
          }
        }}
      />
      {workoutHeader}
      <div className="sticky top-14 z-10 bg-background px-4 shadow-sm sm:px-6">
        <div className="mx-auto max-w-4xl pb-4 pt-8">
          <div className="flex justify-end">
            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
              {weekDay ? (
                <Button asChild aria-disabled={isCompletionBlocked} className="w-full sm:w-auto">
                  <Link
                    href={`/treinos/${getWeekDaySlug(weekDay)}/adicionar-exercicio`}
                    aria-disabled={isCompletionBlocked}
                    tabIndex={isCompletionBlocked ? -1 : undefined}
                    onClick={(event) => {
                      if (isCompletionBlocked) event.preventDefault();
                    }}
                  >
                    Adicionar exercício
                  </Link>
                </Button>
              ) : null}
              <Button
                variant="outline"
                disabled={completed === 0 || clearWorkoutMutation.isPending || isCompletionBlocked}
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
        </div>
      </div>
      <main className="flex-1 bg-background px-4 pb-8 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
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
                const isSavingCompletion = pendingDayCompletions.some(
                  (variables) => variables.workoutExerciseId === id,
                );
                return (
                  <ExerciseCard
                    key={id}
                    exercise={exercise}
                    aboveTheFold={index === 0}
                    instructionsOpen={instructionsOpen}
                    onToggleInstructions={() => setOpenInstructions(instructionsOpen ? null : id)}
                    leadingActions={
                      <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={done}
                          className="size-5 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                          aria-label={`Feito: ${exercise.name}`}
                          aria-disabled={hasConflictingMutation || isSavingCompletion}
                          aria-busy={isSavingCompletion}
                          onCheckedChange={(checked) => requestCompletion(id, checked === true)}
                        />
                        Feito
                      </label>
                    }
                    trailingActions={
                      exercise.isCustom !== true ? (
                        <Button
                          variant="default"
                          disabled={
                            isCompletionBlocked ||
                            removeWorkoutExerciseMutation.isPending ||
                            clearWorkoutMutation.isPending
                          }
                          aria-busy={isRemoving && removeWorkoutExerciseMutation.isPending}
                          aria-label={`Remover ${exercise.name}`}
                          onClick={() =>
                            setRemoveExercise({
                              exerciseId: exercise.id,
                              exerciseName: exercise.name,
                              isCustom: false,
                            })
                          }
                          className="ml-auto gap-1.5 bg-destructive text-primary-foreground hover:bg-destructive/90 max-[640px]:col-span-1 max-[640px]:ml-0 max-[640px]:w-full"
                        >
                          <TrashIcon className="size-3.5" />
                          {isRemoving && removeWorkoutExerciseMutation.isPending
                            ? 'Removendo…'
                            : 'Remover'}
                        </Button>
                      ) : (
                        <CustomExerciseMenu
                          exerciseName={exercise.name}
                          completionLockRef={completionLockRef}
                          disabled={
                            isCompletionBlocked ||
                            updateCustomExerciseMutation.isPending ||
                            deleteCustomExerciseMutation.isPending ||
                            removeWorkoutExerciseMutation.isPending ||
                            clearWorkoutMutation.isPending
                          }
                          triggerRef={customActionTriggerRef}
                          onEdit={() => {
                            updateCustomExerciseMutation.reset();
                            setEditingExercise(exercise);
                          }}
                          onRemove={() => {
                            setRemoveExercise({
                              exerciseId: exercise.id,
                              exerciseName: exercise.name,
                              isCustom: true,
                            });
                          }}
                        />
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WorkoutDayPage;
