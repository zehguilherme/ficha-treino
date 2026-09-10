import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox, type ComboboxHandle } from './Combobox';

type Option = { id: string; name: string };

describe('Combobox', () => {
  test('does not show the empty state before a query is entered', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([]);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Buscar exercícios' }));

    expect(screen.queryByText('Nenhum resultado encontrado.')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    expect(loadOptions).not.toHaveBeenCalled();
  });

  test('uses project typography and muted color for the empty state', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([]);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Buscar exercícios' }), 'a');
    const emptyState = await screen.findByText('Nenhum resultado encontrado.');

    expect(emptyState).toHaveClass('font-sans', 'text-sm', 'text-muted-foreground');
  });

  /**
   * Responsive popup: suggestions use the space available in the viewport.
   * Assert: the popup caps its height with Base UI's available-height variable.
   */
  test('caps suggestions by the available viewport height', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([{ id: '1', name: 'Supino reto' }]);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Buscar exercícios' }), 'supino');
    await screen.findByRole('option', { name: 'Supino reto' });

    expect(screen.getByRole('listbox').parentElement).toHaveClass(
      'max-h-[min(20rem,var(--available-height))]',
    );
  });

  /**
   * Load failure: the suggestion request rejects after the debounce period.
   * Assert: the accessible error message replaces the loading state.
   */
  test('shows an error when suggestions fail to load', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockRejectedValue(new Error('network failure'));

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Buscar exercícios' }), 'supino');

    expect(await screen.findByText('Não foi possível carregar as sugestões.')).toBeInTheDocument();
  });

  /**
   * Clear action: an open suggestion list is cleared through the icon button.
   * Assert: the query is empty and the popup closes.
   */
  test('clears the query and closes suggestions', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([{ id: '1', name: 'Supino reto' }]);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Buscar exercícios' });
    await user.type(input, 'supino');
    await screen.findByRole('option', { name: 'Supino reto' });
    await user.click(screen.getByLabelText('Limpar busca', { selector: 'button' }));

    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * Escape action: an open suggestion list receives the Escape key.
   * Assert: the popup closes without changing the query.
   */
  test('closes suggestions with Escape', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([{ id: '1', name: 'Supino reto' }]);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Buscar exercícios' });
    await user.type(input, 'supino');
    await screen.findByRole('option', { name: 'Supino reto' });
    await user.keyboard('{Escape}');

    expect(input).toHaveValue('supino');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * Duplicate labels: distinct options share the same visible exercise name.
   * Assert: both options render without React's duplicate-key warning.
   */
  test('renders duplicate labels without duplicate-key warnings', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([
        { id: 'esteira-1', name: 'Corrida na Esteira' },
        { id: 'esteira-2', name: 'Corrida na Esteira' },
      ]);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Buscar exercícios' }), 'estei');
    expect(await screen.findAllByRole('option', { name: 'Corrida na Esteira' })).toHaveLength(2);

    const duplicateKeyWarning = consoleError.mock.calls.some((args) =>
      args.some((argument) => String(argument).includes('same key')),
    );
    expect(duplicateKeyWarning).toBe(false);
    consoleError.mockRestore();
  });

  /**
   * Stable identity: duplicate labels provide distinct item IDs.
   * Assert: the explicit itemToKey callback is accepted for option identity.
   */
  test('accepts a stable key extractor for duplicate labels', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([
        { id: 'esteira-1', name: 'Corrida na Esteira' },
        { id: 'esteira-2', name: 'Corrida na Esteira' },
      ]);

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={jest.fn()}
        itemToStringLabel={(item) => item.name}
        itemToKey={(item) => item.id}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Buscar exercícios' }), 'estei');
    expect(await screen.findAllByRole('option', { name: 'Corrida na Esteira' })).toHaveLength(2);
  });

  test('debounces async suggestions and submits the complete selected label', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([
        { id: '1', name: 'Supino reto' },
        { id: '2', name: 'Supino inclinado' },
      ]);
    const onSubmit = jest.fn();

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={onSubmit}
        itemToStringLabel={(item) => item.name}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Buscar exercícios' });
    await user.type(input, 'supino');
    await waitFor(() =>
      expect(loadOptions).toHaveBeenCalledWith('supino', expect.any(AbortSignal)),
    );
    await user.click(await screen.findByRole('option', { name: 'Supino reto' }));

    expect(input).toHaveValue('Supino reto');
    expect(onSubmit).toHaveBeenCalledWith('Supino reto');
  });

  test('selects the highlighted result before submitting with Enter', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockResolvedValue([{ id: '1', name: 'Supino reto' }]);
    const onSubmit = jest.fn();

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={onSubmit}
        itemToStringLabel={(item) => item.name}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Buscar exercícios' });
    await user.type(input, 'supino');
    await screen.findByRole('option', { name: 'Supino reto' });
    await user.keyboard('{ArrowDown}{Enter}');

    expect(input).toHaveValue('Supino reto');
    expect(onSubmit).toHaveBeenCalledWith('Supino reto');
  });

  test('allows a new manual Enter submission after selecting a result', async () => {
    const user = userEvent.setup();
    const loadOptions = jest
      .fn<Promise<ReadonlyArray<Option>>, [string, AbortSignal]>()
      .mockImplementation(async (query) => [{ id: query, name: query }]);
    const onSubmit = jest.fn();

    render(
      <Combobox
        aria-label="Buscar exercícios"
        loadOptions={loadOptions}
        onSubmit={onSubmit}
        itemToStringLabel={(item) => item.name}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Buscar exercícios' });
    await user.type(input, 'supino');
    await screen.findByRole('option', { name: 'supino' });
    await user.keyboard('{ArrowDown}{Enter}');
    await user.clear(input);
    await user.type(input, 'barra');
    await screen.findByRole('option', { name: 'barra' });
    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenNthCalledWith(2, 'barra');
  });

  test('clears through the imperative handle without submitting', async () => {
    const user = userEvent.setup();
    const handle = { current: null as ComboboxHandle | null };

    render(
      <Combobox
        ref={(value) => {
          handle.current = value;
        }}
        aria-label="Buscar exercícios"
        loadOptions={async () => []}
        onSubmit={jest.fn()}
        itemToStringLabel={(item: Option) => item.name}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Buscar exercícios' });
    await user.type(input, 'a');
    await act(async () => {
      handle.current?.clear();
    });

    expect(input).toHaveValue('');
  });
});
