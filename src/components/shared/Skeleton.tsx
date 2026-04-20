import React from "react";
import "./Skeleton.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

/** Una barra con animación pulse para reemplazar spinners genéricos. */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1rem",
  borderRadius = "6px",
  className = "",
}) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

/** Skeleton de tarjeta de tema (ThemeCard) — 1 bloque con 2 líneas */
export const ThemeCardSkeleton: React.FC = () => (
  <div className="skeleton-theme-card">
    <div className="skeleton-theme-top">
      <Skeleton width="60%" height="1.1rem" />
      <Skeleton width="2.5rem" height="1.5rem" borderRadius="99px" />
    </div>
    <Skeleton width="80%" height="0.75rem" className="mt-8" />
    <Skeleton width="55%" height="0.75rem" className="mt-6" />
    <div className="skeleton-theme-footer">
      <Skeleton width="3.5rem" height="1.7rem" borderRadius="8px" />
      <Skeleton width="3.5rem" height="1.7rem" borderRadius="8px" />
    </div>
  </div>
);

/** Skeleton de fila de flashcard (CardRow) */
export const CardRowSkeleton: React.FC = () => (
  <div className="skeleton-card-row">
    <div className="skeleton-card-texts">
      <Skeleton width="55%" height="0.85rem" />
      <Skeleton width="38%" height="0.75rem" className="mt-6" />
    </div>
    <Skeleton width="4rem" height="1.6rem" borderRadius="8px" />
  </div>
);

/** Skeleton de stat card del dashboard */
export const StatCardSkeleton: React.FC = () => (
  <div className="skeleton-stat-card">
    <Skeleton width="2.5rem" height="2.5rem" borderRadius="10px" />
    <div className="skeleton-stat-texts">
      <Skeleton width="3rem" height="1.6rem" />
      <Skeleton width="5rem" height="0.7rem" className="mt-6" />
    </div>
  </div>
);

/** N repeticiones de un skeleton */
export const SkeletonList: React.FC<{
  count?: number;
  component: React.FC;
}> = ({ count = 4, component: Item }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Item key={i} />
    ))}
  </>
);
