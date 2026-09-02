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
import { AlertTriangleIcon, TrashIcon, XIcon } from '@/components/ui/WorkoutIcons';

interface AccountDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

const AccountDeleteDialog = ({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: AccountDeleteDialogProps): React.JSX.Element => (
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
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-5" aria-hidden="true" />
        </div>
        <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação é irreversível. Todos os seus treinos, histórico e progresso serão
          permanentemente removidos e não há como recuperá-los depois.
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
          <TrashIcon className="size-4" aria-hidden="true" />
          {isPending ? 'Excluindo…' : 'Sim, excluir'}
        </AlertDialogAction>
        <AlertDialogCancel className="w-full sm:w-auto" disabled={isPending}>
          Cancelar
        </AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export { AccountDeleteDialog };
