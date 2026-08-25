'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { ExerciseImageCarousel } from '@/components/exercise/ExerciseImageCarousel';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { SearchIcon } from '@/components/ui/WorkoutIcons';
import { addWorkoutExercise, getExercises } from '@/lib/api';
import { formatLabel } from '@/lib/utils';
import type { WeekDay } from '@/schemas/api';
import { toast } from 'sonner';

const EXERCISES_PAGE_SIZE = 20;

const isDuplicateError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 409;

export interface AddExerciseDialogProps {
  weekDay: WeekDay;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const AddExerciseDialog = ({
  weekDay,
  open,
  onOpenChange,
  triggerRef,
}: AddExerciseDialogProps): React.JSX.Element => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [isRetryingSearch, setIsRetryingSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(open);
  const normalizedSearch = debouncedSearch.trim();
  const searchResults = useInfiniteQuery({
    queryKey: ['exercises', normalizedSearch],
    queryFn: ({ pageParam, signal }) =>
      getExercises(normalizedSearch, EXERCISES_PAGE_SIZE, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * EXERCISES_PAGE_SIZE;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: open && normalizedSearch.length > 0,
  });
  const addExercise = useMutation({
    mutationFn: (exerciseId: string) => addWorkoutExercise(weekDay, exerciseId),
    onMutate: () => setDismissedError(null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Exercício adicionado ao treino.');
      clearSearch();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      if (isDuplicateError(error)) toast.warning('Este exercício já está no treino.');
    },
  });

  useEffect(() => {
    if (search.length === 0) return;

    const timeout = window.setTimeout(() => setDebouncedSearch(search), 1000);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open, triggerRef]);

  const clearSearch = (): void => {
    setSearch('');
    setDebouncedSearch('');
  };

  const clearSearchAndFocus = (): void => {
    clearSearch();
    searchInputRef.current?.focus();
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (value.length === 0) setDebouncedSearch('');
  };

  const retrySearch = (): void => {
    setIsRetryingSearch(true);
    void searchResults.refetch().finally(() => setIsRetryingSearch(false));
  };

  const activeError = searchResults.isError
    ? { key: 'search-error', message: 'Não foi possível buscar exercícios.' }
    : addExercise.isError && !isDuplicateError(addExercise.error)
      ? { key: 'add-exercise-error', message: 'Não foi possível adicionar o exercício.' }
      : null;
  const errorMessage =
    activeError && activeError.key !== dismissedError ? activeError.message : null;

  return (
    <>
      <ErrorAlertDialog
        open={errorMessage !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDismissedError(activeError?.key ?? null);
        }}
        message={errorMessage ?? ''}
      />
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) clearSearch();
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Adicionar exercício</DialogTitle>
            <DialogDescription>Busque um exercício para adicioná-lo ao treino.</DialogDescription>
          </DialogHeader>
          <Input
            ref={searchInputRef}
            autoFocus
            type="search"
            aria-label="Buscar exercícios"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar exercícios para adicionar..."
            leadingIcon={
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            }
            onClear={clearSearchAndFocus}
            clearLabel="Limpar busca"
          />
          <div data-slot="exercise-search-results" className="min-h-0 overflow-y-auto pr-1">
            {normalizedSearch ? (
              <>
                {searchResults.isError || isRetryingSearch ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <p role="alert" className="text-sm text-destructive">
                      Não foi possível buscar exercícios.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={retrySearch}
                      loading={isRetryingSearch}
                    >
                      {isRetryingSearch ? 'Tentando novamente…' : 'Tentar novamente'}
                    </Button>
                  </div>
                ) : searchResults.isPending ? (
                  <div className="flex justify-center py-12">
                    <Loading message="Buscando exercícios..." />
                  </div>
                ) : searchResults.data.pages.flatMap(({ items }) => items).length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum exercício encontrado.
                  </p>
                ) : (
                  <>
                    <ul className="flex flex-col gap-3" aria-label="Resultados da busca">
                      {searchResults.data.pages
                        .flatMap(({ items }) => items)
                        .map((exercise, index) => (
                          <li
                            key={exercise.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <ExerciseImageCarousel
                              exerciseId={exercise.id}
                              exerciseName={exercise.name}
                              aboveTheFold={index === 0}
                              className="group overflow-hidden rounded-md bg-secondary"
                            />
                            <div className="mt-3 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="break-words text-sm font-semibold">
                                  {exercise.name}
                                </h3>
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
                                size="lg"
                                className="h-9"
                                loading={addExercise.isPending}
                                aria-label={'Adicionar ' + exercise.name}
                                onClick={() => addExercise.mutate(exercise.id)}
                              >
                                {addExercise.isPending ? 'Adicionando…' : 'Adicionar'}
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
                          loading={searchResults.isFetchingNextPage}
                        >
                          {searchResults.isFetchingNextPage
                            ? 'Carregando exercícios…'
                            : 'Carregar mais exercícios'}
                        </Button>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { AddExerciseDialog };
