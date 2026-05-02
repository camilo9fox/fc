import React, { useEffect, useMemo, useRef, useState } from "react";
import { Coins, TimerReset, X } from "lucide-react";
import { AiUsageStatus, statsApi } from "../../api/stats";
import "./AiUsagePulseBar.css";

const REFRESH_MS = 45_000;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatDuration = (ms: number) => {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const getTone = (remainingPercent: number) => {
  if (remainingPercent <= 0) return "critical";
  if (remainingPercent <= 25) return "warning";
  return "ok";
};

export const AiUsagePulseBar: React.FC = () => {
  const [usage, setUsage] = useState<AiUsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isOpen, setIsOpen] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const previousCreditsRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await statsApi.getAiUsage();
        if (cancelled) return;
        setUsage(data);
        setHasError(false);
      } catch {
        if (cancelled) return;
        setHasError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const refresh = window.setInterval(load, REFRESH_MS);
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      cancelled = true;
      window.clearInterval(refresh);
      window.clearInterval(ticker);
    };
  }, []);

  const model = useMemo(() => {
    if (!usage) return null;

    const creditsLimit = Math.max(1, Number(usage.creditsLimit || 1));
    const creditsRemaining = clamp(
      Number(usage.creditsRemaining || 0),
      0,
      creditsLimit,
    );
    const remainingPercent = Math.round(
      (creditsRemaining / creditsLimit) * 100,
    );

    const burstLimit = Math.max(1, Number(usage.burstLimit || 1));
    const burstUsed = clamp(Number(usage.burstUsed || 0), 0, burstLimit);
    const burstRemaining = Math.max(0, burstLimit - burstUsed);

    const periodResetMs = new Date(usage.periodEnd).getTime() - now;
    const burstResetMs = new Date(usage.burstWindowResetAt).getTime() - now;

    return {
      creditsLimit,
      creditsRemaining,
      remainingPercent,
      burstLimit,
      burstUsed,
      burstRemaining,
      creditsUsed: Math.max(0, creditsLimit - creditsRemaining),
      periodResetLabel: formatDuration(periodResetMs),
      burstResetLabel: formatDuration(burstResetMs),
      periodEndLabel: new Date(usage.periodEnd).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      tone: getTone(remainingPercent),
    };
  }, [usage, now]);

  useEffect(() => {
    if (!model) return;

    const currentCredits = model.creditsRemaining;

    if (
      previousCreditsRef.current !== null &&
      previousCreditsRef.current !== currentCredits
    ) {
      setShouldPulse(true);
      const timeoutId = window.setTimeout(() => setShouldPulse(false), 600);
      previousCreditsRef.current = currentCredits;
      return () => window.clearTimeout(timeoutId);
    }

    previousCreditsRef.current = currentCredits;
  }, [model]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (hasError || !usage || !model || !usage.enabled) {
    return null;
  }

  return (
    <div className="ai-credits-widget" aria-live="polite">
      <button
        type="button"
        className={`ai-credits-trigger ai-credits-tone-${model.tone} ${shouldPulse ? "is-pulsing" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Ver detalle de creditos IA"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={loading}
      >
        <Coins size={15} />
        <span className="ai-credits-trigger-value">
          {model.creditsRemaining}
        </span>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="ai-credits-backdrop"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar detalle de creditos"
          />

          <section
            className="ai-credits-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de creditos IA"
          >
            <header className="ai-credits-modal-head">
              <div className="ai-credits-modal-title">
                <Coins size={15} />
                Creditos IA
              </div>
              <button
                type="button"
                className="ai-credits-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
              >
                <X size={14} />
              </button>
            </header>

            <div className="ai-credits-kpis">
              <div className="ai-credits-kpi">
                <span>Disponibles</span>
                <strong>
                  {model.creditsRemaining}/{model.creditsLimit}
                </strong>
              </div>
              <div className="ai-credits-kpi">
                <span>Usados hoy</span>
                <strong>{model.creditsUsed}</strong>
              </div>
            </div>

            <div
              className="ai-credits-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={model.remainingPercent}
              aria-label="Porcentaje de creditos restantes"
            >
              <div
                className="ai-credits-fill"
                style={{ width: `${model.remainingPercent}%` }}
              />
            </div>

            <div className="ai-credits-row">
              <span>Ventana rapida</span>
              <strong>
                {model.burstRemaining}/{model.burstLimit}
              </strong>
            </div>

            <div className="ai-credits-row ai-credits-row-muted">
              <span>Recarga rapida</span>
              <strong>{model.burstResetLabel}</strong>
            </div>

            <div className="ai-credits-row ai-credits-row-muted">
              <span className="ai-credits-row-inline">
                <TimerReset size={13} />
                Reset diario
              </span>
              <strong>
                {model.periodResetLabel} ({model.periodEndLabel})
              </strong>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AiUsagePulseBar;
