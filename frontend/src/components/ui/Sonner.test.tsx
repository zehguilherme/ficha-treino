import { render, screen } from '@testing-library/react';
import type { ToasterProps } from 'sonner';

const mockedSonner = jest.fn((props: ToasterProps): React.JSX.Element => (
  <>
    <div data-testid="success-toast" className={props.toastOptions?.classNames?.success}>
      <span className={props.toastOptions?.classNames?.title}>Sucesso</span>
      <span className={props.toastOptions?.classNames?.description}>Exercício adicionado.</span>
    </div>
    <div data-testid="warning-toast" className={props.toastOptions?.classNames?.warning}>
      <span className={props.toastOptions?.classNames?.title}>Atenção</span>
      <span className={props.toastOptions?.classNames?.description}>Exercício já adicionado.</span>
    </div>
  </>
));

jest.mock('sonner', () => ({
  Toaster: (props: ToasterProps): React.JSX.Element => mockedSonner(props),
}));

import { Toaster } from './Sonner';

describe('Toaster', () => {
  /**
   * The shared toast host fixes notification placement and semantic styling.
   * Mock: Sonner receives the wrapper props without rendering its portal.
   * Assert: top-right placement and readable success/warning classes are forwarded.
   */
  test('configures top-right placement and semantic toast classes', () => {
    render(<Toaster position="bottom-left" />);

    expect(mockedSonner).toHaveBeenCalledWith(
      expect.objectContaining({
        position: 'top-right',
        toastOptions: {
          classNames: {
            toast: 'border',
            success: '!bg-success !text-success-foreground !border-success',
            warning: '!bg-warning !text-warning-foreground !border-warning',
            title: '!font-medium !text-current',
            description: '!text-current',
          },
        },
      }),
    );
  });

  test('renders important semantic classes for success and warning toasts', () => {
    render(<Toaster />);

    expect(screen.getByTestId('success-toast')).toHaveClass(
      '!bg-success',
      '!text-success-foreground',
      '!border-success',
    );
    expect(screen.getByTestId('warning-toast')).toHaveClass(
      '!bg-warning',
      '!text-warning-foreground',
      '!border-warning',
    );
    expect(screen.getByText('Sucesso')).toHaveClass('!font-medium', '!text-current');
    expect(screen.getByText('Exercício adicionado.')).toHaveClass('!text-current');
  });
});
