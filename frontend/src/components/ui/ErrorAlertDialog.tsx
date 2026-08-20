import * as React from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { AlertTriangleIcon, XIcon } from '@/components/ui/WorkoutIcons';

interface ErrorAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

const ErrorAlertDialog = ({
  open,
  onOpenChange,
  message,
}: ErrorAlertDialogProps): React.JSX.Element => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogCancel
        className="absolute right-3 top-3 size-8 border-0 p-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Fechar"
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
        <AlertDialogTitle>Algo deu errado</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="w-full sm:w-auto">Fechar</AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export { ErrorAlertDialog };
