import * as React from 'react';
import { ExerciseTag } from '@/components/exercise/ExerciseTag';
import { ExerciseImageCarousel } from '@/components/exercise/ExerciseImageCarousel';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  ChevronDownIcon,
  ForceIcon,
  InfoIcon,
  LevelIcon,
  MechanicIcon,
  MuscleIcon,
} from '@/components/ui/WorkoutIcons';
import { getExerciseLabel } from '@/lib/exerciseLabels';
import type { ExerciseDetails } from '@/schemas/api';

export interface ExerciseCardProps {
  exercise: ExerciseDetails;
  aboveTheFold?: boolean;
  instructionsOpen: boolean;
  onToggleInstructions: () => void;
  leadingActions?: React.ReactNode;
  trailingActions?: React.ReactNode;
}

export const ExerciseLevelTooltip = (): React.JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const pointerInteractionRef = React.useRef(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-4 rounded-full p-0 text-muted-foreground hover:text-foreground"
          aria-label="Sobre os níveis de exercício"
          aria-expanded={open}
          onPointerDown={(event) => {
            pointerInteractionRef.current = true;
            event.preventDefault();
            setOpen((current) => !current);
          }}
          onClick={(event) => {
            event.preventDefault();
            if (!pointerInteractionRef.current) {
              setOpen((current) => !current);
            }
            pointerInteractionRef.current = false;
          }}
        >
          <InfoIcon className="size-3.5" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="w-72 max-w-[calc(100vw-2rem)] text-left">
        <p>
          O nível é uma classificação relativa do catálogo: ele compara a complexidade de execução
          entre exercícios. O catálogo não define pontuação, carga, número de repetições, tempo de
          treino ou um limite técnico exato entre os níveis.
        </p>
        <p className="mt-2">
          <strong>Iniciante:</strong> execução geralmente mais simples, com menor exigência de
          coordenação, controle e estabilidade.
        </p>
        <p className="mt-2">
          <strong>Intermediário:</strong> requer técnica consistente, maior controle e familiaridade
          com o movimento.
        </p>
        <p className="mt-2">
          <strong>Avançado:</strong> exige domínio técnico, coordenação e estabilidade elevadas.
        </p>
        <p className="mt-2">
          Use o nível para comparar a complexidade do movimento, não para definir sua experiência ou
          condicionamento individual. Em caso de dúvida sobre a execução adequada para você, procure
          orientação profissional.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

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
            { label: 'Categoria', value: exercise.category, group: 'category' as const },
            { label: 'Equipamento', value: exercise.equipment, group: 'equipment' as const },
          ].map(({ label, value, group }) => (
            <ExerciseTag
              key={label}
              label={label}
              value={value ? getExerciseLabel(group, value) : null}
            />
          ))}
        </div>
        <dl className="mb-3 flex flex-wrap gap-2 border-y border-border py-3 text-xs sm:gap-6">
          <div className="max-w-full shrink-0">
            <dt className="relative flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              <LevelIcon className="size-3.5 shrink-0" aria-hidden="true" />
              Nível
              <ExerciseLevelTooltip />
            </dt>
            <dd className="mt-0.5 break-words pl-5 text-foreground">
              {getExerciseLabel('level', exercise.level)}
            </dd>
          </div>
          {exercise.force ? (
            <div className="max-w-full shrink-0">
              <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                <ForceIcon className="size-3.5 shrink-0" aria-hidden="true" />
                Tipo de força
              </dt>
              <dd className="mt-0.5 break-words pl-5 text-foreground">
                {getExerciseLabel('force', exercise.force)}
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
                {getExerciseLabel('mechanic', exercise.mechanic)}
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
              {exercise.primaryMuscles
                .map((muscle) => getExerciseLabel('muscle', muscle))
                .join(', ')}
            </span>
          </div>
          {exercise.secondaryMuscles.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em]">
                <MuscleIcon className="size-3" aria-hidden="true" />
                Músculo secundário
              </span>
              <span className="pl-4 text-xs text-foreground">
                {exercise.secondaryMuscles
                  .map((muscle) => getExerciseLabel('muscle', muscle))
                  .join(', ')}
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
