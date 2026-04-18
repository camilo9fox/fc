import React, { useCallback, useEffect, useState } from "react";
import { FlashCard } from "../../api/flashcards";
import { StudyScoreResult } from "../shared/StudyScoreResult";
import {
  RING_SLOTS,
  RING_RADIUS_PX,
  RING_FADE_ANGLE,
  RING_HIDE_ANGLE,
  RING_SCALE_DAMPING,
} from "../../constants";
import "./StudySession.css";

interface StudySessionProps {
  cards: FlashCard[];
  title: string;
  onClose: () => void;
  onComplete?: (known: number, unknown: number, total: number) => void;
}

const ANGLE_STEP = 360 / RING_SLOTS;

const StudySession: React.FC<StudySessionProps> = ({
  cards,
  title,
  onClose,
  onComplete,
}) => {
  const total = cards.length;

  // ringAngle accumulates — never resets — so there is no snap-back flash
  const [ringAngle, setRingAngle] = useState(0);
  // frontSlot tracks which physical slot is facing the viewer
  const [frontSlot, setFrontSlot] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);

  const goNext = useCallback(() => {
    if (animating || total <= 1) return;
    setAnimating(true);
    setFlipped(false);
    setFrontSlot((s) => (s + 1) % RING_SLOTS);
    setCurrentIndex((i) => (i + 1) % total);
    setRingAngle((a) => a - ANGLE_STEP);
  }, [animating, total]);

  const goPrev = useCallback(() => {
    if (animating || total <= 1) return;
    setAnimating(true);
    setFlipped(false);
    setFrontSlot((s) => (s - 1 + RING_SLOTS) % RING_SLOTS);
    setCurrentIndex((i) => (i - 1 + total) % total);
    setRingAngle((a) => a + ANGLE_STEP);
  }, [animating, total]);

  const advanceAfterAnswer = useCallback(
    (wasKnown: boolean) => {
      const newKnown = known + (wasKnown ? 1 : 0);
      if (currentIndex + 1 >= total) {
        onComplete?.(newKnown, total - newKnown, total);
        setKnown(newKnown);
        setFinished(true);
      } else {
        setKnown(newKnown);
        goNext();
      }
    },
    [currentIndex, total, known, goNext, onComplete],
  );

  const handleKnown = useCallback(() => {
    if (!flipped || animating) return;
    advanceAfterAnswer(true);
  }, [flipped, animating, advanceAfterAnswer]);

  const handleUnknown = useCallback(() => {
    if (!flipped || animating) return;
    advanceAfterAnswer(false);
  }, [flipped, animating, advanceAfterAnswer]);

  const handleRestart = () => {
    setRingAngle(0);
    setFrontSlot(0);
    setCurrentIndex(0);
    setAnimating(false);
    setFlipped(false);
    setKnown(0);
    setFinished(false);
  };

  const handleRingTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;
      setAnimating(false);
    },
    [],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "1") {
        handleKnown();
      } else if (e.key === "2") {
        handleUnknown();
      } else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose, handleKnown, handleUnknown]);

  if (finished) {
    return (
      <StudyScoreResult
        score={known}
        total={total}
        title={title}
        itemLabel="tarjetas"
        returnLabel="Volver a las flashcards"
        onRetry={handleRestart}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="ss-overlay" role="dialog" aria-modal="true">
      <header className="ss-header">
        <h2 className="ss-title">{title}</h2>
        <span className="ss-counter">
          {currentIndex + 1} / {total}
        </span>
        <span className="ss-known-count" title="Sabidas hasta ahora">
          ✓ {known}
        </span>
        <button className="ss-close" onClick={onClose} aria-label="Cerrar">
          &#x2715;
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
          }}
          onTransitionEnd={handleRingTransitionEnd}
        >
          {Array.from({ length: RING_SLOTS }, (_, slot) => {
            const slotAngle = slot * ANGLE_STEP;
            const relPos = (slot - frontSlot + RING_SLOTS) % RING_SLOTS;
            const offset =
              relPos <= Math.floor(RING_SLOTS / 2)
                ? relPos
                : relPos - RING_SLOTS;
            const cardIndex =
              (((currentIndex + offset) % total) + total) % total;
            const card = cards[cardIndex];
            const isActive = slot === frontSlot;

            const normalizedAngle =
              (((slotAngle + ringAngle) % 360) + 360) % 360;
            const viewAngle =
              normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;
            const absAngle = Math.abs(viewAngle);

            const opacity =
              absAngle > RING_FADE_ANGLE
                ? 0
                : Math.max(0.25, 1 - absAngle / RING_FADE_ANGLE);
            const scale = isActive
              ? 1
              : Math.max(0.72, 1 - (absAngle / 180) * RING_SCALE_DAMPING);
            const zIndex = isActive ? 10 : Math.round(50 - absAngle);
            const isHidden = absAngle >= RING_HIDE_ANGLE;

            return (
              <div
                key={slot}
                className={`ss-slot${isActive ? " ss-slot--active" : ""}`}
                style={{
                  transform: `rotateY(${slotAngle}deg) translateZ(${RING_RADIUS_PX}px) scale(${scale})`,
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
        {flipped ? (
          <div className="ss-eval-controls">
            <button
              className="ss-eval-btn ss-eval-btn--unknown"
              onClick={handleUnknown}
            >
              ✗ No la sabía
            </button>
            <button
              className="ss-eval-btn ss-eval-btn--known"
              onClick={handleKnown}
            >
              ✓ La sabía
            </button>
          </div>
        ) : (
          <div className="ss-controls">
            <button
              className="ss-nav-btn"
              onClick={goPrev}
              disabled={total <= 1}
              aria-label="Anterior"
            >
              &#8592;
            </button>
            <button
              className="ss-flip-btn"
              onClick={() => setFlipped((f) => !f)}
            >
              Ver respuesta
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
        )}
        <p className="ss-kbd-hint">
          {flipped
            ? "1 → La sabía  ·  2 → No la sabía"
            : "← → navegar  ·  Espacio voltear  ·  Esc salir"}
        </p>
      </footer>
    </div>
  );
};

export default StudySession;
