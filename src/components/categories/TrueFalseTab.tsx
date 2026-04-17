import React from "react";
import { TrueFalseSet } from "../../api/trueFalse";

interface TrueFalseTabProps {
  tfSets: TrueFalseSet[];
  onNavigate: () => void;
}

const TrueFalseTab: React.FC<TrueFalseTabProps> = ({ tfSets, onNavigate }) => {
  if (tfSets.length === 0) {
    return (
      <div className="ts-detail-section">
        <div className="ts-detail-empty">
          <p>No hay sets de V/F en este tema todavía.</p>
          <button className="ts-btn-secondary" onClick={onNavigate}>
            Ir a Verdadero / Falso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-detail-section">
      <div className="ts-detail-list">
        {tfSets.map((s) => (
          <div key={s.id} className="ts-detail-item">
            <div className="ts-detail-item-icon ts-detail-item-icon--tf">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11l3 3L22 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="ts-detail-item-info">
              <span className="ts-detail-item-title">{s.title}</span>
              {s.questions && (
                <span className="ts-detail-item-meta">
                  {s.questions.length} enunciados
                </span>
              )}
            </div>
            <button className="ts-btn-primary ts-btn-sm" onClick={onNavigate}>
              Estudiar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrueFalseTab;
