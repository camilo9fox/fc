import React, { useEffect, useState, useCallback } from "react";
import "./ContentSafetyToast.css";

interface SafetyViolationEvent {
  message: string;
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  profanity: "Lenguaje ofensivo",
  slurs: "Insultos discriminatorios",
  hate_speech: "Discurso de odio",
  hate_speech_targeted: "Ataque a grupo protegido",
  sexual_minors: "Contenido inapropiado sobre menores",
  self_harm: "Autolesion / Suicidio",
  violence_graphic: "Violencia grafica",
  terrorism: "Terrorismo",
  drugs_hard: "Drogas / Sustancias ilegales",
  sexual_content: "Contenido sexual",
  violent_crimes: "Crimenes violentos",
  non_violent_crimes: "Actividades ilegales",
  hate: "Discurso de odio",
  self_harm_instructions: "Instrucciones de autolesion",
  weapons: "Fabricacion de armas",
  unknown: "Contenido inapropiado",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || "Contenido inapropiado";
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "profanity":
      return "\u{1F92C}";
    case "slurs":
      return "\u{1F5A4}";
    case "hate_speech":
    case "hate_speech_targeted":
    case "hate":
      return "\u{1F6AB}";
    case "sexual_minors":
    case "sexual_content":
      return "\u{1F6A8}";
    case "self_harm":
    case "self_harm_instructions":
      return "\u{1F494}";
    case "violence_graphic":
    case "violent_crimes":
      return "\u{26A0}\u{FE0F}";
    case "terrorism":
    case "weapons":
      return "\u{1F4A3}";
    case "drugs_hard":
      return "\u{1F48A}";
    default:
      return "\u{26A0}\u{FE0F}";
  }
}

const AUTO_DISMISS_MS = 8000;

const ContentSafetyToast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [violation, setViolation] = useState<SafetyViolationEvent | null>(null);
  const [dismissTimer, setDismissTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const dismiss = useCallback(() => {
    if (!visible) return;
    setExiting(true);
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      setDismissTimer(null);
    }
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setViolation(null);
    }, 300);
  }, [visible, dismissTimer]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<SafetyViolationEvent>).detail;
      if (!detail?.message) return;

      if (dismissTimer) clearTimeout(dismissTimer);

      setViolation(detail);
      setVisible(true);
      setExiting(false);

      const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
      setDismissTimer(timer);
    };

    window.addEventListener("content-safety-violation", handler);
    return () => {
      window.removeEventListener("content-safety-violation", handler);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismiss]);

  if (!visible && !exiting) return null;

  const category = violation?.category || "unknown";

  return (
    <div className={`cst-overlay ${exiting ? "cst-exit" : ""}`}>
      <div
        className={`cst-toast ${exiting ? "cst-toast-exit" : "cst-toast-enter"}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="cst-toast-header">
          <span className="cst-toast-icon">{getCategoryIcon(category)}</span>
          <span className="cst-toast-title">
            Contenido bloqueado por seguridad
          </span>
          <button
            className="cst-toast-close"
            onClick={dismiss}
            aria-label="Cerrar"
            type="button"
          >
            &times;
          </button>
        </div>
        <div className="cst-toast-body">
          <p className="cst-category-badge">
            {getCategoryLabel(category)}
          </p>
          <p className="cst-message">{violation?.message}</p>
        </div>
        <div className="cst-toast-footer">
          <button
            className="cst-dismiss-btn"
            onClick={dismiss}
            type="button"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentSafetyToast;
