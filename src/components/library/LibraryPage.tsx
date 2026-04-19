import React, { useState, useEffect, useCallback } from "react";
import { libraryApi, PublicCategory } from "../../api/library";
import CategoryPreviewModal from "./CategoryPreviewModal";
import "./LibraryPage.css";

const LIMIT = 20;

const ContentStat: React.FC<{
  count: number;
  label: string;
  icon: string;
  colorClass: string;
}> = ({ count, label, icon, colorClass }) => (
  <div className={`lib-stat ${colorClass}`}>
    <span className="lib-stat-icon">{icon}</span>
    <div className="lib-stat-info">
      <span className="lib-stat-count">{count}</span>
      <span className="lib-stat-label">{label}</span>
    </div>
  </div>
);

export const LibraryPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [page, setPage] = useState(0);

  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forkingId, setForkingId] = useState<string | null>(null);
  const [forkResults, setForkResults] = useState<
    Record<string, { message: string; isError: boolean }>
  >({});

  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewCategory = previewId
    ? (categories.find((c) => c.id === previewId) ?? null)
    : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryApi.getCategories({
        limit: LIMIT,
        offset: page * LIMIT,
        search,
      });
      setCategories(res.categories || []);
      setTotal(res.total ?? 0);
    } catch {
      setError("Error al cargar la biblioteca.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(0);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(draftSearch.trim());
  };

  const handleFork = async (categoryId: string) => {
    setForkingId(categoryId);
    try {
      const res = await libraryApi.forkCategory(categoryId);
      const parts: string[] = [];
      if (res.flashcardCount) parts.push(`${res.flashcardCount} flashcards`);
      if (res.quizCount)
        parts.push(
          `${res.quizCount} cuestionario${res.quizCount !== 1 ? "s" : ""}`,
        );
      if (res.trueFalseCount)
        parts.push(
          `${res.trueFalseCount} set${res.trueFalseCount !== 1 ? "s" : ""} V/F`,
        );
      setForkResults((prev) => ({
        ...prev,
        [categoryId]: {
          message: `¡Importado! ${parts.join(", ")}`,
          isError: false,
        },
      }));
    } catch {
      setForkResults((prev) => ({
        ...prev,
        [categoryId]: {
          message: "Error al importar. Inténtalo de nuevo.",
          isError: true,
        },
      }));
    } finally {
      setForkingId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const totalContent = categories.reduce(
    (acc, c) => acc + c.flashcardCount + c.quizCount + c.trueFalseCount,
    0,
  );

  return (
    <>
      <div className="lib-page">
        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="lib-hero">
          <div className="lib-hero-glow lib-hero-glow--1" />
          <div className="lib-hero-glow lib-hero-glow--2" />
          <div className="lib-hero-content">
            <span className="lib-hero-badge">COMUNIDAD</span>
            <h1 className="lib-hero-title">Biblioteca pública</h1>
            <p className="lib-hero-sub">
              Explora temas de estudio compartidos por la comunidad e impórtalos
              a tu colección con un solo clic.
            </p>
          </div>
          <div className="lib-hero-stats" aria-hidden="true">
            <div className="lib-hero-stat">
              <span className="lib-hero-stat-num">{total}</span>
              <span className="lib-hero-stat-lbl">temas</span>
            </div>
            <div className="lib-hero-stat-divider" />
            <div className="lib-hero-stat">
              <span className="lib-hero-stat-num">{totalContent}</span>
              <span className="lib-hero-stat-lbl">recursos</span>
            </div>
          </div>
        </div>

        {/* ── Search bar ───────────────────────────────────── */}
        <form className="lib-search-form" onSubmit={handleSearch}>
          <div className="lib-search-wrap">
            <svg
              className="lib-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.5 16.5L21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="lib-search-input"
              type="text"
              placeholder="Buscar temas de estudio..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
            {draftSearch && (
              <button
                type="button"
                className="lib-search-clear"
                onClick={() => {
                  setDraftSearch("");
                  setSearch("");
                }}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          <button className="lib-search-btn" type="submit">
            Buscar
          </button>
        </form>

        {/* ── Results label ────────────────────────────────── */}
        {!loading && !error && search && (
          <p className="lib-results-label">
            {categories.length > 0
              ? `${categories.length} resultado${categories.length !== 1 ? "s" : ""} para "${search}"`
              : `Sin resultados para "${search}"`}
          </p>
        )}

        {/* ── Error ────────────────────────────────────────── */}
        {error && (
          <div className="lib-alert">
            <span>⚠ {error}</span>
            <button onClick={fetchData}>Reintentar</button>
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────── */}
        {loading && (
          <div className="lib-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="lib-card lib-card--skeleton">
                <div className="lib-skeleton lib-skeleton--title" />
                <div className="lib-skeleton lib-skeleton--desc" />
                <div className="lib-skeleton lib-skeleton--badges" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────── */}
        {!loading && !error && categories.length === 0 && (
          <div className="lib-empty">
            <div className="lib-empty-illo" aria-hidden="true">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  stroke="#631D76"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="9 22 9 12 15 12 15 22"
                  stroke="#631D76"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="lib-empty-title">
              {search ? "Sin resultados" : "Aún no hay temas públicos"}
            </h3>
            <p className="lib-empty-sub">
              {search
                ? "Prueba con otras palabras clave."
                : "Sé el primero en publicar un tema de estudio para la comunidad."}
            </p>
          </div>
        )}

        {/* ── Grid ─────────────────────────────────────────── */}
        {!loading && !error && categories.length > 0 && (
          <div className="lib-grid">
            {categories.map((cat) => {
              const result = forkResults[cat.id];
              const isForking = forkingId === cat.id;
              const wasImported = result && !result.isError;
              return (
                <div
                  key={cat.id}
                  className={`lib-card${wasImported ? " lib-card--imported" : ""}`}
                  onClick={() => setPreviewId(cat.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* accent bar */}
                  <div className="lib-card-accent" />

                  <div className="lib-card-body">
                    <h2 className="lib-card-title">{cat.title}</h2>
                    {cat.description && (
                      <p className="lib-card-desc">{cat.description}</p>
                    )}

                    <div className="lib-card-stats">
                      {cat.flashcardCount > 0 && (
                        <ContentStat
                          count={cat.flashcardCount}
                          label={
                            cat.flashcardCount !== 1
                              ? "flashcards"
                              : "flashcard"
                          }
                          icon="🃏"
                          colorClass="lib-stat--flash"
                        />
                      )}
                      {cat.quizCount > 0 && (
                        <ContentStat
                          count={cat.quizCount}
                          label={
                            cat.quizCount !== 1
                              ? "cuestionarios"
                              : "cuestionario"
                          }
                          icon="📝"
                          colorClass="lib-stat--quiz"
                        />
                      )}
                      {cat.trueFalseCount > 0 && (
                        <ContentStat
                          count={cat.trueFalseCount}
                          label={
                            cat.trueFalseCount !== 1 ? "sets V/F" : "set V/F"
                          }
                          icon="✅"
                          colorClass="lib-stat--tf"
                        />
                      )}
                    </div>

                    {result && (
                      <div
                        className={`lib-fork-toast${result.isError ? " lib-fork-toast--error" : ""}`}
                      >
                        {result.isError ? "✕" : "✓"} {result.message}
                      </div>
                    )}
                  </div>

                  <div className="lib-card-footer">
                    <button
                      className={`lib-import-btn${wasImported ? " lib-import-btn--done" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFork(cat.id);
                      }}
                      disabled={isForking || wasImported}
                    >
                      {isForking ? (
                        <>
                          <span className="lib-btn-spinner" />
                          Importando…
                        </>
                      ) : wasImported ? (
                        <>✓ Importado</>
                      ) : (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 5v14M5 19l7 2 7-2"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Importar tema
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="lib-pagination">
            <button
              className="lib-page-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <div className="lib-page-dots">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button
                  key={i}
                  className={`lib-page-dot${i === page ? " lib-page-dot--active" : ""}`}
                  onClick={() => setPage(i)}
                />
              ))}
            </div>
            <button
              className="lib-page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* ── Preview modal ─────────────────────────────────── */}
      {previewId && previewCategory && (
        <CategoryPreviewModal
          categoryId={previewId}
          categoryTitle={previewCategory.title}
          onClose={() => setPreviewId(null)}
          onImport={() => {
            handleFork(previewId);
            setPreviewId(null);
          }}
          isImporting={forkingId === previewId}
          alreadyImported={
            !!(forkResults[previewId] && !forkResults[previewId].isError)
          }
        />
      )}
    </>
  );
};

export default LibraryPage;
