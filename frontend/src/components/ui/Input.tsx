import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { XIcon } from './WorkoutIcons';

export interface InputProps extends React.ComponentProps<'input'> {
  label?: React.ReactNode;
  error?: string | null;
  leadingIcon?: React.ReactNode;
  onClear?: () => void;
  clearLabel?: string;
}

const Input = ({
  className,
  type,
  id,
  label,
  error,
  leadingIcon,
  onClear,
  clearLabel = 'Limpar campo',
  value,
  onKeyDown,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputProps): React.JSX.Element => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasValue = value !== undefined && value !== '';
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !onClear || !hasValue) return;

    event.preventDefault();
    onClear();
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon}
        <input
          id={inputId}
          type={type}
          value={value}
          onKeyDown={handleKeyDown}
          aria-invalid={error ? true : (ariaInvalid ?? false)}
          aria-describedby={
            error ? [ariaDescribedBy, errorId].filter(Boolean).join(' ') : ariaDescribedBy
          }
          data-custom-clear={type === 'search' && onClear ? 'true' : undefined}
          data-slot="input"
          className={cn(
            'flex h-10 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2.5 font-sans text-sm font-normal tracking-normal text-muted-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50',
            leadingIcon && 'pl-9',
            onClear && 'pr-10',
            error &&
              'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            className,
          )}
          {...props}
        />
        {onClear && hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label={clearLabel}
            className="absolute right-2 top-1/2 -translate-y-1/2 border-0"
          >
            <XIcon className="size-4" />
          </Button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export { Input };
