import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { useProductTour, TOUR_STEPS } from "../../contexts/ProductTourContext";
import "./ProductTour.css";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

const ProductTour: React.FC = () => {
  const { isRunning, currentStep, nextStep, prevStep, skipTour } = useProductTour();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipSide, setTooltipSide] = useState<"right" | "bottom" | "left">("right");

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep >= TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isRunning) return;

    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (!el) {
        setTargetRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });

      // Decide tooltip side: if element is in right half, show tooltip on left
      const viewWidth = window.innerWidth;
      if (r.right > viewWidth * 0.55 && viewWidth > 700) {
        setTooltipSide("left");
      } else {
        setTooltipSide("right");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    const interval = setInterval(updatePosition, 150);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      clearInterval(interval);
    };
  }, [isRunning, currentStep, step.targetId]);

  // Scroll target into view
  useEffect(() => {
    if (!isRunning) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isRunning, currentStep, step.targetId]);

  if (!isRunning) return null;

  const progress = `${currentStep + 1} / ${TOUR_STEPS.length}`;

  return createPortal(
    <div className="pt-overlay">
      {/* Dark background with spotlight cutout */}
      <svg className="pt-spotlight-svg" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} preserveAspectRatio="none">
        <defs>
          <mask id="pt-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#pt-mask)" />
        {targetRect && (
          <rect
            x={targetRect.left - 8}
            y={targetRect.top - 8}
            width={targetRect.width + 16}
            height={targetRect.height + 16}
            rx="10"
            fill="none"
            stroke="#ee4266"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />
        )}
      </svg>

      {/* Tooltip */}
      {targetRect && (
        <div
          className={`pt-tooltip pt-tooltip-${tooltipSide}`}
          style={
            tooltipSide === "right"
              ? { top: Math.max(16, targetRect.top - 30), left: targetRect.right + 24 }
              : { top: Math.max(16, targetRect.top - 30), right: window.innerWidth - targetRect.left + 24 }
          }
        >
          <button className="pt-close-btn" onClick={skipTour} aria-label="Cerrar tour">
            <X size={16} />
          </button>
          <div className="pt-step-progress">{progress}</div>
          <h3 className="pt-step-title">{step.title}</h3>
          <p className="pt-step-desc">{step.description}</p>
          <div className="pt-step-actions">
            <button className="pt-btn-skip" onClick={skipTour}>
              Omitir
            </button>
            <div className="pt-nav-btns">
              {currentStep > 0 && (
                <button className="pt-btn-prev" onClick={prevStep}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <button className="pt-btn-next" onClick={nextStep}>
                <span>{isLast ? "¡Listo!" : "Siguiente"}</span>
                {!isLast && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile fallback: show card centered if no target found */}
      {!targetRect && (
        <div className="pt-tooltip pt-tooltip-center">
          <button className="pt-close-btn" onClick={skipTour} aria-label="Cerrar tour">
            <X size={16} />
          </button>
          <div className="pt-step-progress">{progress}</div>
          <h3 className="pt-step-title">{step.title}</h3>
          <p className="pt-step-desc">{step.description}</p>
          <div className="pt-step-actions">
            <button className="pt-btn-skip" onClick={skipTour}>Omitir</button>
            <button className="pt-btn-next" onClick={nextStep}>
              <span>{isLast ? "¡Listo!" : "Siguiente"}</span>
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};

export default ProductTour;
