'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ChevronDownIcon, SearchIcon, XIcon } from '@/components/ui/WorkoutIcons';
import { addWorkoutExercise, getExercises, type ExerciseFilters } from '@/lib/api';
import type { WeekDay } from '@/schemas/api';
import { toast } from 'sonner';

const EXERCISES_PAGE_SIZE = 20;

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

const MUSCLE_OPTIONS = toOptions([
  ['abdominais', 'Abdominais'],
  ['abdutores', 'Abdutores'],
  ['adutores', 'Adutores'],
  ['antebracos', 'Antebraços'],
  ['biceps', 'Bíceps'],
  ['dorsais', 'Dorsais'],
  ['gluteos', 'Glúteos'],
  ['inferior-das-costas', 'Inferior das costas'],
  ['isquiotibiais', 'Isquiotibiais'],
  ['meio-das-costas', 'Meio das costas'],
  ['ombros', 'Ombros'],
  ['panturrilhas', 'Panturrilhas'],
  ['peito', 'Peito'],
  ['pescoco', 'Pescoço'],
  ['quadriceps', 'Quadríceps'],
  ['trapezio', 'Trapézio'],
  ['triceps', 'Tríceps'],
]);

const FILTER_DEFINITIONS: ReadonlyArray<FilterDefinition> = [
  {
    key: 'category',
    label: 'Categoria',
    placeholder: 'Selecionar categoria',
    options: toOptions([
      ['alongamento', 'Alongamento'],
      ['cardio', 'Cardio'],
      ['forca', 'Força'],
      ['levantamento-olimpico', 'Levantamento olímpico'],
      ['pliometria', 'Pliometria'],
      ['powerlifting', 'Powerlifting'],
      ['strongman', 'Strongman'],
    ]),
  },
  {
    key: 'equipment',
    label: 'Equipamento',
    placeholder: 'Selecionar equipamento',
    options: toOptions([
      ['barra', 'Barra'],
      ['barra-w', 'Barra W'],
      ['bola-de-exercicio', 'Bola de exercício'],
      ['bola-medicinal', 'Bola medicinal'],
      ['cabo', 'Cabo'],
      ['faixas', 'Faixas'],
      ['halteres', 'Halteres'],
      ['kettlebell', 'Kettlebell'],
      ['maquina', 'Máquina'],
      ['outros', 'Outros'],
      ['peso-do-corpo', 'Peso do corpo'],
      ['rolo-de-espuma', 'Rolo de espuma'],
    ]),
  },
  {
    key: 'level',
    label: 'Nível',
    placeholder: 'Selecionar nível',
    options: toOptions([
      ['iniciante', 'Iniciante'],
      ['intermediario', 'Intermediário'],
      ['avancado', 'Avançado'],
    ]),
  },
  {
    key: 'force',
    label: 'Tipo de força',
    placeholder: 'Selecionar tipo de força',
    options: toOptions([
      ['push', 'Empurrar'],
      ['static', 'Estático'],
      ['pull', 'Puxar'],
    ]),
  },
  {
    key: 'mechanic',
    label: 'Mecânica',
    placeholder: 'Selecionar mecânica',
    options: toOptions([
      ['composto', 'Composto'],
      ['isolado', 'Isolado'],
    ]),
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
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [catalogRequested, setCatalogRequested] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [draftFilters, setDraftFilters] = useState<ExerciseFilters>({});
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filterAnnouncement, setFilterAnnouncement] = useState('');
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [isRetryingSearch, setIsRetryingSearch] = useState(false);
  const [openInstructions, setOpenInstructions] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const firstFilterRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);
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
    enabled: open && (catalogRequested || normalizedSearch.length > 0 || hasActiveFilters),
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
    onMutate: () => setDismissedError(null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workout', weekDay] });
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Exercício adicionado ao treino.');
      resetDialogState();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      if (isDuplicateError(error)) toast.warning('Este exercício já está no treino.');
    },
  });

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open, triggerRef]);

  const clearSearch = (): void => {
    setSearch('');
  };

  const resetDialogState = (): void => {
    setSearch('');
    setSubmittedSearch('');
    setCatalogRequested(false);
    setFilters({});
    setDraftFilters({});
    setFilterPanelOpen(false);
    setFilterAnnouncement('');
    setOpenInstructions(null);
  };

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

  const submitSearch = (returnFocusToFilters = true): void => {
    const nextSearch = search.trim();
    const nextFilters = { ...draftFilters };
    const count = Object.values(nextFilters).filter(Boolean).length;
    if (!nextSearch && count === 0 && !hasPendingFilterChanges) return;
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
    setFilterPanelOpen(false);
    setFilterAnnouncement('Busca e filtros limpos. Exibindo todos os exercícios.');
    filterTriggerRef.current?.focus();
  };

  const clearFilter = (key: keyof ExerciseFilters): void => {
    setDraftFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const clearSearchAndFocus = (): void => {
    clearSearch();
    searchInputRef.current?.focus();
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
        <label htmlFor={`exercise-filter-${key}`} className="text-sm font-medium text-foreground">
          {label}
        </label>
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
          if (!nextOpen) resetDialogState();
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent
          onEscapeKeyDown={(event) => {
            if (filterPanelOpen) {
              event.preventDefault();
              closeFilterPanel();
            }
          }}
          className="min-w-0 grid-rows-[auto_auto_auto_minmax(0,1fr)] overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle>Adicionar exercício</DialogTitle>
            <DialogDescription>Busque um exercício para adicioná-lo ao treino.</DialogDescription>
          </DialogHeader>
          <Input
            ref={searchInputRef}
            type="search"
            aria-label="Buscar exercícios"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar pelo nome do exercício..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitSearch(false);
              }
            }}
            leadingIcon={
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            }
            onClear={clearSearchAndFocus}
            clearLabel="Limpar busca"
          />
          <div className="min-w-0 min-h-0">
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
          <div className="flex h-full min-w-0 min-h-0 flex-col">
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
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              >
                Pesquisar exercícios
              </Button>
            </div>
            <div
              ref={resultsContainerRef}
              data-slot="exercise-search-results"
              hidden={filterPanelOpen}
              className="mt-4 min-w-0 min-h-0 flex-1 overflow-y-auto pr-1"
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
                          .map((exercise, index) => (
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
                                    loading={addExercise.isPending}
                                    aria-label={'Adicionar ' + exercise.name}
                                    onClick={() => addExercise.mutate(exercise.id)}
                                  >
                                    {addExercise.isPending ? 'Adicionando…' : 'Adicionar'}
                                  </Button>
                                }
                              />
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { AddExerciseDialog };
