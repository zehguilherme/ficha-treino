import type { ReactNode } from 'react';

export interface ExerciseTagProps {
  label: string;
  value: string | null;
}

const ExerciseTag = ({ label, value }: ExerciseTagProps): ReactNode => {
  if (!value) return null;

  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground">
      <span className="uppercase opacity-70">{label}</span>:{' '}
      <span className="uppercase">{value}</span>
    </span>
  );
};

export { ExerciseTag };
