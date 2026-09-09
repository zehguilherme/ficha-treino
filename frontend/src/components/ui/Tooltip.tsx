'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  sideOffset = 4,
  collisionPadding = 16,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>): React.JSX.Element => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        'z-[100] max-h-[calc(100dvh-2rem)] max-w-xs overflow-y-auto rounded-[var(--radius)] border border-border bg-secondary px-3 py-2',
        'text-xs leading-relaxed text-secondary-foreground shadow-md outline-none',
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      {...props}
    />
  </TooltipPrimitive.Portal>
);
