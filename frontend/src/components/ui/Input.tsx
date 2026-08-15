import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.ComponentProps<'input'>;

const Input = ({ className, type, ...props }: InputProps): React.JSX.Element => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      'flex h-10 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
);

export { Input };
