import { cn } from '@/lib/utils';

type SpinnerProps = React.ComponentProps<'svg'>;

export const Spinner = ({ className, ...props }: SpinnerProps) => (
  <svg
    role="status"
    aria-label="Carregando"
    viewBox="0 0 24 24"
    fill="none"
    className={cn('size-4 animate-spin', className)}
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
