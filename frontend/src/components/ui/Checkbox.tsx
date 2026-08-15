import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

const Checkbox = ({ className, ...props }: CheckboxProps): React.JSX.Element => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      'peer size-4 shrink-0 rounded-[calc(var(--radius)-0.125rem)] border border-input bg-card shadow-xs outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <span aria-hidden="true" className="text-xs leading-none">
        ✓
      </span>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export { Checkbox };
