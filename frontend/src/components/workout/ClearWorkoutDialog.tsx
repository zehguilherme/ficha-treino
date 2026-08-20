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
import { AlertTriangleIcon, XIcon } from '@/components/ui/WorkoutIcons';

interface ClearWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName: string;
  isPending: boolean;
  onConfirm: () => void;
}

const ClearWorkoutDialog = ({
  open,
  onOpenChange,
  dayName,
  isPending,
  onConfirm,
}: ClearWorkoutDialogProps): React.JSX.Element => (
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
          <AlertTriangleIcon className="size-5" aria-hidden="true" />
        </div>
        <AlertDialogTitle>Limpar treino?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação irá desmarcar todos os exercícios de {dayName}. Você pode marcá-los novamente
          depois.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={isPending}
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {isPending ? 'Limpando...' : 'Sim, limpar'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export { ClearWorkoutDialog };
