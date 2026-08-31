import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';

describe('Select', () => {
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
