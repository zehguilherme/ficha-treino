import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';

describe('Select', () => {
  test('shows a received error below the trigger and clears it when removed', () => {
    const { rerender } = render(
      <Select>
        <SelectTrigger
          id="filter"
          aria-label="Filtro"
          aria-describedby="filter-hint"
          error="Selecione um filtro"
        >
          <SelectValue placeholder="Selecionar filtro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="forca">Força</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox', { name: 'Filtro' });
    const error = screen.getByText('Selecione um filtro');
    expect(trigger.compareDocumentPosition(error)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-describedby', 'filter-hint filter-error');
    expect(error).toHaveAttribute('id', 'filter-error');

    rerender(
      <Select>
        <SelectTrigger id="filter" aria-label="Filtro" aria-describedby="filter-hint" error={null}>
          <SelectValue placeholder="Selecionar filtro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="forca">Força</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.queryByText('Selecione um filtro')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-invalid', 'false');
    expect(trigger).toHaveAttribute('aria-describedby', 'filter-hint');
  });

  test('styles the placeholder differently from a selected value', async () => {
    const user = userEvent.setup();

    render(
      <Select>
        <SelectTrigger aria-label="Filtro">
          <SelectValue placeholder="Selecionar filtro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="forca">Força</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox', { name: 'Filtro' });
    expect(trigger).toHaveClass(
      'font-sans',
      'text-sm',
      'font-normal',
      'tracking-normal',
      'text-muted-foreground',
    );
    expect(trigger).toHaveClass('[&>span]:text-foreground');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Força' }));

    expect(trigger).not.toHaveAttribute('data-placeholder');
    const selectedValue = trigger.firstElementChild;
    if (!selectedValue) throw new Error('Select value was not rendered');
    expect(trigger).toHaveClass('[&>span]:text-foreground');
  });

  test('renders the opened menu with an opaque themed background and readable text', async () => {
    const user = userEvent.setup();

    render(
      <Select>
        <SelectTrigger aria-label="Filtro">
          <SelectValue placeholder="Selecionar filtro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="forca">Força</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole('combobox', { name: 'Filtro' }));

    expect(screen.getByRole('listbox')).toHaveClass('bg-card', 'text-card-foreground');
    expect(screen.getByRole('option', { name: 'Força' })).toBeVisible();
  });
});
