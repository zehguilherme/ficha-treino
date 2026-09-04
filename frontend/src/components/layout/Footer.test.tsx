import { render, screen } from '@testing-library/react';

import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Happy path: the footer exposes the requested social and contact links.
   * Assert: each link has the right accessible name, destination, and external-link behavior.
   */
  test('renders accessible links for the portfolio, GitHub, LinkedIn, and email', () => {
    render(<Footer />);

    const portfolioLink = screen.getByRole('link', { name: 'Portfólio' });
    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });
    const emailLink = screen.getByRole('link', { name: 'E-mail' });

    expect(portfolioLink).toHaveAttribute('href', 'https://joseguilherme.vercel.app/');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/zehguilherme');
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/jos%C3%A9-guilherme-paro-monteiro-tomaine/',
    );
    expect(emailLink).toHaveAttribute('href', 'mailto:jgtomaine@hotmail.com');

    expect(portfolioLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(portfolioLink).toHaveAttribute('rel', 'noreferrer');
    expect(githubLink).toHaveAttribute('rel', 'noreferrer');
    expect(linkedinLink).toHaveAttribute('rel', 'noreferrer');
  });

  /**
   * Happy path: the footer presents its copyright notice in Portuguese.
   * Assert: the requested year and translated wording are visible.
   */
  test('renders the Portuguese copyright notice', () => {
    jest.useFakeTimers().setSystemTime(new Date('2030-01-01T12:00:00'));
    render(<Footer />);

    expect(screen.getByText('Ficha de Treino — Seu treino organizado')).toBeInTheDocument();
    expect(screen.getByText('Todos os direitos reservados © 2030')).toBeInTheDocument();
  });
});
