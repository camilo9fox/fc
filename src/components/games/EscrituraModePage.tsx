import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../../hooks/useCategories";
import { flashCardsApi, FlashCard } from "../../api/flashcards";
import "./EscrituraModePage.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type WRTPhase = "setup" | "loading" | "writing" | "reveal" | "done";

type CardResult = "known" | "unknown";

interface CardState {
  card: FlashCard;
  result: CardResult | null;
}

const LIMIT_OPTIONS = [10, 20, 0] as const; // 0 = all

// ─── Component ────────────────────────────────────────────────────────────────

const EscrituraModePage: React.FC = () => {
  const { user } = useAuth();
  const { categories } = useCategories();

  const [phase, setPhase] = useState<WRTPhase>("setup");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [limitChoice, setLimitChoice] = useState<number>(20);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [deck, setDeck] = useState<CardState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const bestKey = user ? `wrt_best_streak_${user.id}` : "wrt_best_streak";
  const [personalBest, setPersonalBest] = useState<number>(() => {
    const v = localStorage.getItem(bestKey);
    return v ? parseInt(v, 10) : 0;
  });

  const currentCardState = deck[currentIdx] ?? null;
  const knownCount = deck.filter((c) => c.result === "known").length;
  const unknownCount = deck.filter((c) => c.result === "unknown").length;

  // ── Load cards ─────────────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    setPhase("loading");
    setLoadError(null);
    try {
      const params: Record<string, unknown> = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (limitChoice > 0) params.limit = limitChoice;
      else params.limit = 500;

      const { flashcards } = await flashCardsApi.getFlashCards(
        params as Parameters<typeof flashCardsApi.getFlashCards>[0],
      );

      if (flashcards.length === 0) {
        setLoadError("No hay flashcards disponibles. Crea algunas primero.");
        setPhase("setup");
        return;
      }

      // Shuffle
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      const limited =
        limitChoice > 0 ? shuffled.slice(0, limitChoice) : shuffled;

      setDeck(limited.map((card) => ({ card, result: null })));
      setCurrentIdx(0);
      setUserInput("");
      setStreak(0);
      setMaxStreak(0);
      setIsNewBest(false);
      setPhase("writing");
    } catch {
      setLoadError("Error al cargar las flashcards. Inténtalo de nuevo.");
      setPhase("setup");
    }
  }, [selectedCategory, limitChoice]);

  // ── Self-judge ─────────────────────────────────────────────────────────────
  const judge = useCallback(
    (result: CardResult) => {
      setDeck((prev) => {
        const next = [...prev];
        next[currentIdx] = { ...next[currentIdx], result };
        return next;
      });

      const newStreak = result === "known" ? streak + 1 : 0;
      setStreak(newStreak);
      const newMax = Math.max(maxStreak, newStreak);
      setMaxStreak(newMax);

      if (currentIdx + 1 >= deck.length) {
        // End of deck — save best streak
        if (newMax > personalBest) {
          localStorage.setItem(bestKey, String(newMax));
          setPersonalBest(newMax);
          setIsNewBest(true);
        }
        setPhase("done");
      } else {
        setCurrentIdx((i) => i + 1);
        setUserInput("");
        setPhase("writing");
      }
    },
    [currentIdx, streak, maxStreak, deck.length, personalBest, bestKey],
  );

  // ── Reveal ─────────────────────────────────────────────────────────────────
  const reveal = useCallback(() => {
    if (phase === "writing") setPhase("reveal");
  }, [phase]);

  // ── Keyboard shortcut: Enter to reveal ────────────────────────────────────
  useEffect(() => {
    if (phase !== "writing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        reveal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, reveal]);

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === "setup" || phase === "loading") {
    return (
      <div className="wrt-page">
        <div className="wrt-setup-card">
          <div className="wrt-setup-icon">✍️</div>
          <h1 className="wrt-setup-title">Modo Escritura</h1>
          <p className="wrt-setup-subtitle">
            Lee la pregunta, escribe tu respuesta y comprueba si la sabías.
            Entrena la memoria activa al estilo Anki.
          </p>

          <div className="wrt-how-works">
            <div className="wrt-step">
              <span className="wrt-step-num">1</span>
              <span>Lee la pregunta y escribe tu respuesta</span>
            </div>
            <div className="wrt-step">
              <span className="wrt-step-num">2</span>
              <span>
                Pulsa <kbd>Ver respuesta</kbd> para revelar
              </span>
            </div>
            <div className="wrt-step">
              <span className="wrt-step-num">3</span>
              <span>Juzga tú mismo: ✅ lo sabía · ❌ no lo sabía</span>
            </div>
          </div>

          <div className="wrt-setup-fields">
            <div className="wrt-setup-field">
              <label className="wrt-setup-label">Categoría</label>
              <select
                className="wrt-setup-select"
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

            <div className="wrt-setup-field">
              <label className="wrt-setup-label">Número de tarjetas</label>
              <div className="wrt-limit-btns">
                {LIMIT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`wrt-limit-btn${limitChoice === opt ? " wrt-limit-btn--active" : ""}`}
                    onClick={() => setLimitChoice(opt)}
                    disabled={phase === "loading"}
                  >
                    {opt === 0 ? "Todas" : opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadError && <p className="wrt-setup-error">{loadError}</p>}

          {personalBest > 0 && (
            <div className="wrt-setup-best">
              <span>
                🔥 Mejor racha: <strong>{personalBest} seguidas</strong>
              </span>
            </div>
          )}

          <button
            className="wrt-start-btn"
            onClick={startGame}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? (
              <span className="wrt-spinner" />
            ) : (
              "📝 Comenzar"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const total = deck.length;
    const pct = total > 0 ? Math.round((knownCount / total) * 100) : 0;
    return (
      <div className="wrt-page wrt-page--done">
        <div className="wrt-done-card">
          <div className="wrt-done-icon">
            {pct >= 80 ? "🌟" : pct >= 50 ? "👍" : "📖"}
          </div>
          <h2 className="wrt-done-title">¡Ronda completada!</h2>
          {isNewBest && (
            <div className="wrt-new-best">
              🔥 ¡Nueva racha récord: {maxStreak} seguidas!
            </div>
          )}

          <div className="wrt-done-stats">
            <div className="wrt-dstat">
              <span className="wrt-dstat-label">Correctas</span>
              <span className="wrt-dstat-value wrt-dstat-value--green">
                {knownCount}
              </span>
            </div>
            <div className="wrt-dstat-divider" />
            <div className="wrt-dstat">
              <span className="wrt-dstat-label">Falladas</span>
              <span className="wrt-dstat-value wrt-dstat-value--red">
                {unknownCount}
              </span>
            </div>
            <div className="wrt-dstat-divider" />
            <div className="wrt-dstat">
              <span className="wrt-dstat-label">Racha</span>
              <span className="wrt-dstat-value">{maxStreak}</span>
            </div>
          </div>

          <div className="wrt-pct-bar-wrap">
            <div className="wrt-pct-bar" style={{ width: `${pct}%` }} />
          </div>
          <p className="wrt-pct-label">{pct}% respondidas correctamente</p>

          <div className="wrt-done-actions">
            <button className="wrt-retry-btn" onClick={startGame}>
              🔄 Otra ronda
            </button>
            <button className="wrt-exit-btn" onClick={() => setPhase("setup")}>
              Cambiar ajustes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── WRITING / REVEAL ───────────────────────────────────────────────────────
  if (!currentCardState) return null;
  const { card } = currentCardState;
  const progress = deck.length > 0 ? (currentIdx / deck.length) * 100 : 0;

  return (
    <div className="wrt-page wrt-page--playing">
      {/* Progress bar */}
      <div className="wrt-progress-wrap">
        <div className="wrt-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Top bar */}
      <div className="wrt-topbar">
        <div className="wrt-topbar-info">
          <span className="wrt-card-counter">
            {currentIdx + 1} / {deck.length}
          </span>
          {streak >= 2 && <span className="wrt-streak-badge">🔥 {streak}</span>}
        </div>
        <div className="wrt-topbar-scores">
          <span className="wrt-score-known">✓ {knownCount}</span>
          <span className="wrt-score-unknown">✗ {unknownCount}</span>
        </div>
        <button
          className="wrt-quit-btn"
          onClick={() => setPhase("setup")}
          title="Salir"
        >
          ✕
        </button>
      </div>

      {/* Card */}
      <div className="wrt-card-area">
        {/* Question */}
        <div className="wrt-question-box">
          <div className="wrt-question-label">Pregunta</div>
          <p className="wrt-question-text">{card.question}</p>
        </div>

        {/* User input */}
        <div className="wrt-input-box">
          <label className="wrt-input-label">Tu respuesta</label>
          <textarea
            className="wrt-textarea"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Escribe aquí tu respuesta…"
            rows={3}
            disabled={phase === "reveal"}
            autoFocus
          />
        </div>

        {phase === "writing" && (
          <button className="wrt-reveal-btn" onClick={reveal}>
            Ver respuesta
          </button>
        )}

        {/* Reveal panel */}
        {phase === "reveal" && (
          <div className="wrt-reveal-panel">
            <div className="wrt-answer-label">Respuesta correcta</div>
            <p className="wrt-answer-text">{card.answer}</p>

            <div className="wrt-judge-btns">
              <button
                className="wrt-judge-btn wrt-judge-btn--known"
                onClick={() => judge("known")}
              >
                <span className="wrt-judge-icon">✅</span>
                <span className="wrt-judge-label">Lo sabía</span>
              </button>
              <button
                className="wrt-judge-btn wrt-judge-btn--unknown"
                onClick={() => judge("unknown")}
              >
                <span className="wrt-judge-icon">❌</span>
                <span className="wrt-judge-label">No lo sabía</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrituraModePage;
