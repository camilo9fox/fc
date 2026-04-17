import React from "react";
import { FlashCard } from "../../api/flashcards";

interface FlashcardsTabProps {
  flashcards: FlashCard[];
  onStudy: (cards: FlashCard[]) => void;
  onNavigate: () => void;
}

const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  flashcards,
  onStudy,
  onNavigate,
}) => {
  if (flashcards.length === 0) {
    return (
      <div className="ts-detail-section">
        <div className="ts-detail-empty">
          <p>No hay flashcards en este tema todavía.</p>
          <button className="ts-btn-secondary" onClick={onNavigate}>
            Ir a Flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-detail-section">
      <div className="ts-detail-section-bar">
        <span className="ts-detail-count">{flashcards.length} tarjetas</span>
        <button
          className="ts-btn-primary ts-btn-sm"
          onClick={() => onStudy(flashcards)}
        >
          &#9654; Estudiar todo
        </button>
      </div>
      <div className="ts-detail-fc-list">
        {flashcards.map((fc) => (
          <div key={fc.id} className="ts-detail-fc-item">
            <div className="ts-detail-fc-q">
              <span className="ts-detail-fc-label">P</span>
              <span>{fc.question}</span>
            </div>
            <div className="ts-detail-fc-a">
              <span className="ts-detail-fc-label ts-detail-fc-label--a">
                R
              </span>
              <span>{fc.answer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsTab;
