import React from "react";
import { useNavigate } from "react-router-dom";
import "./NoCategoryBanner.css";

interface NoCategoryBannerProps {
  /** The feature name shown in the message, e.g. "flashcards" */
  feature?: string;
}

const NoCategoryBanner: React.FC<NoCategoryBannerProps> = ({
  feature = "contenido",
}) => {
  const navigate = useNavigate();

  return (
    <div className="ncb-banner">
      <div className="ncb-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
            stroke="#631D76"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
            stroke="#631D76"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="ncb-text">
        <strong>Primero crea un tema de estudio</strong>
        <p>
          Para poder crear {feature} necesitas tener al menos un tema de estudio
          que los agrupe. Los temas te ayudan a organizar todo tu material.
        </p>
      </div>
      <button className="ncb-btn" onClick={() => navigate("/categories")}>
        Crear tema
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14M12 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default NoCategoryBanner;
