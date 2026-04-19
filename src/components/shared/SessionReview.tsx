import React from "react";
import "./SessionReview.css";

// ─── Quiz wrong question ───────────────────────────────────────────────────────
export interface WrongQuizQuestion {
  type: "quiz";
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  selectedAnswer: string;
}

// ─── TF wrong question ────────────────────────────────────────────────────────
export interface WrongTFQuestion {
  type: "true-false";
  statement: string;
  is_true: boolean;
  explanation?: string;
  selectedAnswer: boolean;
}

export type WrongQuestion = WrongQuizQuestion | WrongTFQuestion;

interface SessionReviewProps {
  wrongQuestions: WrongQuestion[];
  onContinue: () => void;
}

const SessionReview: React.FC<SessionReviewProps> = ({
  wrongQuestions,
  onContinue,
}) => {
  if (wrongQuestions.length === 0) {
    // Shouldn't render, but safety fallback
    onContinue();
    return null;
  }

  return (
    <div className="sr-overlay">
      <div className="sr-container">
        <header className="sr-header">
          <h2 className="sr-title">Repaso de errores</h2>
          <p className="sr-subtitle">
            Fallaste <strong>{wrongQuestions.length}</strong>{" "}
            {wrongQuestions.length === 1 ? "pregunta" : "preguntas"}. Revísalas
            antes de ver tu resultado.
          </p>
        </header>

        <ul className="sr-list">
          {wrongQuestions.map((q, i) => (
            <li key={i} className="sr-item">
              {q.type === "quiz" ? (
                <QuizReviewCard item={q} index={i} />
              ) : (
                <TFReviewCard item={q} index={i} />
              )}
            </li>
          ))}
        </ul>

        <div className="sr-footer">
          <button className="sr-continue-btn" onClick={onContinue}>
            Ver resultado final →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quiz card ────────────────────────────────────────────────────────────────
const QuizReviewCard: React.FC<{
  item: WrongQuizQuestion;
  index: number;
}> = ({ item, index }) => (
  <div className="sr-card">
    <p className="sr-question-label">Pregunta {index + 1}</p>
    <p className="sr-question-text">{item.question}</p>
    <div className="sr-options">
      {item.options.map((opt) => {
        const isCorrect = opt === item.correct_answer;
        const wasSelected = opt === item.selectedAnswer;
        let cls = "sr-opt";
        if (isCorrect) cls += " sr-opt--correct";
        else if (wasSelected) cls += " sr-opt--wrong";
        else cls += " sr-opt--dim";
        return (
          <div key={opt} className={cls}>
            <span className="sr-opt-icon">
              {isCorrect ? "✓" : wasSelected ? "✗" : ""}
            </span>
            {opt}
          </div>
        );
      })}
    </div>
    {item.explanation && (
      <p className="sr-explanation">
        <strong>Explicación:</strong> {item.explanation}
      </p>
    )}
  </div>
);

// ─── TF card ──────────────────────────────────────────────────────────────────
const TFReviewCard: React.FC<{
  item: WrongTFQuestion;
  index: number;
}> = ({ item, index }) => {
  const correctLabel = item.is_true ? "Verdadero" : "Falso";
  const selectedLabel = item.selectedAnswer ? "Verdadero" : "Falso";
  return (
    <div className="sr-card">
      <p className="sr-question-label">Enunciado {index + 1}</p>
      <p className="sr-question-text">{item.statement}</p>
      <div className="sr-tf-row">
        <div className="sr-tf-item sr-tf-item--wrong">
          <span>✗ Respondiste: {selectedLabel}</span>
        </div>
        <div className="sr-tf-item sr-tf-item--correct">
          <span>✓ Correcto: {correctLabel}</span>
        </div>
      </div>
      {item.explanation && (
        <p className="sr-explanation">
          <strong>Explicación:</strong> {item.explanation}
        </p>
      )}
    </div>
  );
};

export default SessionReview;
