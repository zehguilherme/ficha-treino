import * as React from 'react';
import { ExerciseImageCarousel } from '@/components/exercise/ExerciseImageCarousel';
import { Button } from '@/components/ui/Button';
import { MuscleIcon, ChevronDownIcon } from '@/components/ui/WorkoutIcons';
import { formatLabel } from '@/lib/utils';
import type { ExerciseDetails } from '@/schemas/api';

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
        {leadingActions}
        <Button
          variant="ghost"
          className="gap-1 max-[640px]:col-span-1 max-[640px]:w-full sm:gap-2"
          onClick={onToggleInstructions}
          aria-expanded={instructionsOpen}
          aria-label={`Instruções: ${exercise.name}`}
        >
          Instruções
          <ChevronDownIcon
            className={`size-3 transition-transform ${instructionsOpen ? 'rotate-180' : ''}`}
          />
        </Button>
        {trailingActions}
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

export { ExerciseCard };
