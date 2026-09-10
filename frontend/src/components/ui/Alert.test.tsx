import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from './Alert';

describe('Alert', () => {
  test('renders an accessible alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Instalação disponível</AlertTitle>
        <AlertDescription>Instale o aplicativo.</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Instalação disponível')).toBeInTheDocument();
    expect(screen.getByText('Instale o aplicativo.')).toBeInTheDocument();
  });

  test('supports the destructive variant', () => {
    render(<Alert variant="destructive">Erro</Alert>);

    expect(screen.getByRole('alert')).toHaveClass('border-destructive/50');
  });
});
