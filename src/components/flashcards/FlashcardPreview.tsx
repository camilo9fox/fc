import React from "react";
import "./FlashcardsPage.css";

interface FlashcardPreviewProps {
  flashcard: {
    id?: string;
    question: string;
    answer: string;
    source?: string;
    category?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  onDelete?: () => void;
}

const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({
  flashcard,
  onDelete,
}) => {
  const [showAnswer, setShowAnswer] = React.useState(false);

  return (
    <div className="flashcard-preview">
      <div className="flashcard-header">
        <strong>{flashcard.question}</strong>
        <div className="flashcard-meta">
          {flashcard.category && (
            <span className="flashcard-category">
              {flashcard.category.title}
            </span>
          )}
          {flashcard.source && (
            <span className="flashcard-source">{flashcard.source}</span>
          )}
        </div>
      </div>

      <div className="flashcard-answer-toggle">
        <button
          className="secondary-button small"
          onClick={() => setShowAnswer((prev) => !prev)}
        >
          {showAnswer ? "Ocultar respuesta" : "Mostrar respuesta"}
        </button>
      </div>

      {showAnswer ? (
        <p>{flashcard.answer}</p>
      ) : (
        <p className="hidden-answer">
          Haz clic en el botón para ver la respuesta.
        </p>
      )}

      {onDelete && (
        <button className="secondary-button small" onClick={onDelete}>
          Eliminar
        </button>
      )}
    </div>
  );
};

export default FlashcardPreview;
