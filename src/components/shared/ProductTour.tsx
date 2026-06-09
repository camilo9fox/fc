import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { useProductTour } from "../../contexts/ProductTourContext";
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
  const { isRunning, currentStep, steps, nextStep, prevStep, skipTour } = useProductTour();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipSide, setTooltipSide] = useState<"right" | "bottom" | "left">("right");

  const step = steps[currentStep];
  const isLast = currentStep >= steps.length - 1;

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

  useEffect(() => {
    if (!isRunning) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isRunning, currentStep, step.targetId]);

  if (!isRunning) return null;

  const progress = `${currentStep + 1} / ${steps.length}`;

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 700;

  const tooltip = (
    <div className={`pt-tooltip ${isMobile ? "pt-tooltip-mobile" : `pt-tooltip-${tooltipSide}`}`}
      style={!isMobile && targetRect ? (
        tooltipSide === "right"
          ? { top: Math.max(16, targetRect.top - 30), left: targetRect.right + 24 }
          : { top: Math.max(16, targetRect.top - 30), right: window.innerWidth - targetRect.left + 24 }
      ) : undefined}
    >
      <button className="pt-close-btn" onClick={skipTour} aria-label="Cerrar tour">
        <X size={16} />
      </button>
      <div className="pt-step-progress">{progress}</div>
      <h3 className="pt-step-title">{step.title}</h3>
      <p className="pt-step-desc">{step.description}</p>
      <div className="pt-step-actions">
        <button className="pt-btn-skip" onClick={skipTour}>Omitir</button>
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
  );

  return createPortal(
    <div className="pt-overlay">
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
      {tooltip}
    </div>,
    document.body,
  );
};

export default ProductTour;
