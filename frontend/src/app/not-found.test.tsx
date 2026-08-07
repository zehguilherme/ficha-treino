import { render, screen } from '@testing-library/react';
import NotFoundPage from './not-found';

describe('NotFoundPage', () => {
  /**
   * Renders the 404 card with title, message and home link.
   * Mock: none — static page.
   * Assert: "404" heading, friendly message and link to home present.
   */
  test('renders the 404 card with home link', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Esse exercício não existe na sua ficha')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para Home' })).toHaveAttribute('href', '/');
  });
});
