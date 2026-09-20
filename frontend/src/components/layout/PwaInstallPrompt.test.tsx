import { act, fireEvent, render, screen } from '@testing-library/react';
import { PwaInstallPrompt } from './PwaInstallPrompt';

type InstallPromptEvent = Event & {
  prompt: jest.Mock<Promise<{ outcome: 'accepted' | 'dismissed' }>, []>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const createInstallPromptEvent = (
  outcome: 'accepted' | 'dismissed' = 'accepted',
): InstallPromptEvent => {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as InstallPromptEvent;
  event.prompt = jest.fn<Promise<{ outcome: 'accepted' | 'dismissed' }>, []>(() =>
    Promise.resolve({ outcome }),
  );
  event.userChoice = Promise.resolve({ outcome });
  return event;
};

const setUserAgent = (userAgent: string): void => {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  });
};

describe('PwaInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    setUserAgent('Mozilla/5.0 Chrome/140.0');
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  });

  test('stays hidden when the browser cannot offer installation', () => {
    render(<PwaInstallPrompt />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('captures the native install event and prompts once from the install button', async () => {
    render(<PwaInstallPrompt />);
    const event = createInstallPromptEvent();

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Instalar app' })).toHaveAccessibleName(
      'Instalar app',
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders a compact floating pill in the lower-right corner', async () => {
    render(<PwaInstallPrompt />);
    const event = createInstallPromptEvent();

    await act(async () => {
      window.dispatchEvent(event);
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('fixed', 'bottom-4', 'right-4', 'rounded-full', 'p-0');
    expect(screen.getByRole('button', { name: 'Instalar app' })).toHaveClass('rounded-l-full');
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveClass(
      'w-[calc(2.5rem+1px)]',
      'justify-center',
      'px-0',
      'rounded-r-full',
    );
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  test('remembers a dismissed native prompt and hides after app installation', async () => {
    render(<PwaInstallPrompt />);
    const dismissedEvent = createInstallPromptEvent('dismissed');

    await act(async () => {
      window.dispatchEvent(dismissedEvent);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
    });

    expect(dismissedEvent.prompt).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('ficha_treino_pwa_install_dismissed')).not.toBeNull();

    localStorage.clear();
    const installedEvent = createInstallPromptEvent();
    await act(async () => {
      window.dispatchEvent(installedEvent);
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows manual instructions on iOS and hides after dismissal', async () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
    render(<PwaInstallPrompt />);

    expect(screen.queryByText(/Compartilhar/)).not.toBeInTheDocument();
    const installButton = await screen.findByRole('button', { name: 'Instalar app' });
    expect(installButton).toHaveAttribute('aria-controls', 'pwa-install-instructions');
    fireEvent.click(installButton);
    expect(screen.getByText(/Compartilhar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(localStorage.getItem('ficha_treino_pwa_install_dismissed')).not.toBeNull();
  });

  test('uses the modal close control treatment for the banner close button', async () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
    render(<PwaInstallPrompt />);

    const closeButton = await screen.findByRole('button', { name: 'Fechar' });
    expect(closeButton).toHaveClass(
      'h-10',
      'w-[calc(2.5rem+1px)]',
      'text-primary-foreground',
      'focus-visible:ring-2',
    );
    fireEvent.click(closeButton);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('stays hidden when already running standalone', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    render(<PwaInstallPrompt />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows again after the dismissal window expires', async () => {
    localStorage.setItem(
      'ficha_treino_pwa_install_dismissed',
      String(Date.now() - 8 * 24 * 60 * 60 * 1000),
    );
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');

    render(<PwaInstallPrompt />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
