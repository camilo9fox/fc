import React, { useEffect, useMemo, useState } from "react";
import "./PwaInstallPrompt.css";

type ChoiceResult = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<ChoiceResult>;
}

const DISMISS_KEY = "Flashy:pwa-install-dismissed-at";
const DISMISS_TTL_MS = 3 * 24 * 60 * 60 * 1000;

const isStandaloneMode = () => {
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return media || Boolean(iosStandalone);
};

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode());
  const isIos = useMemo(() => {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }, []);

  useEffect(() => {
    const rawDismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!rawDismissedAt) return;

    const dismissedAt = Number(rawDismissedAt);
    if (!Number.isFinite(dismissedAt)) return;

    if (Date.now() - dismissedAt < DISMISS_TTL_MS) {
      setDismissed(true);
    } else {
      localStorage.removeItem(DISMISS_KEY);
    }
  }, []);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(false);
      setIsStandalone(true);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canShowPrompt = useMemo(() => {
    return !isStandalone && !dismissed && (Boolean(deferredPrompt) || isIos);
  }, [deferredPrompt, dismissed, isStandalone, isIos]);

  const dismissPrompt = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setDismissed(false);
      localStorage.removeItem(DISMISS_KEY);
      return;
    }

    dismissPrompt();
  };

  if (!canShowPrompt) return null;

  const showInstallButton = Boolean(deferredPrompt);

  return (
    <aside className="pwa-install" role="dialog" aria-label="Instalar app">
      <div className="pwa-install-copy">
        <strong>Instala Flashy</strong>
        <p>
          {showInstallButton
            ? "Acceso rapido desde tu pantalla de inicio y mejor experiencia movil."
            : "En iPhone o iPad, abre Compartir y toca Anadir a pantalla de inicio."}
        </p>
      </div>
      <div className="pwa-install-actions">
        {showInstallButton && (
          <button
            type="button"
            className="pwa-install-btn"
            onClick={installApp}
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          className="pwa-install-dismiss"
          onClick={dismissPrompt}
        >
          Ahora no
        </button>
      </div>
    </aside>
  );
};

export default PwaInstallPrompt;
