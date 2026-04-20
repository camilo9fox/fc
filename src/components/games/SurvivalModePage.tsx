import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../../hooks/useCategories";
import {
  gamesApi,
  SurvivalQuestion,
  QuizSurvivalQuestion,
  TFSurvivalQuestion,
} from "../../api/games";
import { attemptsApi } from "../../api/attempts";
import "./SurvivalModePage.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "setup" | "loading" | "playing" | "feedback" | "gameover";
type AnswerState = "idle" | "correct" | "wrong";

interface FeedbackOption {
  text: string;
  state: "correct" | "wrong" | "dimmed" | "idle";
}

// ─── Component ────────────────────────────────────────────────────────────────

const SurvivalModePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [questions, setQuestions] = useState<SurvivalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(0); // increments on each correct answer
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  // Personal best — loaded from DB, localStorage used as instant cache
  const bestKey = user ? `survival_best_${user.id}` : "survival_best";
  const [personalBest, setPersonalBest] = useState<number>(() => {
    const stored = localStorage.getItem(bestKey);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [isNewBest, setIsNewBest] = useState(false);
  // Track whether the score for the current game over was already saved
  const scoreSavedRef = useRef(false);

  const currentQuestion = questions[currentIndex] ?? null;

  // ── Load personal best from DB on mount / category change ──────────────────
  useEffect(() => {
    if (!user) return;
    attemptsApi
      .getGameBest({
        gameType: "survival",
        categoryId: selectedCategory || null,
      })
      .then((res) => {
        if (res.score > personalBest) {
          setPersonalBest(res.score);
          localStorage.setItem(bestKey, String(res.score));
        }
      })
      .catch(() => {
        /* silently fall back to localStorage */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedCategory]);

  // ── Load pool ──────────────────────erick────────────────────────────────────────
  const startGame = useCallback(async () => {
    setPhase("loading");
    setLoadError(null);
    try {
      const params = selectedCategory ? { categoryId: selectedCategory } : {};
      const { questions: pool } = await gamesApi.getSurvivalPool({
        ...params,
        limit: 100,
      });
      if (pool.length === 0) {
        setLoadError(
          "No hay preguntas disponibles para esta categoría. Crea algunos quizzes o conjuntos de verdadero/falso primero.",
        );
        setPhase("setup");
        return;
      }
      setQuestions(pool);
      setCurrentIndex(0);
      setRound(0);
      setAnswerState("idle");
      setSelectedAnswer(null);
      setIsNewBest(false);
      scoreSavedRef.current = false;
      setPhase("playing");
    } catch {
      setLoadError("Error al cargar las preguntas. Inténtalo de nuevo.");
      setPhase("setup");
    }
  }, [selectedCategory]);

  // ── Answer handlers ────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string | boolean) => {
      if (answerState !== "idle" || !currentQuestion) return;

      const isCorrect =
        currentQuestion.type === "quiz"
          ? answer === (currentQuestion as QuizSurvivalQuestion).correct_answer
          : answer === (currentQuestion as TFSurvivalQuestion).is_true;

      setSelectedAnswer(answer);

      if (isCorrect) {
        setAnswerState("correct");
        setPhase("feedback");
        setTimeout(() => {
          const nextIndex = currentIndex + 1;
          if (nextIndex >= questions.length) {
            // Pool exhausted — re-shuffle by starting over (rare, but handle it)
            setCurrentIndex(0);
          } else {
            setCurrentIndex(nextIndex);
          }
          setRound((r) => r + 1);
          setAnswerState("idle");
          setSelectedAnswer(null);
          setPhase("playing");
        }, 700);
      } else {
        setAnswerState("wrong");
        setTimeout(() => {
          const isNew = round > personalBest;
          if (isNew) {
            localStorage.setItem(bestKey, String(round));
            setPersonalBest(round);
            setIsNewBest(true);
          }
          setPhase("gameover");
          // Persist score to DB (fire-and-forget, deduplicated per game session)
          if (!scoreSavedRef.current && round > 0) {
            scoreSavedRef.current = true;
            attemptsApi
              .recordGame({
                game_type: "survival",
                category_id: selectedCategory || null,
                score: round,
              })
              .catch(() => {
                /* ignore network errors — localStorage already saved */
              });
          }
        }, 900);
      }
    },
    [
      answerState,
      currentQuestion,
      currentIndex,
      questions.length,
      round,
      personalBest,
      bestKey,
      selectedCategory,
    ],
  );

  // ── Keyboard support (TF: T = true, F = false) ────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || !currentQuestion) return;
    const onKey = (e: KeyboardEvent) => {
      if (currentQuestion.type === "true-false") {
        if (e.key === "t" || e.key === "T") handleAnswer(true);
        if (e.key === "f" || e.key === "F") handleAnswer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, currentQuestion, handleAnswer]);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const getOptionState = (option: string): FeedbackOption["state"] => {
    if (answerState === "idle") return "idle";
    const q = currentQuestion as QuizSurvivalQuestion;
    if (option === q.correct_answer) return "correct";
    if (option === selectedAnswer) return "wrong";
    return "dimmed";
  };

  const getTFState = (value: boolean): FeedbackOption["state"] => {
    if (answerState === "idle") return "idle";
    const q = currentQuestion as TFSurvivalQuestion;
    if (value === q.is_true) return "correct";
    if (value === selectedAnswer) return "wrong";
    return "dimmed";
  };

  // ── SETUP PHASE ─────────────────────────────────────────────────────────────
  if (phase === "setup" || phase === "loading") {
    return (
      <div className="srv-page">
        <div className="srv-setup-card">
          <div className="srv-setup-icon">💀</div>
          <h1 className="srv-setup-title">Modo Supervivencia</h1>
          <p className="srv-setup-subtitle">
            Un fallo y todo se acaba. ¿Cuántas rondas aguantas?
          </p>

          <div className="srv-setup-rules">
            <div className="srv-rule">
              <span className="srv-rule-icon">❤️</span>
              <span>Una sola vida</span>
            </div>
            <div className="srv-rule">
              <span className="srv-rule-icon">🔀</span>
              <span>Preguntas aleatorias de quizzes y verdadero/falso</span>
            </div>
            <div className="srv-rule">
              <span className="srv-rule-icon">🏆</span>
              <span>Tu récord personal se guarda automáticamente</span>
            </div>
          </div>

          <div className="srv-setup-field">
            <label className="srv-setup-label">Categoría</label>
            <select
              className="srv-setup-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={phase === "loading"}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {loadError && <p className="srv-setup-error">{loadError}</p>}

          <div className="srv-setup-best">
            <span className="srv-best-label">Tu récord:</span>
            <span className="srv-best-value">
              {personalBest > 0 ? `${personalBest} rondas` : "Sin récord aún"}
            </span>
          </div>

          <button
            className="srv-start-btn"
            onClick={startGame}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? (
              <span className="srv-spinner" />
            ) : (
              "⚡ Comenzar"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── GAMEOVER PHASE ──────────────────────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div className="srv-page srv-page--gameover">
        <div className="srv-gameover-card">
          <div className="srv-gameover-icon">💔</div>
          <h2 className="srv-gameover-title">¡Juego terminado!</h2>
          <p className="srv-gameover-reached">
            Llegaste a la ronda <strong>{round}</strong>
          </p>
          {isNewBest && (
            <div className="srv-new-best">🏆 ¡Nuevo récord personal!</div>
          )}
          <div className="srv-gameover-stats">
            <div className="srv-stat">
              <span className="srv-stat-label">Esta partida</span>
              <span className="srv-stat-value">{round}</span>
            </div>
            <div className="srv-stat-divider" />
            <div className="srv-stat">
              <span className="srv-stat-label">Récord</span>
              <span className="srv-stat-value">{personalBest}</span>
            </div>
          </div>
          <div className="srv-gameover-actions">
            <button className="srv-retry-btn" onClick={startGame}>
              🔄 Intentar de nuevo
            </button>
            <button className="srv-exit-btn" onClick={() => setPhase("setup")}>
              Cambiar ajustes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING / FEEDBACK PHASE ─────────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <div className="srv-page srv-page--playing">
      {/* Top bar */}
      <div className="srv-topbar">
        <div className="srv-life">
          <span className="srv-heart" aria-label="vida">
            ❤️
          </span>
          <span className="srv-life-label">1 vida</span>
        </div>
        <div className="srv-round-badge">Ronda {round + 1}</div>
        <button
          className="srv-quit-btn"
          onClick={() => setPhase("setup")}
          title="Abandonar partida"
        >
          ✕
        </button>
      </div>

      {/* Question card */}
      <div className="srv-question-card">
        <div className="srv-question-type-label">
          {currentQuestion.type === "quiz" ? "Quiz" : "Verdadero o Falso"}
        </div>

        <p className="srv-question-text">
          {currentQuestion.type === "quiz"
            ? (currentQuestion as QuizSurvivalQuestion).question
            : (currentQuestion as TFSurvivalQuestion).statement}
        </p>

        {/* Quiz options */}
        {currentQuestion.type === "quiz" && (
          <div className="srv-options">
            {(currentQuestion as QuizSurvivalQuestion).options.map((opt, i) => {
              const state = getOptionState(opt);
              return (
                <button
                  key={i}
                  className={`srv-option srv-option--${state}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={answerState !== "idle"}
                >
                  <span className="srv-option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="srv-option-text">{opt}</span>
                  {state === "correct" && (
                    <span className="srv-option-indicator">✓</span>
                  )}
                  {state === "wrong" && (
                    <span className="srv-option-indicator">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* True/False options */}
        {currentQuestion.type === "true-false" && (
          <div className="srv-tf-options">
            {(
              [
                { label: "Verdadero", value: true, key: "T" },
                { label: "Falso", value: false, key: "F" },
              ] as { label: string; value: boolean; key: string }[]
            ).map(({ label, value, key }) => {
              const state = getTFState(value);
              return (
                <button
                  key={label}
                  className={`srv-tf-btn srv-tf-btn--${state}`}
                  onClick={() => handleAnswer(value)}
                  disabled={answerState !== "idle"}
                >
                  <span className="srv-tf-label">{label}</span>
                  <span className="srv-tf-key">[{key}]</span>
                  {state === "correct" && (
                    <span className="srv-tf-indicator">✓</span>
                  )}
                  {state === "wrong" && (
                    <span className="srv-tf-indicator">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Explanation (shown briefly after wrong answer before gameover) */}
      {answerState === "wrong" &&
        currentQuestion.type === "quiz" &&
        (currentQuestion as QuizSurvivalQuestion).explanation && (
          <div className="srv-explanation">
            <span className="srv-explanation-label">Explicación:</span>{" "}
            {(currentQuestion as QuizSurvivalQuestion).explanation}
          </div>
        )}
      {answerState === "wrong" &&
        currentQuestion.type === "true-false" &&
        (currentQuestion as TFSurvivalQuestion).explanation && (
          <div className="srv-explanation">
            <span className="srv-explanation-label">Explicación:</span>{" "}
            {(currentQuestion as TFSurvivalQuestion).explanation}
          </div>
        )}
    </div>
  );
};

export default SurvivalModePage;
