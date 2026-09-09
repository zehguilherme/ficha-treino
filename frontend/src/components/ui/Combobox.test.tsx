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
