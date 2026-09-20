'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DownloadIcon, XIcon } from '@/components/ui/WorkoutIcons';

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
  showIosInstructions: boolean;
  onToggleIosInstructions: () => void;
};

const PwaInstallAlert = ({
  platform,
  onInstall,
  onDismiss,
  showIosInstructions,
  onToggleIosInstructions,
}: PwaInstallAlertProps): React.JSX.Element => (
  <Alert
    aria-live="polite"
    className="fixed bottom-4 right-4 z-50 m-0 flex w-auto max-w-[calc(100%-2rem)] items-center overflow-visible rounded-full border-0 bg-foreground p-0 text-primary-foreground shadow-lg [margin-bottom:env(safe-area-inset-bottom)]"
  >
    {platform === 'ios' && showIosInstructions ? (
      <div
        id="pwa-install-instructions"
        className="absolute bottom-full right-0 mb-2 w-72 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground shadow-lg"
      >
        Toque em Compartilhar e escolha “Adicionar à Tela de Início”.
      </div>
    ) : null}
    <Button
      type="button"
      size="sm"
      className="h-10 rounded-l-full rounded-r-none px-4 text-primary-foreground hover:bg-foreground/85"
      aria-expanded={platform === 'ios' ? showIosInstructions : undefined}
      aria-controls={platform === 'ios' ? 'pwa-install-instructions' : undefined}
      onClick={platform === 'native' ? onInstall : onToggleIosInstructions}
    >
      <DownloadIcon data-testid="download-icon" className="size-4" aria-hidden="true" />
      Instalar app
    </Button>
    <button
      type="button"
      className="inline-flex h-10 w-[calc(2.5rem+1px)] shrink-0 items-center justify-center rounded-r-full border-l border-primary-foreground/30 p-0 px-0 text-primary-foreground transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Fechar"
      onClick={onDismiss}
    >
      <XIcon className="size-4" aria-hidden="true" />
    </button>
  </Alert>
);

const PwaInstallPrompt = (): React.JSX.Element | null => {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

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
      setShowIosInstructions(false);
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
    setShowIosInstructions(false);
  };

  const install = async (): Promise<void> => {
    if (!installEvent) {
      return;
    }
    const { outcome } = await installEvent.prompt();
    setInstallEvent(null);
    setPlatform(null);
    setShowIosInstructions(false);
    if (outcome === 'dismissed') {
      rememberDismissal();
    }
  };

  return (
    <PwaInstallAlert
      platform={platform}
      onInstall={() => void install()}
      onDismiss={dismiss}
      showIosInstructions={showIosInstructions}
      onToggleIosInstructions={() => setShowIosInstructions((visible) => !visible)}
    />
  );
};

export { PwaInstallPrompt };
