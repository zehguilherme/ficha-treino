import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-[0.02em] rounded-[var(--radius)] transition-all duration-150 text-[0.8125rem] outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-foreground text-primary-foreground hover:opacity-85',
        outline: 'border border-border text-foreground hover:bg-secondary',
        ghost: 'border border-border text-muted-foreground hover:bg-secondary',
      },
      size: {
        default: 'px-3 py-1.5',
        sm: 'px-2 py-1 text-xs',
        lg: 'px-4 py-2 text-sm',
        icon: 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      asChild = false,
      disabled = false,
      loading = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    const childProps = asChild
      ? isDisabled
        ? {
            'aria-disabled': true,
            'aria-busy': loading || props['aria-busy'],
            onClick: (event: React.MouseEvent<HTMLElement>): void => {
              event.preventDefault();
              event.stopPropagation();
            },
          }
        : { onClick }
      : { 'aria-busy': loading || props['aria-busy'], disabled: isDisabled, onClick };
    const child = React.isValidElement(children)
      ? (children as React.ReactElement<{ children?: React.ReactNode }>)
      : null;
    const renderedChildren =
      asChild && loading && child ? (
        React.cloneElement(
          child,
          undefined,
          <>
            <Spinner data-icon="inline-start" />
            {child.props.children}
          </>,
        )
      ) : asChild ? (
        children
      ) : (
        <>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          {children}
        </>
      );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        {...childProps}
      >
        {renderedChildren}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
