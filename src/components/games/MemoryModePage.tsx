import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../../hooks/useCategories";
import { flashCardsApi, FlashCard } from "../../api/flashcards";
import "./MemoryModePage.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemoryTile {
  uid: string; // unique per tile (cardId + side)
  cardId: string; // shared with its matching pair
  content: string; // question or answer text
  side: "question" | "answer";
  isFlipped: boolean;
  isMatched: boolean;
}

type MemPhase = "setup" | "loading" | "playing" | "win";

const DIFFICULTIES = [
  { key: "facil", label: "Fácil", pairs: 6 },
  { key: "medio", label: "Medio", pairs: 10 },
  { key: "dificil", label: "Difícil", pairs: 16 },
] as const;

type DiffKey = "facil" | "medio" | "dificil";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTiles(cards: FlashCard[]): MemoryTile[] {
  const tiles: MemoryTile[] = [];
  for (const card of cards) {
    tiles.push({
      uid: `${card.id}_q`,
      cardId: card.id,
      content: card.question,
      side: "question",
      isFlipped: false,
      isMatched: false,
    });
    tiles.push({
      uid: `${card.id}_a`,
      cardId: card.id,
      content: card.answer,
      side: "answer",
      isFlipped: false,
      isMatched: false,
    });
  }
  return shuffle(tiles);
}

// ─── Component ────────────────────────────────────────────────────────────────

const MemoryModePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<MemPhase>("setup");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DiffKey>("facil");
  const [tiles, setTiles] = useState<MemoryTile[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const diffConfig = DIFFICULTIES.find((d) => d.key === difficulty)!;

  // Personal best — keyed by difficulty (fewest attempts = better)
  const bestKey = user
    ? `memory_best_${user.id}_${difficulty}`
    : `memory_best_${difficulty}`;
  const [personalBest, setPersonalBest] = useState<number>(() => {
    const v = localStorage.getItem(bestKey);
    return v ? parseInt(v, 10) : 0;
  });

  // Refresh best when difficulty changes
  useEffect(() => {
    const k = user
      ? `memory_best_${user.id}_${difficulty}`
      : `memory_best_${difficulty}`;
    const v = localStorage.getItem(k);
    setPersonalBest(v ? parseInt(v, 10) : 0);
  }, [difficulty, user]);

  // Timer while playing
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Start game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    setPhase("loading");
    setLoadError(null);
    try {
      const params: { categoryId?: string; limit: number } = {
        limit: diffConfig.pairs,
      };
      if (selectedCategory) params.categoryId = selectedCategory;

      const { flashcards } = await flashCardsApi.getFlashCards(params);

      if (flashcards.length < diffConfig.pairs) {
        setLoadError(
          `Necesitas al menos ${diffConfig.pairs} flashcards${selectedCategory ? " en esta categoría" : ""}. Crea más o elige una dificultad menor.`,
        );
        setPhase("setup");
        return;
      }

      const selected = flashcards.slice(0, diffConfig.pairs);
      setTiles(buildTiles(selected));
      setFlippedUids([]);
      setIsChecking(false);
      setAttempts(0);
      setMatchedCount(0);
      setElapsedSecs(0);
      setIsNewBest(false);
      setPhase("playing");
    } catch {
      setLoadError("Error al cargar las flashcards. Inténtalo de nuevo.");
      setPhase("setup");
    }
  }, [selectedCategory, diffConfig.pairs]);

  // ── Flip handler ───────────────────────────────────────────────────────────
  const handleTileClick = useCallback(
    (uid: string) => {
      if (isChecking) return;

      setTiles((prev) => {
        const tile = prev.find((t) => t.uid === uid);
        if (!tile || tile.isFlipped || tile.isMatched) return prev;
        return prev.map((t) => (t.uid === uid ? { ...t, isFlipped: true } : t));
      });

      setFlippedUids((prev) => {
        if (prev.length === 0) return [uid];

        // Second flip
        const firstUid = prev[0];

        setTiles((prevTiles) => {
          const first = prevTiles.find((t) => t.uid === firstUid);
          const second = prevTiles.find((t) => t.uid === uid);
          if (!first || !second) return prevTiles;

          setAttempts((a) => a + 1);

          if (first.cardId === second.cardId && first.uid !== second.uid) {
            // Match!
            const newMatched = prevTiles.filter((t) => t.isMatched).length + 2;
            const totalPairs = diffConfig.pairs;
            const updated = prevTiles.map((t) =>
              t.uid === firstUid || t.uid === uid
                ? { ...t, isMatched: true }
                : t,
            );
            if (newMatched === totalPairs * 2) {
              // Win — check best after state settles
              setTimeout(() => {
                setAttempts((finalAttempts) => {
                  const bk = user
                    ? `memory_best_${user.id}_${difficulty}`
                    : `memory_best_${difficulty}`;
                  const stored = localStorage.getItem(bk);
                  const prev = stored ? parseInt(stored, 10) : 0;
                  const newScore = finalAttempts + 1; // +1 for this attempt
                  if (prev === 0 || newScore < prev) {
                    localStorage.setItem(bk, String(newScore));
                    setPersonalBest(newScore);
                    setIsNewBest(true);
                  }
                  return finalAttempts;
                });
                setPhase("win");
              }, 400);
            }
            setMatchedCount(newMatched / 2);
            return updated;
          } else {
            // No match — flip back after delay
            setIsChecking(true);
            setTimeout(() => {
              setTiles((t) =>
                t.map((tile) =>
                  tile.uid === firstUid || tile.uid === uid
                    ? { ...tile, isFlipped: false }
                    : tile,
                ),
              );
              setIsChecking(false);
            }, 900);
            return prevTiles.map((t) =>
              t.uid === uid ? { ...t, isFlipped: true } : t,
            );
          }
        });

        return []; // reset flipped
      });
    },
    [isChecking, diffConfig.pairs, difficulty, user],
  );

  // ── Format time ────────────────────────────────────────────────────────────
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── SETUP PHASE ─────────────────────────────────────────────────────────────
  if (phase === "setup" || phase === "loading") {
    return (
      <div className="mem-page">
        <div className="mem-setup-card">
          <div className="mem-setup-icon">🃏</div>
          <h1 className="mem-setup-title">Modo Memoria</h1>
          <p className="mem-setup-subtitle">
            Empareja cada pregunta con su respuesta. Menos intentos = mejor
            puntuación.
          </p>

          <div className="mem-setup-field">
            <label className="mem-setup-label">Categoría</label>
            <select
              className="mem-setup-select"
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

          <div className="mem-setup-field">
            <label className="mem-setup-label">Dificultad</label>
            <div className="mem-diff-btns">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.key}
                  className={`mem-diff-btn${difficulty === d.key ? " mem-diff-btn--active" : ""}`}
                  onClick={() => setDifficulty(d.key)}
                  disabled={phase === "loading"}
                >
                  <span className="mem-diff-label">{d.label}</span>
                  <span className="mem-diff-pairs">{d.pairs} parejas</span>
                </button>
              ))}
            </div>
          </div>

          {loadError && <p className="mem-setup-error">{loadError}</p>}

          {personalBest > 0 && (
            <div className="mem-setup-best">
              <span className="mem-best-icon">🏆</span>
              <span>
                Récord en {diffConfig.label}:{" "}
                <strong>{personalBest} intentos</strong>
              </span>
            </div>
          )}

          <button
            className="mem-start-btn"
            onClick={startGame}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? (
              <span className="mem-spinner" />
            ) : (
              "Comenzar"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── WIN PHASE ───────────────────────────────────────────────────────────────
  if (phase === "win") {
    return (
      <div className="mem-page mem-page--win">
        <div className="mem-win-card">
          <div className="mem-win-icon">🎉</div>
          <h2 className="mem-win-title">¡Completado!</h2>
          <p className="mem-win-subtitle">Emparejaste todas las tarjetas</p>
          {isNewBest && (
            <div className="mem-new-best">🏆 ¡Nuevo récord personal!</div>
          )}
          <div className="mem-win-stats">
            <div className="mem-stat">
              <span className="mem-stat-label">Intentos</span>
              <span className="mem-stat-value">{attempts}</span>
            </div>
            <div className="mem-stat-divider" />
            <div className="mem-stat">
              <span className="mem-stat-label">Tiempo</span>
              <span className="mem-stat-value">{formatTime(elapsedSecs)}</span>
            </div>
            <div className="mem-stat-divider" />
            <div className="mem-stat">
              <span className="mem-stat-label">Récord</span>
              <span className="mem-stat-value">
                {personalBest > 0 ? personalBest : attempts}
              </span>
            </div>
          </div>
          <div className="mem-win-actions">
            <button className="mem-retry-btn" onClick={startGame}>
              🔄 Jugar de nuevo
            </button>
            <button className="mem-exit-btn" onClick={() => setPhase("setup")}>
              Cambiar ajustes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING PHASE ──────────────────────────────────────────────────────────
  const totalPairs = diffConfig.pairs;
  const progress = Math.round((matchedCount / totalPairs) * 100);

  return (
    <div className="mem-page mem-page--playing">
      {/* Top bar */}
      <div className="mem-topbar">
        <div className="mem-topbar-stat">
          <span className="mem-topbar-label">Parejas</span>
          <span className="mem-topbar-value">
            {matchedCount}/{totalPairs}
          </span>
        </div>
        <div className="mem-progress-bar">
          <div
            className="mem-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mem-topbar-stat mem-topbar-stat--right">
          <span className="mem-topbar-label">Intentos</span>
          <span className="mem-topbar-value">{attempts}</span>
        </div>
        <button
          className="mem-quit-btn"
          onClick={() => setPhase("setup")}
          title="Abandonar"
        >
          ✕
        </button>
      </div>

      <div className="mem-timer">{formatTime(elapsedSecs)}</div>

      {/* Grid */}
      <div className="mem-grid" data-pairs={totalPairs}>
        {tiles.map((tile) => (
          <button
            key={tile.uid}
            className={`mem-tile${tile.isFlipped || tile.isMatched ? " mem-tile--flipped" : ""}${tile.isMatched ? " mem-tile--matched" : ""}`}
            onClick={() => handleTileClick(tile.uid)}
            disabled={tile.isFlipped || tile.isMatched || isChecking}
            aria-label={tile.isFlipped ? tile.content : "Carta boca abajo"}
          >
            <div className="mem-tile-inner">
              {/* Face down */}
              <div className="mem-tile-front">
                <span className="mem-tile-back-icon">?</span>
              </div>
              {/* Face up */}
              <div className={`mem-tile-back mem-tile-back--${tile.side}`}>
                <span className="mem-tile-side-label">
                  {tile.side === "question" ? "P" : "R"}
                </span>
                <span className="mem-tile-content">{tile.content}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemoryModePage;
