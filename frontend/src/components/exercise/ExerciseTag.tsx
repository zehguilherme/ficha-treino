import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ExerciseTagProps {
  label: string;
  value: string | null;
  className?: string;
  labelClassName?: string;
}

const ExerciseTag = ({ label, value, className, labelClassName }: ExerciseTagProps): ReactNode => {
  if (!value) return null;

  return (
    <span
      className={cn(
        'rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground',
        className,
      )}
    >
      <span className={cn('uppercase opacity-70', labelClassName)}>{label}</span>:{' '}
      <span className="uppercase">{value}</span>
    </span>
  );
};

export { ExerciseTag };
