'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { EXERCISE_LABELS } from '@/lib/exerciseLabels';
import type { ExerciseDetails } from '@/schemas/api';

export interface CustomExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialExercise?: ExerciseDetails | null;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (value: { name: string; primaryMuscle: string }) => void;
}

const CustomExerciseDialog = ({
  open,
  onOpenChange,
  initialExercise = null,
  isPending,
  errorMessage = null,
  onSubmit,
}: CustomExerciseDialogProps): React.JSX.Element => {
  const [name, setName] = React.useState(initialExercise?.name ?? '');
  const [primaryMuscle, setPrimaryMuscle] = React.useState(
    initialExercise?.primaryMuscles[0] ?? '',
  );
  const [touched, setTouched] = React.useState({ name: false, primaryMuscle: false });
  const [muscleSelectOpen, setMuscleSelectOpen] = React.useState(false);
  const isEditing = initialExercise !== null && initialExercise !== undefined;
  const nameError =
    touched.name && name.trim().length < 2 ? 'Informe pelo menos 2 caracteres.' : null;
  const muscleError =
    touched.primaryMuscle && !primaryMuscle ? 'Selecione o músculo primário.' : null;

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (normalizedName.length < 2 || !primaryMuscle) return;
    onSubmit({ name: normalizedName, primaryMuscle });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar exercício personalizado' : 'Criar exercício personalizado'}
          </DialogTitle>
          <DialogDescription>
            Informe apenas o nome e o músculo primário para identificar este exercício.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Input
            autoFocus
            id="custom-exercise-name"
            label={
              <>
                Nome do exercício <span aria-hidden="true">*</span>
              </>
            }
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            placeholder="Ex.: Supino inclinado"
            minLength={2}
            maxLength={255}
            required
            disabled={isPending}
            error={nameError}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="custom-exercise-muscle" className="text-sm font-medium text-foreground">
              Músculo primário <span aria-hidden="true">*</span>
            </label>
            <Select
              value={primaryMuscle}
              onValueChange={setPrimaryMuscle}
              open={muscleSelectOpen}
              onOpenChange={setMuscleSelectOpen}
              disabled={isPending}
            >
              <SelectTrigger
                id="custom-exercise-muscle"
                aria-label="Músculo primário"
                error={muscleError}
                onBlur={() => {
                  if (!muscleSelectOpen) {
                    setTouched((current) => ({ ...current, primaryMuscle: true }));
                  }
                }}
              >
                <SelectValue placeholder="Selecionar músculo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXERCISE_LABELS.muscle).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errorMessage ? (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isPending}
              disabled={name.trim().length < 2 || !primaryMuscle}
            >
              {isEditing ? 'Salvar alterações' : 'Criar exercício personalizado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { CustomExerciseDialog };
