import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  /**
   * A page loading state displays its message below the spinner.
   * Mock: renders Loading with a Portuguese support message.
   * Assert: the live container, accessible spinner and message are present.
   */
  test('renders an accessible spinner with the support message below it', () => {
    render(<Loading message="Carregando treinos..." />);

    const message = screen.getByText('Carregando treinos...');
    const container = message.parentElement;
    const spinner = screen.getByRole('status', { name: 'Carregando treinos...' });

    expect(container).not.toBeNull();
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveClass('size-6');
    expect(message).toBeInTheDocument();
    expect(container).toContainElement(spinner);
  });
});
