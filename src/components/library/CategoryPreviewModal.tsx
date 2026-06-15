import React, { useEffect, useState } from "react";
import { libraryApi, CategoryPreview } from "../../api/library";
import "./CategoryPreviewModal.css";

interface Props {
  categoryId: string;
  categoryTitle: string;
  onClose: () => void;
  onImport: () => void;
  isImporting: boolean;
  alreadyImported: boolean;
  isOwner: boolean;
}

const CategoryPreviewModal: React.FC<Props> = ({
  categoryId,
  categoryTitle,
  onClose,
  onImport,
  isImporting,
  alreadyImported,
  isOwner,
}) => {
  const [preview, setPreview] = useState<CategoryPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    libraryApi
      .getPreview(categoryId)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el preview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const totalItems =
    (preview?.flashcards.length ?? 0) +
    (preview?.quizzes.length ?? 0) +
    (preview?.trueFalseSets.length ?? 0) +
    (preview?.studyGuides?.length ?? 0);

  const studyGuides = preview?.studyGuides ?? [];

  return (
    <div className="cpv-overlay" onClick={onClose}>
      <div className="cpv-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cpv-header">
          <div className="cpv-header-left">
            <span className="cpv-badge">PREVIEW</span>
            <h2 className="cpv-title">{categoryTitle}</h2>
          </div>
          <button className="cpv-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cpv-body">
          {loading && (
            <div className="cpv-loading">
              <div className="cpv-spinner" />
              <span>Cargando contenido…</span>
            </div>
          )}

          {error && <p className="cpv-error">{error}</p>}

          {!loading && !error && preview && (
            <>
              {preview.description && (
                <p className="cpv-desc">{preview.description}</p>
              )}

              {/* Flashcards section */}
              {preview.flashcards.length > 0 && (
                <section className="cpv-section">
                  <h3 className="cpv-section-title">
                    <span className="cpv-section-icon">🃏</span>
                    Flashcards
                    <span className="cpv-section-count">
                      muestra de {preview.flashcards.length}
                    </span>
                  </h3>
                  {(() => {
                    const grouped: Record<string, typeof preview.flashcards> = {};
                    preview.flashcards.forEach((fc) => {
                      const key = fc.set?.title || "Sin set";
                      if (!grouped[key]) grouped[key] = [];
                      grouped[key].push(fc);
                    });
                    return Object.entries(grouped).map(([setTitle, cards]) => (
                      <div key={setTitle} className="cpv-set-group">
                        {setTitle !== "Sin set" && (
                          <div className="cpv-set-header">
                            <span className="cpv-set-name">{setTitle}</span>
                            <span className="cpv-set-count">
                              {cards.length} tarjeta{cards.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                        <ul className="cpv-list">
                          {cards.map((fc) => (
                            <li key={fc.id} className="cpv-flashcard-item">
                              <span className="cpv-q-icon">P</span>
                              <span className="cpv-q-text">{fc.question}</span>
                              {fc.isNew && <span className="cpv-new-badge">🆕</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ));
                  })()}
                </section>
              )}

              {/* Quizzes section */}
              {preview.quizzes.length > 0 && (
                <section className="cpv-section">
                  <h3 className="cpv-section-title">
                    <span className="cpv-section-icon">📝</span>
                    Cuestionarios
                    <span className="cpv-section-count">
                      {preview.quizzes.length} incluido
                      {preview.quizzes.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  <ul className="cpv-list">
                    {preview.quizzes.map((q) => (
                      <li
                        key={q.id}
                        className="cpv-content-item cpv-content-item--quiz"
                      >
                        <span className="cpv-content-name">
                          {q.title}
                          {q.isNew && <span className="cpv-new-badge">🆕</span>}
                        </span>
                        {q.description && (
                          <span className="cpv-content-desc">
                            {q.description}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* True/False section */}
              {preview.trueFalseSets.length > 0 && (
                <section className="cpv-section">
                  <h3 className="cpv-section-title">
                    <span className="cpv-section-icon">✅</span>
                    Verdadero / Falso
                    <span className="cpv-section-count">
                      {preview.trueFalseSets.length} incluido
                      {preview.trueFalseSets.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  <ul className="cpv-list">
                    {preview.trueFalseSets.map((t) => (
                      <li
                        key={t.id}
                        className="cpv-content-item cpv-content-item--tf"
                      >
                        <span className="cpv-content-name">
                          {t.title}
                          {t.isNew && <span className="cpv-new-badge">🆕</span>}
                        </span>
                        {t.description && (
                          <span className="cpv-content-desc">
                            {t.description}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Study guides section */}
              {studyGuides.length > 0 && (
                <section className="cpv-section">
                  <h3 className="cpv-section-title">
                    <span className="cpv-section-icon">📖</span>
                    Guías de estudio
                    <span className="cpv-section-count">
                      {studyGuides.length} incluida
                      {studyGuides.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  <ul className="cpv-list">
                    {studyGuides.map((g) => (
                      <li
                        key={g.id}
                        className="cpv-content-item cpv-content-item--guide"
                      >
                        <span className="cpv-content-name">
                          {g.title}
                          {g.isNew && <span className="cpv-new-badge">🆕</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {totalItems === 0 && (
                <p className="cpv-empty">
                  Este tema aún no tiene contenido disponible para preview.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="cpv-footer">
          <button className="cpv-cancel-btn" onClick={onClose}>
            Cerrar
          </button>
          <button
            className={`cpv-import-btn ${isOwner ? "cpv-import-btn--owner" : alreadyImported ? "cpv-import-btn--done" : ""}`}
            onClick={onImport}
            disabled={isImporting || alreadyImported || isOwner}
          >
            {isOwner ? (
              "🔒 Tema propio"
            ) : isImporting ? (
              <>
                <span className="cpv-btn-spinner" />
                Importando…
              </>
            ) : alreadyImported ? (
              "✓ Importado"
            ) : (
              "↓ Importar tema"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPreviewModal;
