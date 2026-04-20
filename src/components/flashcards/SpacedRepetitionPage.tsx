import React, { useEffect, useState } from "react";
import { flashCardsApi, FlashCard } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";
import "./SpacedRepetitionPage.css";

interface ReviewStats {
  due: number;
  newCards: number;
  learned: number;
  total: number;
}

const QUALITY_LABELS: {
  quality: 1 | 2 | 3 | 4;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { quality: 1, label: "No lo sé", emoji: "🔴", color: "#ef4444" },
  { quality: 2, label: "Difícil", emoji: "🟠", color: "#f97316" },
  { quality: 3, label: "Bien", emoji: "🟢", color: "#22c55e" },
  { quality: 4, label: "Fácil", emoji: "💙", color: "#3b82f6" },
];

const SpacedRepetitionPage: React.FC = () => {
  const { categories } = useCategories();

  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);

  const loadData = async (categoryId?: string) => {
    setLoading(true);
    setError(null);
    setSessionComplete(false);
    setCurrentIndex(0);
    setFlipped(false);
    setSessionReviewed(0);
    try {
      const [statsRes, cardsRes] = await Promise.all([
        flashCardsApi.getReviewStats(),
        flashCardsApi.getDueCards({
          limit: 20,
          categoryId: categoryId || undefined,
        }),
      ]);
      setStats(statsRes);
      setCards(cardsRes.flashcards);
      if (cardsRes.flashcards.length === 0) setSessionComplete(true);
    } catch (err: any) {
      setError("No se pudieron cargar las tarjetas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCategory || undefined);
  }, []);

  const currentCard = cards[currentIndex];

  const handleRate = async (quality: 1 | 2 | 3 | 4) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);
    try {
      await flashCardsApi.submitReview(currentCard.id, quality);
      const nextIndex = currentIndex + 1;
      setSessionReviewed((n) => n + 1);
      if (nextIndex >= cards.length) {
        // Refresh stats after session
        const updatedStats = await flashCardsApi.getReviewStats();
        setStats(updatedStats);
        setSessionComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setFlipped(false);
      }
    } catch {
      setError("No se pudo guardar la revisión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    loadData(val || undefined);
  };

  const handleRestart = () => {
    loadData(selectedCategory || undefined);
  };

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-header">
        <div>
          <h1 className="sr-title">Repaso con SM-2</h1>
          <p className="sr-sub">Algoritmo de repetición espaciada</p>
        </div>

        <select
          className="sr-category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={loading}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="sr-stats-bar">
          <div className="sr-stat">
            <span className="sr-stat-value sr-stat-due">{stats.due}</span>
            <span className="sr-stat-label">Por repasar</span>
          </div>
          <div className="sr-stat">
            <span className="sr-stat-value sr-stat-new">{stats.newCards}</span>
            <span className="sr-stat-label">Nuevas</span>
          </div>
          <div className="sr-stat">
            <span className="sr-stat-value sr-stat-learned">
              {stats.learned}
            </span>
            <span className="sr-stat-label">Aprendidas</span>
          </div>
          <div className="sr-stat">
            <span className="sr-stat-value">{stats.total}</span>
            <span className="sr-stat-label">Total</span>
          </div>
        </div>
      )}

      {error && <p className="sr-error">{error}</p>}

      {loading && <div className="sr-loading">Cargando tarjetas...</div>}

      {/* Session complete */}
      {!loading && sessionComplete && (
        <div className="sr-complete">
          <div className="sr-complete-icon">🎉</div>
          <h2>¡Sesión completada!</h2>
          <p>
            Repasaste <strong>{sessionReviewed}</strong> tarjeta
            {sessionReviewed !== 1 ? "s" : ""} en esta sesión.
          </p>
          {stats && stats.due > 0 ? (
            <p className="sr-complete-note">
              Aún tienes <strong>{stats.due}</strong> tarjetas pendientes.
            </p>
          ) : (
            <p className="sr-complete-note">
              ¡Has repasado todo por hoy! Vuelve mañana.
            </p>
          )}
          <button className="sr-btn-primary" onClick={handleRestart}>
            Estudiar más
          </button>
        </div>
      )}

      {/* Review card */}
      {!loading && !sessionComplete && currentCard && (
        <div className="sr-session">
          <div className="sr-progress">
            <div
              className="sr-progress-fill"
              style={{ width: `${(currentIndex / cards.length) * 100}%` }}
            />
          </div>
          <p className="sr-progress-text">
            {currentIndex + 1} / {cards.length}
          </p>

          <div
            className={`sr-card ${flipped ? "sr-card--flipped" : ""}`}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="sr-card-inner">
              <div className="sr-card-front">
                <p className="sr-card-hint">
                  Pregunta · toca para ver respuesta
                </p>
                <p className="sr-card-text">{currentCard.question}</p>
                {currentCard.category && (
                  <span className="sr-card-category">
                    {currentCard.category.title}
                  </span>
                )}
              </div>
              <div className="sr-card-back">
                <p className="sr-card-hint">Respuesta</p>
                <p className="sr-card-text">{currentCard.answer}</p>
                {currentCard.source && (
                  <p className="sr-card-source">Fuente: {currentCard.source}</p>
                )}
              </div>
            </div>
          </div>

          {flipped && (
            <div className="sr-rating-buttons">
              <p className="sr-rating-label">¿Qué tan bien lo recordaste?</p>
              <div className="sr-rating-row">
                {QUALITY_LABELS.map(({ quality, label, emoji, color }) => (
                  <button
                    key={quality}
                    className="sr-rating-btn"
                    style={{ borderColor: color, color }}
                    onClick={() => handleRate(quality)}
                    disabled={submitting}
                  >
                    <span className="sr-rating-emoji">{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!flipped && (
            <button className="sr-flip-hint" onClick={() => setFlipped(true)}>
              Ver respuesta
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !sessionComplete && cards.length === 0 && !error && (
        <div className="sr-empty">
          <div className="sr-empty-icon">✨</div>
          <h2>¡Todo al día!</h2>
          <p>No tienes tarjetas pendientes por repasar hoy.</p>
          <button className="sr-btn-primary" onClick={handleRestart}>
            Recargar
          </button>
        </div>
      )}
    </div>
  );
};

export default SpacedRepetitionPage;
