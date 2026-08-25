import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SearchIcon } from './WorkoutIcons';
import { Input } from './Input';

const ControlledInput = (): React.JSX.Element => {
  const [value, setValue] = useState('texto');
  return (
    <Input
      type="search"
      aria-label="Buscar"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onClear={() => setValue('')}
      clearLabel="Limpar campo"
    />
  );
};

describe('Input', () => {
  /**
   * Input receives an optional label and leading icon.
   * Mock: renders the component with an explicit id and SearchIcon.
   * Assert: the label is associated with the input and the icon is rendered.
   */
  test('renders an optional label and leading icon', () => {
    render(
      <Input
        id="exercise-search"
        label="Exercício"
        leadingIcon={<SearchIcon data-testid="search-icon" aria-hidden="true" />}
      />,
    );

    expect(screen.getByLabelText('Exercício')).toHaveAttribute('id', 'exercise-search');
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  /**
   * Input does not receive a label.
   * Mock: renders the component with only native input props.
   * Assert: no label element is rendered.
   */
  test('does not render a label when none is provided', () => {
    render(<Input aria-label="Campo" />);

    expect(screen.queryByText('Campo')).not.toBeInTheDocument();
  });

  /**
   * Controlled input contains text and exposes a clear callback.
   * Mock: clear callback updates the controlled value to an empty string.
   * Assert: the clear button is accessible and clears the input on click.
   */
  test('renders and handles the clear button', async () => {
    const user = userEvent.setup();
    render(<ControlledInput />);

    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    expect(screen.getByRole('button', { name: 'Limpar campo' })).toHaveClass('size-8');
    expect(input).toHaveAttribute('data-custom-clear', 'true');

    await user.click(screen.getByRole('button', { name: 'Limpar campo' }));

    expect(input).toHaveValue('');
  });

  /**
   * Input has no value to clear.
   * Mock: renders a controlled empty input with an onClear callback.
   * Assert: the clear button is not rendered.
   */
  test('hides the clear button when the input is empty', () => {
    render(<Input type="search" value="" onChange={() => undefined} onClear={() => undefined} />);

    expect(screen.queryByRole('button', { name: 'Limpar campo' })).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveAttribute('data-custom-clear', 'true');
  });

  /**
   * User presses Escape in a populated clearable input.
   * Mock: controlled input uses the same clear callback as the button.
   * Assert: Escape clears the value and hides the clear button.
   */
  test('clears the value when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<ControlledInput />);

    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpar campo' })).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  /**
   * User presses Escape in an empty clearable input.
   * Mock: clear callback is tracked while the input has no value.
   * Assert: the callback is not invoked.
   */
  test('does not clear an empty input when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    render(
      <Input
        type="search"
        value=""
        onChange={() => undefined}
        onClear={onClear}
        aria-label="Buscar"
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(onClear).not.toHaveBeenCalled();
  });

  /**
   * Parent provides a keydown handler to a clearable input.
   * Mock: parent handler records the Escape event.
   * Assert: the parent handler runs before the internal clear behavior.
   */
  test('preserves the parent keydown handler', async () => {
    const user = userEvent.setup();
    const onKeyDown = jest.fn();
    render(
      <Input
        type="search"
        value="texto"
        onChange={() => undefined}
        onClear={() => undefined}
        onKeyDown={onKeyDown}
        aria-label="Buscar"
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
  });

  /**
   * Parent prevents the Escape event in a clearable input.
   * Mock: parent keydown handler calls preventDefault before the internal handler continues.
   * Assert: the clear callback is not invoked.
   */
  test('does not clear when the parent prevents Escape', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    const onKeyDown = jest.fn((event: React.KeyboardEvent<HTMLInputElement>): void => {
      event.preventDefault();
    });
    render(
      <Input
        type="search"
        value="texto"
        onChange={() => undefined}
        onClear={onClear}
        onKeyDown={onKeyDown}
        aria-label="Buscar"
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(onClear).not.toHaveBeenCalled();
  });
});
