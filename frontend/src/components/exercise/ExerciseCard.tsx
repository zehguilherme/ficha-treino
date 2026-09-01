import * as React from 'react';
import { ExerciseTag } from '@/components/exercise/ExerciseTag';
import { ExerciseImageCarousel } from '@/components/exercise/ExerciseImageCarousel';
import { Button } from '@/components/ui/Button';
import {
  ChevronDownIcon,
  ForceIcon,
  LevelIcon,
  MechanicIcon,
  MuscleIcon,
} from '@/components/ui/WorkoutIcons';
import { formatLabel } from '@/lib/utils';
import type { ExerciseDetails } from '@/schemas/api';

const FORCE_LABELS: Record<string, string> = {
  pull: 'Puxar',
  push: 'Empurrar',
  static: 'Estático',
};

const formatForceLabel = (force: string): string => FORCE_LABELS[force] ?? formatLabel(force);

export interface ExerciseCardProps {
  exercise: ExerciseDetails;
  aboveTheFold?: boolean;
  instructionsOpen: boolean;
  onToggleInstructions: () => void;
  leadingActions?: React.ReactNode;
  trailingActions?: React.ReactNode;
}

const ExerciseCard = ({
  exercise,
  aboveTheFold = false,
  instructionsOpen,
  onToggleInstructions,
  leadingActions,
  trailingActions,
}: ExerciseCardProps): React.JSX.Element => (
  <article className="overflow-hidden rounded-[calc(var(--radius)+0.125rem)] border border-border bg-card transition-colors hover:border-ring/15">
    <div className="p-5">
      <ExerciseImageCarousel
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        aboveTheFold={aboveTheFold}
        className="group mb-4 overflow-hidden rounded-[var(--radius)] bg-secondary"
      />
      <div className="min-w-0">
        <h3 className="mb-1.5 break-words text-[0.9375rem] font-semibold">{exercise.name}</h3>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[
            { label: 'Categoria', value: exercise.category },
            { label: 'Equipamento', value: exercise.equipment },
          ].map(({ label, value }) => (
            <ExerciseTag key={label} label={label} value={value ? formatLabel(value) : null} />
          ))}
        </div>
        <dl className="mb-3 flex flex-wrap gap-2 border-y border-border py-3 text-xs sm:gap-6">
          <div className="max-w-full shrink-0">
            <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              <LevelIcon className="size-3.5 shrink-0" aria-hidden="true" />
              Nível
            </dt>
            <dd className="mt-0.5 break-words pl-5 text-foreground">
              {formatLabel(exercise.level)}
            </dd>
          </div>
          {exercise.force ? (
            <div className="max-w-full shrink-0">
              <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                <ForceIcon className="size-3.5 shrink-0" aria-hidden="true" />
                Tipo de força
              </dt>
              <dd className="mt-0.5 break-words pl-5 text-foreground">
                {formatForceLabel(exercise.force)}
              </dd>
            </div>
          ) : null}
          {exercise.mechanic ? (
            <div className="max-w-full shrink-0">
              <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                <MechanicIcon className="size-3.5 shrink-0" aria-hidden="true" />
                Mecânica
              </dt>
              <dd className="mt-0.5 break-words pl-5 text-foreground">
                {formatLabel(exercise.mechanic)}
              </dd>
            </div>
          ) : null}
        </dl>
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
        {leadingActions}
        <Button
          type="button"
          variant="ghost"
          className="gap-1 max-[640px]:col-span-1 max-[640px]:w-full sm:gap-2"
          onClick={onToggleInstructions}
          aria-expanded={instructionsOpen}
          aria-controls={`exercise-instructions-${exercise.id}`}
          aria-label={`Instruções: ${exercise.name}`}
        >
          Instruções
          <ChevronDownIcon
            className={`size-3 transition-transform ${instructionsOpen ? 'rotate-180' : ''}`}
          />
        </Button>
        {trailingActions}
      </div>
      <div
        id={`exercise-instructions-${exercise.id}`}
        hidden={!instructionsOpen}
        className="mt-3 rounded-[var(--radius)] bg-secondary p-3 text-sm leading-[1.6] text-muted-foreground"
      >
        {exercise.instructions.map((instruction) => (
          <p key={instruction} className="mb-1.5">
            • {instruction}
          </p>
        ))}
      </div>
    </div>
  </article>
);

export { ExerciseCard };
