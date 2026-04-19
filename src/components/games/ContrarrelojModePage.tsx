import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../../hooks/useCategories";
import {
  gamesApi,
  SurvivalQuestion,
  QuizSurvivalQuestion,
  TFSurvivalQuestion,
} from "../../api/games";
import "./ContrarrelojModePage.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_TIME = 60;
const CORRECT_BONUS = 3;
const WRONG_PENALTY = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

type CRPhase = "setup" | "loading" | "playing" | "feedback" | "gameover";
type AnswerState = "idle" | "correct" | "wrong";

// ─── Component ────────────────────────────────────────────────────────────────

const ContrarrelojModePage: React.FC = () => {
  const { user } = useAuth();
  const { categories } = useCategories();

  const [phase, setPhase] = useState<CRPhase>("setup");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [questions, setQuestions] = useState<SurvivalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bestKey = user ? `cr_best_${user.id}` : "cr_best";
  const [personalBest, setPersonalBest] = useState<number>(() => {
    const v = localStorage.getItem(bestKey);
    return v ? parseInt(v, 10) : 0;
  });

  const currentQuestion = questions[currentIndex] ?? null;

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase("gameover");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // ── Load pool ──────────────────────────────────────────────────────────────
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
          "No hay preguntas disponibles. Crea algunos quizzes o conjuntos de verdadero/falso primero.",
        );
        setPhase("setup");
        return;
      }
      setQuestions(pool);
      setCurrentIndex(0);
      setTimeLeft(INITIAL_TIME);
      setScore(0);
      setAnswerState("idle");
      setSelectedAnswer(null);
      setIsNewBest(false);
      setPhase("playing");
    } catch {
      setLoadError("Error al cargar las preguntas. Inténtalo de nuevo.");
      setPhase("setup");
    }
  }, [selectedCategory]);

  // ── Answer handler ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string | boolean) => {
      if (answerState !== "idle" || !currentQuestion || phase !== "playing")
        return;

      const isCorrect =
        currentQuestion.type === "quiz"
          ? answer === (currentQuestion as QuizSurvivalQuestion).correct_answer
          : answer === (currentQuestion as TFSurvivalQuestion).is_true;

      setSelectedAnswer(answer);
      setAnswerState(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        setScore((s) => s + 1);
        setTimeLeft((t) => Math.min(t + CORRECT_BONUS, 99));
      } else {
        setTimeLeft((t) => Math.max(t - WRONG_PENALTY, 0));
      }

      setPhase("feedback");
      setTimeout(() => {
        setCurrentIndex((i) => {
          const next = i + 1;
          return next >= questions.length ? 0 : next;
        });
        setAnswerState("idle");
        setSelectedAnswer(null);
        setPhase("playing");
      }, 600);
    },
    [answerState, currentQuestion, phase, questions.length],
  );

  // ── Keyboard (T/F) ─────────────────────────────────────────────────────────
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

  // ── Save best on gameover ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "gameover") return;
    if (score > personalBest) {
      localStorage.setItem(bestKey, String(score));
      setPersonalBest(score);
      setIsNewBest(true);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer color ────────────────────────────────────────────────────────────
  const timerColor =
    timeLeft > 20 ? "#22c55e" : timeLeft > 10 ? "#f59e0b" : "#EE4266";
  const timerPct = Math.min((timeLeft / INITIAL_TIME) * 100, 100);

  // ── Option display helpers ─────────────────────────────────────────────────
  const getOptionState = (opt: string) => {
    if (answerState === "idle") return "idle";
    const q = currentQuestion as QuizSurvivalQuestion;
    if (opt === q.correct_answer) return "correct";
    if (opt === selectedAnswer) return "wrong";
    return "dimmed";
  };

  const getTFState = (val: boolean) => {
    if (answerState === "idle") return "idle";
    const q = currentQuestion as TFSurvivalQuestion;
    if (val === q.is_true) return "correct";
    if (val === selectedAnswer) return "wrong";
    return "dimmed";
  };

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === "setup" || phase === "loading") {
    return (
      <div className="cr-page">
        <div className="cr-setup-card">
          <div className="cr-setup-icon">⏱️</div>
          <h1 className="cr-setup-title">Modo Contrarreloj</h1>
          <p className="cr-setup-subtitle">
            60 segundos en el reloj. Cada acierto suma +{CORRECT_BONUS}s, cada
            fallo resta -{WRONG_PENALTY}s. ¿Cuántas respuestas correctas puedes
            acumular?
          </p>

          <div className="cr-setup-rules">
            <div className="cr-rule">
              <span className="cr-rule-pill cr-rule-pill--green">
                +{CORRECT_BONUS}s
              </span>
              <span>Por cada respuesta correcta</span>
            </div>
            <div className="cr-rule">
              <span className="cr-rule-pill cr-rule-pill--red">
                -{WRONG_PENALTY}s
              </span>
              <span>Por cada respuesta incorrecta</span>
            </div>
          </div>

          <div className="cr-setup-field">
            <label className="cr-setup-label">Categoría</label>
            <select
              className="cr-setup-select"
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

          {loadError && <p className="cr-setup-error">{loadError}</p>}

          {personalBest > 0 && (
            <div className="cr-setup-best">
              <span>
                🏆 Récord: <strong>{personalBest} aciertos</strong>
              </span>
            </div>
          )}

          <button
            className="cr-start-btn"
            onClick={startGame}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? (
              <span className="cr-spinner" />
            ) : (
              "⚡ Comenzar"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── GAMEOVER ───────────────────────────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div className="cr-page cr-page--gameover">
        <div className="cr-gameover-card">
          <div className="cr-gameover-icon">⌛</div>
          <h2 className="cr-gameover-title">¡Tiempo!</h2>
          {isNewBest && (
            <div className="cr-new-best">🏆 ¡Nuevo récord personal!</div>
          )}
          <div className="cr-gameover-stats">
            <div className="cr-stat">
              <span className="cr-stat-label">Aciertos</span>
              <span className="cr-stat-value">{score}</span>
            </div>
            <div className="cr-stat-divider" />
            <div className="cr-stat">
              <span className="cr-stat-label">Récord</span>
              <span className="cr-stat-value">{personalBest}</span>
            </div>
          </div>
          <div className="cr-gameover-actions">
            <button className="cr-retry-btn" onClick={startGame}>
              🔄 Intentar de nuevo
            </button>
            <button className="cr-exit-btn" onClick={() => setPhase("setup")}>
              Cambiar ajustes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <div className="cr-page cr-page--playing">
      {/* Top bar */}
      <div className="cr-topbar">
        <div className="cr-score-badge">✓ {score}</div>

        {/* Timer */}
        <div className="cr-timer-wrap">
          <div
            className="cr-timer-bar"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
          <span className="cr-timer-text" style={{ color: timerColor }}>
            {timeLeft}s
          </span>
        </div>

        <button
          className="cr-quit-btn"
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase("setup");
          }}
          title="Abandonar"
        >
          ✕
        </button>
      </div>

      {/* Feedback flash */}
      {answerState !== "idle" && (
        <div className={`cr-feedback-flash cr-feedback-flash--${answerState}`}>
          {answerState === "correct"
            ? `+${CORRECT_BONUS}s`
            : `-${WRONG_PENALTY}s`}
        </div>
      )}

      {/* Question */}
      <div className="cr-question-card">
        <div className="cr-question-type">
          {currentQuestion.type === "quiz" ? "Quiz" : "Verdadero o Falso"}
        </div>
        <p className="cr-question-text">
          {currentQuestion.type === "quiz"
            ? (currentQuestion as QuizSurvivalQuestion).question
            : (currentQuestion as TFSurvivalQuestion).statement}
        </p>

        {currentQuestion.type === "quiz" && (
          <div className="cr-options">
            {(currentQuestion as QuizSurvivalQuestion).options.map((opt, i) => {
              const state = getOptionState(opt);
              return (
                <button
                  key={i}
                  className={`cr-option cr-option--${state}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={answerState !== "idle"}
                >
                  <span className="cr-option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="cr-option-text">{opt}</span>
                  {state === "correct" && (
                    <span className="cr-option-mark">✓</span>
                  )}
                  {state === "wrong" && (
                    <span className="cr-option-mark">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === "true-false" && (
          <div className="cr-tf-options">
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
                  className={`cr-tf-btn cr-tf-btn--${state}`}
                  onClick={() => handleAnswer(value)}
                  disabled={answerState !== "idle"}
                >
                  <span className="cr-tf-label">{label}</span>
                  <span className="cr-tf-key">[{key}]</span>
                  {state === "correct" && <span className="cr-tf-mark">✓</span>}
                  {state === "wrong" && <span className="cr-tf-mark">✗</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContrarrelojModePage;
