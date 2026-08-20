import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';

const ErrorAlertDialogHarness = (): React.JSX.Element => {
  const [open, setOpen] = useState(true);

  return (
    <ErrorAlertDialog
      open={open}
      onOpenChange={setOpen}
      message="Não foi possível carregar o treino."
    />
  );
};

describe('ErrorAlertDialog', () => {
  test('renders the error content and closes from either close action', async () => {
    const user = userEvent.setup();

    render(<ErrorAlertDialogHarness />);

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Algo deu errado');
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Não foi possível carregar o treino.',
    );
    expect(screen.getAllByRole('button', { name: 'Fechar' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Fechar' })[1]).toHaveClass('w-full', 'sm:w-auto');
    expect(
      screen.getByRole('alertdialog').querySelector('[data-slot="alert-dialog-icon"]'),
    ).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Fechar' })[1]);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    render(<ErrorAlertDialogHarness />);
    await user.click(screen.getAllByRole('button', { name: 'Fechar' })[0]);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
