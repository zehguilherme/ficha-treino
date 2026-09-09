'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ExerciseCard, ExerciseLevelTooltip } from '@/components/exercise/ExerciseCard';
import { Footer } from '@/components/layout/Footer';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { Combobox, type ComboboxHandle } from '@/components/ui/Combobox';
import { IconLink } from '@/components/ui/IconLink';
import { Loading } from '@/components/ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ArrowLeftIcon, ChevronDownIcon, XIcon } from '@/components/ui/WorkoutIcons';
import { addWorkoutExercise, getExercises, type ExerciseFilters } from '@/lib/api';
import { EXERCISE_LABELS } from '@/lib/exerciseLabels';
import { getWeekDaySlug } from '@/lib/weekDays';
import type { ExerciseDetails, WeekDay } from '@/schemas/api';
import { toast } from 'sonner';

const EXERCISES_PAGE_SIZE = 20;

const loadExerciseSuggestions = async (
  query: string,
  signal: AbortSignal,
): Promise<ReadonlyArray<ExerciseDetails>> => {
  const response = await getExercises(query, 5, 0, signal);
  return response.items;
};

type FilterDefinition = {
  key: keyof ExerciseFilters;
  label: string;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};

const getFilterDefinition = (key: keyof ExerciseFilters): FilterDefinition | undefined =>
  FILTER_DEFINITIONS.find((definition) => definition.key === key);

const toOptions = (
  values: ReadonlyArray<readonly [string, string]>,
): ReadonlyArray<{ value: string; label: string }> =>
  values.map(([value, label]) => ({ value, label }));

const MUSCLE_OPTIONS = toOptions(Object.entries(EXERCISE_LABELS.muscle));

const FILTER_DEFINITIONS: ReadonlyArray<FilterDefinition> = [
  {
    key: 'category',
    label: 'Categoria',
    placeholder: 'Selecionar categoria',
    options: toOptions(Object.entries(EXERCISE_LABELS.category)),
  },
  {
    key: 'equipment',
    label: 'Equipamento',
    placeholder: 'Selecionar equipamento',
    options: toOptions(Object.entries(EXERCISE_LABELS.equipment)),
  },
  {
    key: 'level',
    label: 'Nível',
    placeholder: 'Selecionar nível',
    options: toOptions(Object.entries(EXERCISE_LABELS.level)),
  },
  {
    key: 'force',
    label: 'Tipo de força',
    placeholder: 'Selecionar tipo de força',
    options: toOptions(Object.entries(EXERCISE_LABELS.force)),
  },
  {
    key: 'mechanic',
    label: 'Mecânica',
    placeholder: 'Selecionar mecânica',
    options: toOptions(Object.entries(EXERCISE_LABELS.mechanic)),
  },
  {
    key: 'primaryMuscle',
    label: 'Músculo primário',
    placeholder: 'Selecionar músculo primário',
    options: MUSCLE_OPTIONS,
  },
  {
    key: 'secondaryMuscle',
    label: 'Músculo secundário',
    placeholder: 'Selecionar músculo secundário',
    options: MUSCLE_OPTIONS,
  },
];

const isDuplicateError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 409;

export interface AddExercisePageProps {
  weekDay: WeekDay;
  onAdded?: () => void;
}

const AddExercisePage = ({ weekDay, onAdded }: AddExercisePageProps): React.JSX.Element => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [catalogRequested, setCatalogRequested] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [draftFilters, setDraftFilters] = useState<ExerciseFilters>({});
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filterAnnouncement, setFilterAnnouncement] = useState('');
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [isRetryingSearch, setIsRetryingSearch] = useState(false);
  const [openInstructions, setOpenInstructions] = useState<string | null>(null);
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const firstFilterRef = useRef<HTMLButtonElement>(null);
  const comboboxRef = useRef<ComboboxHandle>(null);
  const normalizedSearch = submittedSearch.trim();
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const hasDraftFilters = Object.values(draftFilters).some(Boolean);
  const hasPendingFilterChanges = FILTER_DEFINITIONS.some(
    ({ key }) => draftFilters[key] !== filters[key],
  );
  const searchResults = useInfiniteQuery({
    queryKey: ['exercises', normalizedSearch, filters],
    queryFn: ({ pageParam, signal }) =>
      hasActiveFilters
        ? getExercises(normalizedSearch, EXERCISES_PAGE_SIZE, pageParam, signal, filters)
        : getExercises(normalizedSearch, EXERCISES_PAGE_SIZE, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * EXERCISES_PAGE_SIZE;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: catalogRequested || normalizedSearch.length > 0 || hasActiveFilters,
  });
  const hasSearchResults = searchResults.data?.pages.some(({ items }) => items.length > 0) ?? false;

  useEffect(() => {
    if (filterPanelOpen) firstFilterRef.current?.focus();
  }, [filterPanelOpen]);

  useEffect(() => {
    if (resultsContainerRef.current) resultsContainerRef.current.scrollTop = 0;
  }, [normalizedSearch, filters]);

  const addExercise = useMutation({
    mutationFn: (exerciseId: string) => addWorkoutExercise(weekDay, exerciseId),
    onMutate: (exerciseId) => {
      setAddingExerciseId(exerciseId);
      setDismissedError(null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Exercício adicionado ao treino.');
      onAdded?.();
    },
    onError: (error: unknown) => {
      if (isDuplicateError(error)) toast.warning('Este exercício já está no treino.');
    },
    onSettled: () => setAddingExerciseId(null),
  });

  const openFilterPanel = (): void => {
    setFilterPanelOpen(true);
  };

  const closeFilterPanel = (): void => {
    setFilterPanelOpen(false);
    filterTriggerRef.current?.focus();
  };

  const updateDraftFilter = (key: keyof ExerciseFilters, value: string): void => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const clearDraftFilter = (key: keyof ExerciseFilters): void => {
    setDraftFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const submitSearch = (query = search, returnFocusToFilters = true): void => {
    const nextSearch = query.trim();
    const nextFilters = { ...draftFilters };
    const count = Object.values(nextFilters).filter(Boolean).length;
    if (!nextSearch && count === 0 && !hasPendingFilterChanges) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (nextSearch) comboboxRef.current?.blur();
    setSubmittedSearch(nextSearch);
    setCatalogRequested(false);
    setFilters(nextFilters);
    setFilterPanelOpen(false);
    setFilterAnnouncement(
      count === 0
        ? 'Pesquisa iniciada.'
        : count === 1
          ? 'Pesquisa iniciada com 1 filtro.'
          : `Pesquisa iniciada com ${count} filtros.`,
    );
    if (returnFocusToFilters) filterTriggerRef.current?.focus();
  };

  const clearAllSearchAndFilters = (): void => {
    setSearch('');
    setSubmittedSearch('');
    setFilters({});
    setDraftFilters({});
    setCatalogRequested(false);
    comboboxRef.current?.clear();
    setFilterPanelOpen(false);
    setFilterAnnouncement('Busca e filtros limpos. Exibindo todos os exercícios.');
    comboboxRef.current?.focus();
  };

  const clearFilter = (key: keyof ExerciseFilters): void => {
    setDraftFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
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
  const renderFilter = (key: keyof ExerciseFilters): React.JSX.Element | null => {
    const definition = getFilterDefinition(key);
    if (!definition) return null;
    const { label, placeholder, options } = definition;
    const value = draftFilters[key];
    return (
      <div key={key} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`exercise-filter-${key}`} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {key === 'level' ? <ExerciseLevelTooltip /> : null}
        </div>
        <div className="relative">
          <Select
            value={value ?? ''}
            onValueChange={(nextValue) => updateDraftFilter(key, nextValue)}
          >
            <SelectTrigger
              ref={key === 'category' ? firstFilterRef : undefined}
              id={`exercise-filter-${key}`}
              aria-label={label}
              className={value ? 'min-w-0 pr-14' : 'min-w-0'}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Limpar filtro ${label}`}
              className="absolute right-2 top-1/2 -translate-y-1/2 border-0"
              onClick={() => clearDraftFilter(key)}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderSearchActions = (fixed = false): React.JSX.Element => (
    <div
      data-slot={fixed ? 'exercise-action-bar' : undefined}
      className={
        fixed ? 'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card shadow-lg' : 'mt-2'
      }
    >
      <div
        className={
          fixed
            ? 'mx-auto flex w-full max-w-[80rem] flex-col gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6'
            : 'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={clearAllSearchAndFilters}
          disabled={!hasActiveFilters && !hasDraftFilters && !hasSearchResults}
        >
          Limpar busca e filtros
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => submitSearch()}
          disabled={!search.trim() && !hasDraftFilters && !hasPendingFilterChanges}
          loading={searchResults.isFetching}
        >
          {searchResults.isFetching ? 'Pesquisando exercícios…' : 'Pesquisar exercícios'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <main className="flex-1 bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-card">
          <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 px-4 sm:px-6">
            <IconLink
              href={`/treinos/${getWeekDaySlug(weekDay)}`}
              icon={<ArrowLeftIcon className="size-4" aria-hidden="true" />}
              variant="outline"
              size="icon"
              aria-label="Voltar para o treino"
            />
            <h1 className="text-base font-semibold tracking-tight">Adicionar exercício</h1>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <ErrorAlertDialog
            open={errorMessage !== null}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setDismissedError(activeError?.key ?? null);
            }}
            message={errorMessage ?? ''}
          />
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Adicionar exercício</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Busque um exercício para adicioná-lo ao treino.
            </p>
          </div>
          <div data-slot="exercise-search-shell" className="contents">
            <div
              data-slot="exercise-search-controls"
              className="sticky top-14 z-10 -mx-4 bg-background px-4 pb-3 pt-1 sm:-mx-6 sm:px-6"
            >
              <Combobox
                ref={comboboxRef}
                aria-label="Buscar exercícios"
                placeholder="Buscar pelo nome do exercício..."
                loadOptions={loadExerciseSuggestions}
                onQueryChange={handleSearchChange}
                onSubmit={(query) => submitSearch(query, false)}
                itemToStringLabel={(item) => item.name}
              />
              <div className="mt-3 min-w-0 min-h-0">
                <Button
                  ref={filterTriggerRef}
                  type="button"
                  variant="outline"
                  aria-expanded={filterPanelOpen}
                  aria-controls="exercise-filters"
                  aria-label="Mais filtros"
                  className="h-10 w-full justify-between bg-card px-3 font-sans text-sm !font-normal !tracking-normal text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/10"
                  onClick={filterPanelOpen ? closeFilterPanel : openFilterPanel}
                >
                  <span>Filtros avançados</span>
                  <ChevronDownIcon
                    className={`size-4 transition-transform ${filterPanelOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </Button>
                {Object.keys(draftFilters).length > 0 ? (
                  <div
                    className="mt-2 flex min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1"
                    aria-label="Filtros ativos"
                  >
                    {FILTER_DEFINITIONS.map(({ key, label, options }) => {
                      const value = draftFilters[key];
                      if (!value) return null;
                      const optionLabel =
                        options.find((option) => option.value === value)?.label ?? value;
                      return (
                        <Button
                          key={key}
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Remover filtro ${label}`}
                          className="shrink-0 gap-1 rounded-full"
                          onClick={() => clearFilter(key)}
                        >
                          {label}: {optionLabel}
                          <XIcon className="size-3" aria-hidden="true" />
                        </Button>
                      );
                    })}
                  </div>
                ) : null}
                {filterAnnouncement ? (
                  <p role="status" aria-live="polite" className="sr-only">
                    {filterAnnouncement}
                  </p>
                ) : null}
              </div>
              {!filterPanelOpen ? renderSearchActions() : null}
            </div>
            <div className="contents">
              <div
                id="exercise-filters"
                hidden={!filterPanelOpen}
                role="region"
                aria-label="Filtros de exercícios"
                className="flex min-w-0 min-h-0 flex-col rounded-[var(--radius)] border border-border bg-muted/50 p-3 sm:p-4"
              >
                <div className="min-h-0 overflow-y-auto pr-1">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FILTER_DEFINITIONS.map(({ key }) => renderFilter(key))}
                  </div>
                </div>
              </div>
              {filterPanelOpen ? renderSearchActions(true) : null}
            </div>
          </div>
          <div className="flex min-w-0 flex-col">
            <div
              ref={resultsContainerRef}
              data-slot="exercise-search-results"
              className={filterPanelOpen ? 'mt-4 min-w-0 pb-32 sm:pb-24' : 'mt-4 min-w-0'}
            >
              {catalogRequested || normalizedSearch || hasActiveFilters ? (
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
                          .map((exercise, index) => {
                            const isAdding =
                              addingExerciseId === exercise.id && addExercise.isPending;
                            return (
                              <li key={exercise.id}>
                                <ExerciseCard
                                  exercise={exercise}
                                  aboveTheFold={index === 0}
                                  instructionsOpen={openInstructions === exercise.id}
                                  onToggleInstructions={() =>
                                    setOpenInstructions((current) =>
                                      current === exercise.id ? null : exercise.id,
                                    )
                                  }
                                  trailingActions={
                                    <Button
                                      type="button"
                                      className="ml-auto gap-1.5 max-[640px]:col-span-1 max-[640px]:ml-0 max-[640px]:w-full"
                                      disabled={addExercise.isPending}
                                      loading={isAdding}
                                      aria-label={'Adicionar ' + exercise.name}
                                      onClick={() => addExercise.mutate(exercise.id)}
                                    >
                                      {isAdding ? 'Adicionando…' : 'Adicionar'}
                                    </Button>
                                  }
                                />
                              </li>
                            );
                          })}
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export { AddExercisePage };
