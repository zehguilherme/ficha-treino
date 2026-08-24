import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { TrashIcon, XIcon } from '@/components/ui/WorkoutIcons';

interface RemoveWorkoutExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  isPending: boolean;
  onConfirm: () => void;
}

const RemoveWorkoutExerciseDialog = ({
  open,
  onOpenChange,
  exerciseName,
  isPending,
  onConfirm,
}: RemoveWorkoutExerciseDialogProps): React.JSX.Element => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogCancel
        className="absolute right-3 top-3 size-8 border-0 p-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Fechar"
        disabled={isPending}
      >
        <XIcon className="size-4" />
      </AlertDialogCancel>
      <AlertDialogHeader>
        <div
          data-slot="alert-dialog-icon"
          className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        >
          <TrashIcon className="size-5" aria-hidden="true" />
        </div>
        <AlertDialogTitle>Remover exercício?</AlertDialogTitle>
        <AlertDialogDescription>
          O exercício <span className="font-medium text-foreground">{exerciseName}</span> será
          removido deste treino.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction
          className="w-full border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
          loading={isPending}
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {isPending ? 'Removendo…' : 'Sim, remover'}
        </AlertDialogAction>
        <AlertDialogCancel className="w-full sm:w-auto" disabled={isPending}>
          Cancelar
        </AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export { RemoveWorkoutExerciseDialog };
