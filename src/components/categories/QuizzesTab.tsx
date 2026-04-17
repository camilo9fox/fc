import React from "react";
import { Quiz } from "../../api/quiz";

interface QuizzesTabProps {
  quizzes: Quiz[];
  onNavigate: () => void;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ quizzes, onNavigate }) => {
  if (quizzes.length === 0) {
    return (
      <div className="ts-detail-section">
        <div className="ts-detail-empty">
          <p>No hay cuestionarios en este tema todavía.</p>
          <button className="ts-btn-secondary" onClick={onNavigate}>
            Ir a Cuestionarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-detail-section">
      <div className="ts-detail-list">
        {quizzes.map((q) => (
          <div key={q.id} className="ts-detail-item">
            <div className="ts-detail-item-icon ts-detail-item-icon--quiz">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="17"
                  r="0.5"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="ts-detail-item-info">
              <span className="ts-detail-item-title">{q.title}</span>
              {q.questions && (
                <span className="ts-detail-item-meta">
                  {q.questions.length} preguntas
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

export default QuizzesTab;
