import React, { useState } from "react";
import { DraftQuizState } from "../../types/quiz.types";
import { StudyScoreResult } from "../shared/StudyScoreResult";
import "./QuizzesPage.css";

interface DraftQuizStudySessionProps {
  draft: DraftQuizState;
  onClose: () => void;
  badge?: string;
  returnLabel?: string;
}

const DraftQuizStudySession: React.FC<DraftQuizStudySessionProps> = ({
  draft,
  onClose,
  badge = "Borrador",
  returnLabel = "Volver al borrador",
}) => {
  const questions = draft.questions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handleAnswer = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === current.correct_answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
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
        itemLabel="preguntas"
        returnLabel={returnLabel}
        onRetry={handleRestart}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="dqs-overlay">
      <header className="dqs-header">
        <div className="dqs-header-left">
          {badge && <span className="dqs-draft-label">{badge}</span>}
          <h2 className="dqs-title">{draft.title}</h2>
        </div>
        <div className="dqs-header-right">
          <span className="dqs-counter">
            {index + 1} / {questions.length}
          </span>
          <button
            className="dqs-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="dqs-progress-bar">
        <div
          className="dqs-progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="dqs-body">
        <div className="dqs-card" key={index}>
          <p className="dqs-question-num">Pregunta {index + 1}</p>
          <p className="dqs-question-text">{current.question}</p>

          <div className="dqs-options">
            {current.options.map((opt) => {
              let cls = "dqs-option";
              if (selected !== null) {
                if (opt === current.correct_answer) cls += " correct";
                else if (opt === selected) cls += " wrong";
                else cls += " dimmed";
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && current.explanation && (
            <div className="dqs-explanation">
              <strong>Explicación:</strong> {current.explanation}
            </div>
          )}

          {selected !== null && (
            <button className="dqs-next-btn" onClick={handleNext}>
              {index + 1 >= questions.length
                ? "Ver resultado →"
                : "Siguiente →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftQuizStudySession;
