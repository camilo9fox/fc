import React, { useState } from "react";
import { DraftTFState } from "../../types/trueFalse.types";
import { StudyScoreResult } from "../shared/StudyScoreResult";
import "./TrueFalsePage.css";

interface DraftTFStudySessionProps {
  draft: DraftTFState;
  onClose: () => void;
  badge?: string;
  returnLabel?: string;
  onComplete?: (score: number, total: number) => void;
}

const DraftTFStudySession: React.FC<DraftTFStudySessionProps> = ({
  draft,
  onClose,
  badge = "Borrador",
  returnLabel = "Volver al borrador",
  onComplete,
}) => {
  const questions = draft.questions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handleAnswer = (answer: boolean) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === current.is_true) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      // score state is already updated by handleAnswer (separate user interaction)
      onComplete?.(score, questions.length);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <StudyScoreResult
        score={score}
        total={questions.length}
        title={draft.title}
        itemLabel="respuestas"
        returnLabel={returnLabel}
        onRetry={handleRestart}
        onClose={onClose}
      />
    );
  }

  const isCorrect = selected !== null && selected === current.is_true;
  const showFeedback = selected !== null;

  return (
    <div className="dtf-overlay">
      <header className="dtf-header">
        <div className="dtf-header-left">
          {badge && <span className="dtf-draft-label">{badge}</span>}
          <h2 className="dtf-title">{draft.title}</h2>
        </div>
        <div className="dtf-header-right">
          <span className="dtf-counter">
            {index + 1} / {questions.length}
          </span>
          <button
            className="dtf-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="dtf-progress-bar">
        <div
          className="dtf-progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="dtf-body">
        <div className="dtf-card" key={index}>
          <p className="dtf-question-num">Enunciado {index + 1}</p>
          <p className="dtf-statement-text">{current.statement}</p>

          {!showFeedback && (
            <div className="dtf-answer-row">
              <button
                className="dtf-btn-true"
                onClick={() => handleAnswer(true)}
              >
                ✓ Verdadero
              </button>
              <button
                className="dtf-btn-false"
                onClick={() => handleAnswer(false)}
              >
                ✗ Falso
              </button>
            </div>
          )}

          {showFeedback && (
            <>
              <div
                className={`dtf-feedback ${isCorrect ? "correct" : "wrong"}`}
              >
                <span className="dtf-feedback-icon">
                  {isCorrect ? "✓" : "✗"}
                </span>
                <span>
                  {isCorrect
                    ? "¡Correcto!"
                    : `Incorrecto — era ${current.is_true ? "Verdadero" : "Falso"}`}
                </span>
              </div>

              {current.explanation && (
                <div className="dtf-explanation">
                  <strong>Explicación:</strong> {current.explanation}
                </div>
              )}

              <button className="dtf-next-btn" onClick={handleNext}>
                {index + 1 >= questions.length
                  ? "Ver resultado →"
                  : "Siguiente →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftTFStudySession;
