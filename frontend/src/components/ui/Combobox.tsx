import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { cn } from '@/lib/utils';
import { SearchIcon, XIcon } from './WorkoutIcons';

export interface ComboboxHandle {
  clear: () => void;
  blur: () => void;
  focus: () => void;
}

export interface ComboboxProps<Item> {
  'aria-label': string;
  loadOptions: (query: string, signal: AbortSignal) => Promise<ReadonlyArray<Item>>;
  onSubmit: (query: string) => void;
  onQueryChange?: (query: string) => void;
  itemToStringLabel: (item: Item) => string;
  placeholder?: string;
  leadingIcon?: React.ReactNode;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
}

const ComboboxComponent = <Item,>(
  {
    'aria-label': ariaLabel,
    loadOptions,
    onSubmit,
    onQueryChange,
    itemToStringLabel,
    placeholder = 'Buscar…',
    leadingIcon = <SearchIcon className="size-4" aria-hidden="true" />,
    loadingMessage = 'Buscando…',
    emptyMessage = 'Nenhum resultado encontrado.',
    errorMessage = 'Não foi possível carregar as sugestões.',
  }: ComboboxProps<Item>,
  ref: React.ForwardedRef<ComboboxHandle>,
): React.JSX.Element => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const requestIdRef = React.useRef(0);
  const requestControllerRef = React.useRef<AbortController | null>(null);
  const highlightedItemRef = React.useRef<Item | undefined>(undefined);
  const [inputValue, setInputValue] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
  const [items, setItems] = React.useState<ReadonlyArray<Item>>([]);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const clear = React.useCallback((): void => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setInputValue('');
    setSelectedItem(null);
    setItems([]);
    setIsLoading(false);
    setHasError(false);
    setOpen(false);
    onQueryChange?.('');
  }, [onQueryChange]);

  React.useImperativeHandle(
    ref,
    () => ({ clear, blur: () => inputRef.current?.blur(), focus: () => inputRef.current?.focus() }),
    [clear],
  );

  React.useEffect(() => {
    const query = inputValue.trim();
    if (!query) {
      requestControllerRef.current?.abort();
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    const timeout = window.setTimeout(() => {
      void loadOptions(query, controller.signal)
        .then((nextItems) => {
          if (requestIdRef.current !== requestId || controller.signal.aborted) return;
          setItems(nextItems);
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          if (requestIdRef.current !== requestId || controller.signal.aborted) return;
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setItems([]);
          setIsLoading(false);
          setHasError(true);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [inputValue, loadOptions]);

  const handleInputValueChange = (value: string, eventDetails: { reason: string }): void => {
    if (eventDetails.reason === 'item-press') return;
    if (eventDetails.reason === 'none' && selectedItem) return;
    setSelectedItem(null);
    setInputValue(value);
    onQueryChange?.(value);
    setOpen(value.trim().length > 0);
    setIsLoading(value.trim().length > 0);
    setHasError(false);
    setItems([]);
  };

  const handleSelect = (item: Item | null): void => {
    if (!item) return;
    const label = itemToStringLabel(item);
    setSelectedItem(item);
    setInputValue(label);
    onQueryChange?.(label);
    setOpen(false);
    onSubmit(label);
  };

  const popupOpen = open && !isLoading && inputValue.trim().length > 0;

  return (
    <ComboboxPrimitive.Root<Item>
      modal={false}
      open={popupOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen && inputValue.trim().length === 0) return;
        if (!nextOpen && isLoading) return;
        setOpen(nextOpen);
      }}
      value={selectedItem}
      onValueChange={handleSelect}
      onItemHighlighted={(item) => {
        highlightedItemRef.current = item;
      }}
      inputValue={inputValue}
      onInputValueChange={handleInputValueChange}
      items={items}
      itemToStringLabel={itemToStringLabel}
    >
      <div className="relative">
        <ComboboxPrimitive.Input
          ref={inputRef}
          aria-label={ariaLabel}
          aria-keyshortcuts="Enter"
          placeholder={placeholder}
          onKeyDownCapture={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }
            if (event.key === 'Enter' && inputValue.trim()) {
              if (highlightedItemRef.current) return;
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              onSubmit(inputValue.trim());
            }
          }}
          className={cn(
            'flex h-10 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2.5 pr-10 font-sans text-sm text-muted-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/10',
            leadingIcon && 'pl-9',
          )}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground">
          {leadingIcon}
        </span>
        <ComboboxPrimitive.Clear
          aria-label="Limpar busca"
          keepMounted
          className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-[var(--radius)] text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[visible=false]:hidden"
        >
          <XIcon className="size-4" aria-hidden="true" />
        </ComboboxPrimitive.Clear>
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {isLoading ? loadingMessage : ''}
      </div>
      {popupOpen ? (
        <ComboboxPrimitive.Portal>
          <ComboboxPrimitive.Positioner
            anchor={inputRef}
            align="start"
            side="bottom"
            sideOffset={4}
            data-slot="combobox-positioner"
            className="isolate z-50"
          >
            <ComboboxPrimitive.Popup className="z-50 mt-1 max-h-80 w-[var(--anchor-width)] overflow-auto rounded-[var(--radius)] border border-border bg-card p-1 shadow-lg">
              {isLoading ? (
                <ComboboxPrimitive.Empty className="px-3 py-2 font-sans text-sm text-muted-foreground">
                  {loadingMessage}
                </ComboboxPrimitive.Empty>
              ) : null}
              {!isLoading && hasError ? (
                <ComboboxPrimitive.Empty className="px-3 py-2 font-sans text-sm text-muted-foreground">
                  {errorMessage}
                </ComboboxPrimitive.Empty>
              ) : null}
              {!isLoading && !hasError && items.length === 0 ? (
                <ComboboxPrimitive.Empty className="px-3 py-2 font-sans text-sm text-muted-foreground">
                  {emptyMessage}
                </ComboboxPrimitive.Empty>
              ) : null}
              <ComboboxPrimitive.List>
                {(item: Item) => (
                  <ComboboxPrimitive.Item
                    key={itemToStringLabel(item)}
                    value={item}
                    className="cursor-default rounded-sm px-3 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-secondary"
                  >
                    {itemToStringLabel(item)}
                  </ComboboxPrimitive.Item>
                )}
              </ComboboxPrimitive.List>
            </ComboboxPrimitive.Popup>
          </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
      ) : null}
    </ComboboxPrimitive.Root>
  );
};

const Combobox = React.forwardRef(ComboboxComponent) as <Item>(
  props: ComboboxProps<Item> & { ref?: React.ForwardedRef<ComboboxHandle> },
) => React.JSX.Element;

export { Combobox };
