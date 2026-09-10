'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { XIcon } from '@/components/ui/WorkoutIcons';

const DISMISSAL_KEY = 'ficha_treino_pwa_install_dismissed';
const DISMISSAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type InstallOutcome = 'accepted' | 'dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: InstallOutcome }>;
  userChoice: Promise<{ outcome: InstallOutcome }>;
};

type InstallPlatform = 'native' | 'ios';

const isIosDevice = (): boolean => {
  const userAgent = window.navigator.userAgent;
  const isAppleTouchDevice =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(userAgent) || isAppleTouchDevice;
};

const isStandalone = (): boolean => {
  const standaloneNavigator = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    standaloneNavigator.standalone === true
  );
};

const wasRecentlyDismissed = (): boolean => {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSAL_KEY));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISSAL_WINDOW_MS;
  } catch {
    return false;
  }
};

const rememberDismissal = (): void => {
  try {
    localStorage.setItem(DISMISSAL_KEY, String(Date.now()));
  } catch {
    // Private browsing can disable storage; dismissal remains valid for this render.
  }
};

type PwaInstallAlertProps = {
  platform: InstallPlatform;
  onInstall: () => void;
  onDismiss: () => void;
};

const PwaInstallAlert = ({
  platform,
  onInstall,
  onDismiss,
}: PwaInstallAlertProps): React.JSX.Element => (
  <Alert
    aria-live="polite"
    className="fixed bottom-4 left-1/2 right-auto top-auto z-50 mx-0 grid w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 translate-y-0 gap-3 overflow-visible rounded-[var(--radius)] border-border bg-card p-4 pr-4 text-card-foreground shadow-lg [padding-bottom:calc(1rem+env(safe-area-inset-bottom))] sm:pr-20"
  >
    <button
      type="button"
      className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-[var(--radius)] p-0 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Fechar"
      onClick={onDismiss}
    >
      <XIcon className="size-4" />
    </button>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full min-w-0">
        <AlertTitle className="mb-0 text-sm font-semibold tracking-normal">
          Instale o Ficha de Treino
        </AlertTitle>
        {platform === 'native' ? (
          <AlertDescription className="mt-1 text-sm leading-normal text-muted-foreground">
            Tenha acesso rápido aos seus treinos como um aplicativo.
          </AlertDescription>
        ) : (
          <AlertDescription className="mt-1 text-sm leading-normal text-muted-foreground">
            Toque em Compartilhar e escolha “Adicionar à Tela de Início”.
          </AlertDescription>
        )}
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:ml-8 sm:w-auto sm:flex-row">
        {platform === 'native' ? (
          <Button type="button" size="sm" className="w-full sm:w-auto" onClick={onInstall}>
            Instalar app
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onDismiss}
        >
          Dispensar
        </Button>
      </div>
    </div>
  </Alert>
);

const PwaInstallPrompt = (): React.JSX.Element | null => {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) {
      return undefined;
    }

    const iosTimer = isIosDevice() ? window.setTimeout(() => setPlatform('ios'), 0) : undefined;

    const handleBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setPlatform('native');
    };
    const handleAppInstalled = (): void => {
      setInstallEvent(null);
      setPlatform(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      if (iosTimer !== undefined) {
        window.clearTimeout(iosTimer);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!platform) {
    return null;
  }

  const dismiss = (): void => {
    rememberDismissal();
    setPlatform(null);
    setInstallEvent(null);
  };

  const install = async (): Promise<void> => {
    if (!installEvent) {
      return;
    }
    const { outcome } = await installEvent.prompt();
    setInstallEvent(null);
    setPlatform(null);
    if (outcome === 'dismissed') {
      rememberDismissal();
    }
  };

  return (
    <PwaInstallAlert platform={platform} onInstall={() => void install()} onDismiss={dismiss} />
  );
};

export { PwaInstallPrompt };
