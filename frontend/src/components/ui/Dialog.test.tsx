import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle } from './Dialog';

describe('Dialog', () => {
  /**
   * A dialog exposes its standard close control.
   * Mock: the dialog is rendered open with a minimal accessible title.
   * Assert: the X button uses the shared 32px spacing and visible focus tokens.
   */
  test('uses the shared close button treatment', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Exercício</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveClass(
      'right-3',
      'top-3',
      'inline-flex',
      'items-center',
      'justify-center',
      'size-8',
      'p-0',
      'focus-visible:ring-2',
    );
  });
});
