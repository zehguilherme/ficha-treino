import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { MoreVerticalIcon, PencilIcon, TrashIcon } from '@/components/ui/WorkoutIcons';

interface CustomExerciseMenuProps {
  exerciseName: string;
  disabled: boolean;
  triggerRef: React.Ref<HTMLButtonElement>;
  onEdit: () => void;
  onRemove: () => void;
}

export const CustomExerciseMenu = ({
  exerciseName,
  disabled,
  triggerRef,
  onEdit,
  onRemove,
}: CustomExerciseMenuProps): React.JSX.Element => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Ações para ${exerciseName}`}
        disabled={disabled}
        className="ml-auto size-10 shrink-0"
      >
        <MoreVerticalIcon className="size-4" aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={onEdit}>
        <PencilIcon className="mr-2 size-3.5" aria-hidden="true" />
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onRemove}>
        <TrashIcon className="mr-2 size-3.5" aria-hidden="true" />
        Remover
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
