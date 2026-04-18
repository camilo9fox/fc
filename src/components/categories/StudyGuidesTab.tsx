import React from "react";
import { StudyGuide } from "../../api/studyGuides";

interface StudyGuidesTabProps {
  guides: StudyGuide[];
  onNavigate: () => void;
}

const StudyGuidesTab: React.FC<StudyGuidesTabProps> = ({
  guides,
  onNavigate,
}) => {
  if (guides.length === 0) {
    return (
      <div className="ts-detail-section">
        <div className="ts-detail-empty">
          <p>No hay guías de estudio en este tema todavía.</p>
          <button className="ts-btn-secondary" onClick={onNavigate}>
            Ir a Guías de Estudio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-detail-section">
      <div className="ts-detail-list">
        {guides.map((g) => (
          <div key={g.id} className="ts-detail-item">
            <div className="ts-detail-item-icon ts-detail-item-icon--sg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="13"
                  x2="8"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="ts-detail-item-info">
              <span className="ts-detail-item-title">{g.title}</span>
              <span className="ts-detail-item-meta">
                {new Date(g.createdAt).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <button className="ts-btn-primary ts-btn-sm" onClick={onNavigate}>
              Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyGuidesTab;
