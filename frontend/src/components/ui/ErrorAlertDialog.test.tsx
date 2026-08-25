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

  /**
   * User presses Escape while an error alert is open.
   * Mock: the alert is controlled by a local open state.
   * Assert: Escape dismisses the alert.
   */
  test('closes and restores focus after Escape', async () => {
    const user = userEvent.setup();

    render(<ErrorAlertDialogHarness />);
    const closeButton = screen.getAllByRole('button', { name: 'Fechar' })[0];

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(closeButton).not.toHaveFocus();
  });

  /**
   * User clicks the page outside an error alert.
   * Mock: the alert is open with a recoverable error message.
   * Assert: clicking outside does not dismiss the alert.
   */
  test('remains open after clicking outside', async () => {
    const user = userEvent.setup();

    render(<ErrorAlertDialogHarness />);
    const alertDialog = screen.getByRole('alertdialog');
    const overlay = alertDialog.parentElement?.querySelector('[data-state="open"]:not([role])');
    if (!overlay) throw new Error('Alert dialog overlay was not rendered');
    await user.click(overlay);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
