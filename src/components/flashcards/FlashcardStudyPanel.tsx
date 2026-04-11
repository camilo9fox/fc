import React, { useMemo, useState } from "react";
import { FlashCard } from "../../api/flashcards";
import "./FlashcardsPage.css";

interface FlashcardStudyPanelProps {
  cards: FlashCard[];
  title: string;
  onClose: () => void;
  onDeleteCard?: (id: string) => void;
}

const FlashcardStudyPanel: React.FC<FlashcardStudyPanelProps> = ({
  cards,
  title,
  onClose,
  onDeleteCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = useMemo(() => cards[currentIndex], [cards, currentIndex]);

  const goPrevious = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setShowAnswer(false);
  };

  const goNext = () => {
    if (currentIndex >= cards.length - 1) return;
    setCurrentIndex((prev) => prev + 1);
    setShowAnswer(false);
  };

  return (
    <section className="flashcards-section study-panel">
      <div className="study-panel-header">
        <div>
          <h2>{title}</h2>
          <p className="study-panel-meta">
            {cards.length} tarjeta{cards.length === 1 ? "" : "s"} • Tarjeta{" "}
            {currentIndex + 1}/{cards.length}
          </p>
        </div>
        <button className="secondary-button" onClick={onClose}>
          Cerrar estudio
        </button>
      </div>

      {currentCard ? (
        <div className="study-card">
          <div className="study-card-header">
            <div>
              <div className="flashcard-question">{currentCard.question}</div>
              {currentCard.category?.title && (
                <span className="flashcard-category study-category">
                  {currentCard.category.title}
                </span>
              )}
            </div>
            {onDeleteCard && currentCard.id && (
              <button
                className="secondary-button small"
                onClick={() => onDeleteCard(currentCard.id)}
              >
                Eliminar tarjeta
              </button>
            )}
          </div>

          <div className="study-card-body">
            <div className="study-card-section">
              <h3>Pregunta</h3>
              <p>{currentCard.question}</p>
            </div>

            <div className="study-card-section">
              <div className="study-answer-row">
                <h3>Respuesta</h3>
                <button
                  className="secondary-button small"
                  onClick={() => setShowAnswer((prev) => !prev)}
                >
                  {showAnswer ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <p className={showAnswer ? "" : "hidden-answer"}>
                {currentCard.answer}
              </p>
            </div>

            {currentCard.options?.length > 0 && (
              <div className="study-card-section">
                <h3>Opciones</h3>
                <ul className="options-list">
                  {currentCard.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="study-panel-actions">
              <button
                className="primary-button"
                onClick={goPrevious}
                disabled={currentIndex === 0}
              >
                Anterior
              </button>
              <button
                className="primary-button"
                onClick={goNext}
                disabled={currentIndex === cards.length - 1}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>No hay tarjetas para estudiar.</p>
      )}
    </section>
  );
};

export default FlashcardStudyPanel;
