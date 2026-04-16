import React, { useCallback, useEffect, useState } from "react";
import { FlashCard } from "../../api/flashcards";
import "./StudySession.css";

interface StudySessionProps {
  cards: FlashCard[];
  title: string;
  onClose: () => void;
}

const RING_SLOTS = 7;
const ANGLE_STEP = 360 / RING_SLOTS;
const RADIUS = 400;

const StudySession: React.FC<StudySessionProps> = ({
  cards,
  title,
  onClose,
}) => {
  const total = cards.length;

  const [ringAngle, setRingAngle] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const goNext = useCallback(() => {
    if (animating || total <= 1) return;
    setAnimating(true);
    setFlipped(false);
    setRingAngle((a) => a - ANGLE_STEP);
  }, [animating, total]);

  const goPrev = useCallback(() => {
    if (animating || total <= 1) return;
    setAnimating(true);
    setFlipped(false);
    setRingAngle((a) => a + ANGLE_STEP);
  }, [animating, total]);

  const handleRingTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;
      const stepsForward = Math.round(-ringAngle / ANGLE_STEP);
      setSnapping(true);
      setCurrentIndex((i) => (((i + stepsForward) % total) + total) % total);
      setRingAngle(0);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setSnapping(false);
          setAnimating(false);
        }),
      );
    },
    [ringAngle, total],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  return (
    <div className="ss-overlay" role="dialog" aria-modal="true">
      <header className="ss-header">
        <h2 className="ss-title">{title}</h2>
        <span className="ss-counter">
          {currentIndex + 1} / {total}
        </span>
        <button className="ss-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
      </header>

      <div className="ss-progress-track">
        <div
          className="ss-progress-fill"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      <div className="ss-scene">
        <div
          className="ss-ring"
          style={{
            transform: `rotateY(${ringAngle}deg)`,
            transition: animating
              ? `transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)`
              : "none",
            opacity: snapping ? 0 : 1,
          }}
          onTransitionEnd={handleRingTransitionEnd}
        >
          {Array.from({ length: RING_SLOTS }, (_, slot) => {
            const slotAngle = slot * ANGLE_STEP;
            const card = cards[(currentIndex + slot) % total];
            const isActive = slot === 0;

            const normalizedAngle =
              (((slotAngle + ringAngle) % 360) + 360) % 360;
            const viewAngle =
              normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;
            const absAngle = Math.abs(viewAngle);

            const opacity =
              absAngle > 130 ? 0 : Math.max(0.25, 1 - absAngle / 130);
            const scale = isActive
              ? 1
              : Math.max(0.72, 1 - (absAngle / 180) * 0.28);
            const zIndex = isActive ? 10 : Math.round(50 - absAngle);
            const isHidden = absAngle >= 135;

            return (
              <div
                key={slot}
                className={`ss-slot${isActive ? " ss-slot--active" : ""}`}
                style={{
                  transform: `rotateY(${slotAngle}deg) translateZ(${RADIUS}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  visibility: isHidden ? "hidden" : "visible",
                  pointerEvents: isActive ? "auto" : "none",
                }}
                onClick={isActive ? () => setFlipped((f) => !f) : undefined}
              >
                <div
                  className={`ss-card${isActive && flipped ? " ss-card--flipped" : ""}`}
                >
                  <div className="ss-face ss-face--front">
                    <span className="ss-tag ss-tag--q">Pregunta</span>
                    <p className="ss-text">{card.question}</p>
                    {card.category?.title && (
                      <span className="ss-chip">{card.category.title}</span>
                    )}
                    {isActive && (
                      <span className="ss-hint">
                        Haz clic para ver la respuesta
                      </span>
                    )}
                  </div>

                  <div className="ss-face ss-face--back">
                    <span className="ss-tag ss-tag--a">Respuesta</span>
                    <p className="ss-text">{card.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="ss-footer">
        <div className="ss-controls">
          <button
            className="ss-nav-btn"
            onClick={goPrev}
            disabled={total <= 1}
            aria-label="Anterior"
          >
            &#8592;
          </button>
          <button className="ss-flip-btn" onClick={() => setFlipped((f) => !f)}>
            {flipped ? "Ver pregunta" : "Ver respuesta"}
          </button>
          <button
            className="ss-nav-btn"
            onClick={goNext}
            disabled={total <= 1}
            aria-label="Siguiente"
          >
            &#8594;
          </button>
        </div>
        <p className="ss-kbd-hint">
          ← → navegar &nbsp;·&nbsp; Espacio voltear &nbsp;·&nbsp; Esc salir
        </p>
      </footer>
    </div>
  );
};

export default StudySession;
