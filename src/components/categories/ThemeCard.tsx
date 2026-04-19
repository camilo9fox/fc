import React from "react";

interface ThemeCardProps {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  title,
  description,
  isPublic,
  onEdit,
  onDelete,
  onOpen,
}) => (
  <div className="ts-card" onClick={onOpen} style={{ cursor: "pointer" }}>
    <div className="ts-card-accent" />
    <div className="ts-card-body">
      <div className="ts-card-top">
        <div className="ts-card-icon">
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
        <div className="ts-card-actions">
          <span
            className={`ts-publish-badge${isPublic ? " ts-publish-badge--on" : ""}`}
          >
            {isPublic ? "🌐 Público" : "🔒 Privado"}
          </span>
          <button
            className="ts-card-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="ts-card-btn ts-card-btn-del"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Eliminar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <polyline
                points="3 6 5 6 21 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11v6M14 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <h3 className="ts-card-title">{title}</h3>
      {description && <p className="ts-card-desc">{description}</p>}
      <div className="ts-card-tags">
        <span className="ts-tag">Flashcards</span>
        <span className="ts-tag">Cuestionarios</span>
        <span className="ts-tag">V / F</span>
      </div>
    </div>
  </div>
);

export default ThemeCard;
