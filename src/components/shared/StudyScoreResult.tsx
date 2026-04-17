import React from "react";
import {
  SCORE_EXCELLENT_PCT,
  SCORE_GOOD_PCT,
  SCORE_OK_PCT,
  SCORE_WARN_PCT,
  SCORE_EMOJI_EXCELLENT,
  SCORE_EMOJI_OK,
  SCORE_EMOJI_STUDY,
  SCORE_COLOR_GREEN,
  SCORE_COLOR_AMBER,
  SCORE_COLOR_RED,
} from "../../constants";
import "./StudyScoreResult.css";

interface StudyScoreResultProps {
  score: number;
  total: number;
  title: string;
  itemLabel: string;
  returnLabel: string;
  onRetry: () => void;
  onClose: () => void;
}

export const StudyScoreResult: React.FC<StudyScoreResultProps> = ({
  score,
  total,
  title,
  itemLabel,
  returnLabel,
  onRetry,
  onClose,
}) => {
  const pct = Math.round((score / total) * 100);
  const emoji =
    pct >= SCORE_EXCELLENT_PCT
      ? SCORE_EMOJI_EXCELLENT
      : pct >= SCORE_OK_PCT
        ? SCORE_EMOJI_OK
        : SCORE_EMOJI_STUDY;
  const ringColor =
    pct >= SCORE_GOOD_PCT
      ? SCORE_COLOR_GREEN
      : pct >= SCORE_WARN_PCT
        ? SCORE_COLOR_AMBER
        : SCORE_COLOR_RED;

  return (
    <div className="sr-result">
      <div className="sr-result-card">
        <div className="sr-result-emoji">{emoji}</div>
        <div
          className="sr-score-ring"
          style={
            {
              "--sr-ring-color": ringColor,
              "--sr-pct": `${pct}%`,
            } as React.CSSProperties
          }
        >
          <span className="sr-score-pct">{pct}%</span>
          <span className="sr-score-sub">aciertos</span>
        </div>
        <h2 className="sr-result-title">{title}</h2>
        <p className="sr-result-detail">
          {score} de {total} {itemLabel} correctas
        </p>
        <div className="sr-result-actions">
          <button className="sr-btn-primary" onClick={onRetry}>
            Intentar de nuevo
          </button>
          <button className="sr-btn-secondary" onClick={onClose}>
            {returnLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
