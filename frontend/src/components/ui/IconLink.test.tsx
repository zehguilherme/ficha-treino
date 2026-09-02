import { render, screen } from '@testing-library/react';
import { ArrowLeftIcon } from './WorkoutIcons';
import { IconLink } from './IconLink';

describe('IconLink', () => {
  /**
   * An icon-only navigation link exposes its action through an accessible label.
   * Mock: renders IconLink with a dashboard destination and the existing arrow icon.
   * Assert: the link exposes its destination and accessible name, and renders the icon without visible text.
   */
  test('renders an accessible link with an icon and label', () => {
    render(
      <IconLink
        href="/dashboard"
        icon={<ArrowLeftIcon aria-hidden="true" />}
        aria-label="Voltar"
      />,
    );

    const link = screen.getByRole('link', { name: 'Voltar' });

    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).not.toHaveTextContent('Voltar');
    expect(link.querySelector('svg')).toBeInTheDocument();
  });
});
