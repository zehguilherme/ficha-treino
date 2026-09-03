'use client';

import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import { getInitials } from '@/lib/dashboard';

interface UserInitialsButtonProps extends ButtonProps {
  name: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export const UserInitialsButton = ({
  name,
  className,
  ref,
  ...props
}: UserInitialsButtonProps): React.JSX.Element => (
  <Button
    type="button"
    variant="outline"
    size="icon"
    className={`rounded-full bg-muted text-xs font-semibold${className ? ` ${className}` : ''}`}
    aria-label="Abrir menu do usuário"
    ref={ref}
    {...props}
  >
    {getInitials(name)}
  </Button>
);
