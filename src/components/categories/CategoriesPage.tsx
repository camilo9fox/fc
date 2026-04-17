import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flashCardsApi, FlashCard, Category } from "../../api/flashcards";
import { quizApi, Quiz } from "../../api/quiz";
import { trueFalseApi, TrueFalseSet } from "../../api/trueFalse";
import StudySession from "../flashcards/StudySession";
import { useCategories } from "../../hooks/useCategories";
import "./CategoriesPage.css";

// ─── ThemeCard ─────────────────────────────────────────────────────────────────

interface ThemeCardProps {
  id: string;
  title: string;
  description?: string;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  title,
  description,
  onEdit,
  onDelete,
  onOpen,
}) => (
  <div className="ts-card" onClick={onOpen} style={{ cursor: "pointer" }}>
    <div className="ts-card-accent" />
    <div className="ts-card-body">
      <div className="ts-card-top">
        <div className="ts-card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
              stroke="#631D76"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke="#631D76"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="ts-card-actions">
          <button
            className="ts-card-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="ts-card-btn ts-card-btn-del"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Eliminar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <polyline
                points="3 6 5 6 21 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11v6M14 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <h3 className="ts-card-title">{title}</h3>
      {description && <p className="ts-card-desc">{description}</p>}
      <div className="ts-card-tags">
        <span className="ts-tag">Flashcards</span>
        <span className="ts-tag">Cuestionarios</span>
        <span className="ts-tag">V / F</span>
      </div>
    </div>
  </div>
);

// ─── ThemeModal ────────────────────────────────────────────────────────────────

interface ThemeModalProps {
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  onSubmit: (title: string, description: string) => Promise<void>;
  onClose: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
  mode,
  initialTitle = "",
  initialDescription = "",
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("El título es obligatorio.");
    setSaving(true);
    setError(null);
    try {
      await onSubmit(title.trim(), description.trim());
    } catch (err: any) {
      setError(err?.message || "Error al guardar.");
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      className="ts-modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="ts-modal" role="dialog" aria-modal="true">
        <div className="ts-modal-header">
          <div className="ts-modal-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="ts-modal-title">
            {mode === "create" ? "Nuevo tema de estudio" : "Editar tema"}
          </h2>
          <button
            className="ts-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="ts-modal-body">
            <div className="ts-field">
              <label className="ts-label">Nombre del tema</label>
              <input
                className="ts-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Biología, Historia, Matemáticas…"
                autoFocus
              />
            </div>
            <div className="ts-field">
              <label className="ts-label">
                Descripción <span className="ts-optional">(opcional)</span>
              </label>
              <textarea
                className="ts-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Qué material agruparás en este tema?"
                rows={3}
              />
            </div>
            {error && <p className="ts-field-error">{error}</p>}
          </div>
          <div className="ts-modal-footer">
            <button
              type="button"
              className="ts-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="ts-btn-primary" disabled={saving}>
              {saving
                ? "Guardando…"
                : mode === "create"
                  ? "Crear tema"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CategoryDetailModal ───────────────────────────────────────────────────────

type DetailTab = "flashcards" | "quizzes" | "truefalse";

interface CategoryDetailModalProps {
  category: Category;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  onClose,
}) => {
  const navigate = useNavigate();
  const backdropRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<DetailTab>("flashcards");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [tfSets, setTfSets] = useState<TrueFalseSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [studyCards, setStudyCards] = useState<FlashCard[] | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      flashCardsApi.getFlashCards({ categoryId: category.id, limit: 200 }),
      quizApi.getAll({ categoryId: category.id, limit: 200 }),
      trueFalseApi.getAll({ categoryId: category.id, limit: 200 }),
    ])
      .then(([fcRes, qRes, tfRes]) => {
        setFlashcards(fcRes.flashcards);
        setQuizzes(qRes.quizzes);
        setTfSets(tfRes.sets);
      })
      .finally(() => setLoading(false));
  }, [category.id]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const tabs: { key: DetailTab; label: string; count: number }[] = [
    { key: "flashcards", label: "Flashcards", count: flashcards.length },
    { key: "quizzes", label: "Cuestionarios", count: quizzes.length },
    { key: "truefalse", label: "V / F", count: tfSets.length },
  ];

  if (studyCards) {
    return (
      <StudySession
        cards={studyCards}
        title={`Estudio: ${category.title}`}
        onClose={() => setStudyCards(null)}
      />
    );
  }

  return (
    <div
      className="ts-modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdrop}
    >
      <div className="ts-detail-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="ts-detail-header">
          <div className="ts-detail-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="ts-detail-header-text">
            <h2 className="ts-detail-title">{category.title}</h2>
            {category.description && (
              <p className="ts-detail-desc">{category.description}</p>
            )}
          </div>
          <button
            className="ts-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="ts-detail-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`ts-detail-tab${tab === t.key ? " ts-detail-tab--active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="ts-detail-tab-badge">
                {loading ? "…" : t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="ts-detail-body">
          {loading ? (
            <div className="ts-loading" style={{ padding: "40px 0" }}>
              <div className="ts-spinner" />
              <span>Cargando contenido…</span>
            </div>
          ) : (
            <>
              {/* ── Flashcards ── */}
              {tab === "flashcards" && (
                <div className="ts-detail-section">
                  {flashcards.length === 0 ? (
                    <div className="ts-detail-empty">
                      <p>No hay flashcards en este tema todavía.</p>
                      <button
                        className="ts-btn-secondary"
                        onClick={() => {
                          onClose();
                          navigate("/flashcards");
                        }}
                      >
                        Ir a Flashcards
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="ts-detail-section-bar">
                        <span className="ts-detail-count">
                          {flashcards.length} tarjetas
                        </span>
                        <button
                          className="ts-btn-primary ts-btn-sm"
                          onClick={() => setStudyCards(flashcards)}
                        >
                          &#9654; Estudiar todo
                        </button>
                      </div>
                      <div className="ts-detail-fc-list">
                        {flashcards.map((fc) => (
                          <div key={fc.id} className="ts-detail-fc-item">
                            <div className="ts-detail-fc-q">
                              <span className="ts-detail-fc-label">P</span>
                              <span>{fc.question}</span>
                            </div>
                            <div className="ts-detail-fc-a">
                              <span className="ts-detail-fc-label ts-detail-fc-label--a">
                                R
                              </span>
                              <span>{fc.answer}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Cuestionarios ── */}
              {tab === "quizzes" && (
                <div className="ts-detail-section">
                  {quizzes.length === 0 ? (
                    <div className="ts-detail-empty">
                      <p>No hay cuestionarios en este tema todavía.</p>
                      <button
                        className="ts-btn-secondary"
                        onClick={() => {
                          onClose();
                          navigate("/quizzes");
                        }}
                      >
                        Ir a Cuestionarios
                      </button>
                    </div>
                  ) : (
                    <div className="ts-detail-list">
                      {quizzes.map((q) => (
                        <div key={q.id} className="ts-detail-item">
                          <div className="ts-detail-item-icon ts-detail-item-icon--quiz">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <circle
                                cx="12"
                                cy="17"
                                r="0.5"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </div>
                          <div className="ts-detail-item-info">
                            <span className="ts-detail-item-title">
                              {q.title}
                            </span>
                            {q.questions && (
                              <span className="ts-detail-item-meta">
                                {q.questions.length} preguntas
                              </span>
                            )}
                          </div>
                          <button
                            className="ts-btn-primary ts-btn-sm"
                            onClick={() => {
                              onClose();
                              navigate("/quizzes");
                            }}
                          >
                            Estudiar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── V/F ── */}
              {tab === "truefalse" && (
                <div className="ts-detail-section">
                  {tfSets.length === 0 ? (
                    <div className="ts-detail-empty">
                      <p>No hay sets de V/F en este tema todavía.</p>
                      <button
                        className="ts-btn-secondary"
                        onClick={() => {
                          onClose();
                          navigate("/truefalse");
                        }}
                      >
                        Ir a Verdadero / Falso
                      </button>
                    </div>
                  ) : (
                    <div className="ts-detail-list">
                      {tfSets.map((s) => (
                        <div key={s.id} className="ts-detail-item">
                          <div className="ts-detail-item-icon ts-detail-item-icon--tf">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M9 11l3 3L22 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="ts-detail-item-info">
                            <span className="ts-detail-item-title">
                              {s.title}
                            </span>
                            {s.questions && (
                              <span className="ts-detail-item-meta">
                                {s.questions.length} enunciados
                              </span>
                            )}
                          </div>
                          <button
                            className="ts-btn-primary ts-btn-sm"
                            onClick={() => {
                              onClose();
                              navigate("/truefalse");
                            }}
                          >
                            Estudiar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Página principal ──────────────────────────────────────────────────────────

type ModalState =
  | null
  | { mode: "create" }
  | { mode: "edit"; id: string; title: string; description: string };

const CategoriesPage: React.FC = () => {
  const {
    categories,
    loading,
    error: loadError,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [modal, setModal] = useState<ModalState>(null);
  const [detailCat, setDetailCat] = useState<Category | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const openCreate = () => setModal({ mode: "create" });
  const openEdit = (id: string, title: string, description: string) =>
    setModal({ mode: "edit", id, title, description });
  const closeModal = () => setModal(null);

  const handleCreate = async (title: string, description: string) => {
    await createCategory({ title, description: description || undefined });
    closeModal();
  };

  const handleUpdate = async (title: string, description: string) => {
    if (!modal || modal.mode !== "edit") return;
    await updateCategory(modal.id, {
      title,
      description: description || undefined,
    });
    closeModal();
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !window.confirm(
        `¿Eliminar "${title}"? El contenido asociado no se eliminará.`,
      )
    )
      return;
    try {
      await deleteCategory(id);
    } catch (err: any) {
      setPageError(err?.message || "Error al eliminar el tema.");
    }
  };

  return (
    <div className="ts-page">
      {/* ── Hero ── */}
      <div className="ts-hero">
        <div className="ts-hero-text">
          <span className="ts-hero-badge">ORGANIZACIÓN</span>
          <h1 className="ts-hero-title">Temas de estudio</h1>
          <p className="ts-hero-sub">
            Agrupa tus flashcards, cuestionarios y sets de Verdadero/Falso bajo
            un mismo tema. Estudia de forma organizada y encuentra tu material
            al instante.
          </p>
          <button className="ts-hero-cta" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            Nuevo tema
          </button>
        </div>
        <div className="ts-hero-illo" aria-hidden="true">
          <svg width="110" height="110" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Cómo funciona ── */}
      <div className="ts-how">
        <div className="ts-how-step">
          <div className="ts-how-num">1</div>
          <div className="ts-how-info">
            <strong>Crea un tema</strong>
            <span>Dale un nombre como "Biología" o "Historia"</span>
          </div>
        </div>
        <div className="ts-how-arrow" aria-hidden="true">
          →
        </div>
        <div className="ts-how-step">
          <div className="ts-how-num">2</div>
          <div className="ts-how-info">
            <strong>Añade contenido</strong>
            <span>Flashcards, cuestionarios y V/F</span>
          </div>
        </div>
        <div className="ts-how-arrow" aria-hidden="true">
          →
        </div>
        <div className="ts-how-step">
          <div className="ts-how-num">3</div>
          <div className="ts-how-info">
            <strong>Estudia por tema</strong>
            <span>Todo tu material organizado en un lugar</span>
          </div>
        </div>
      </div>

      {/* ── Alerta de error ── */}
      {(pageError || loadError) && (
        <div className="ts-alert">
          <span>{pageError || loadError}</span>
          <button onClick={() => setPageError(null)}>✕</button>
        </div>
      )}

      {/* ── Contenido ── */}
      {loading ? (
        <div className="ts-loading">
          <div className="ts-spinner" />
          <span>Cargando temas…</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="ts-empty">
          <div className="ts-empty-illo" aria-hidden="true">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke="#631D76"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke="#631D76"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="ts-empty-title">Aún no tienes temas</h3>
          <p className="ts-empty-sub">
            Crea tu primer tema de estudio para empezar a organizar tu material.
          </p>
          <button className="ts-btn-primary" onClick={openCreate}>
            Crear primer tema
          </button>
        </div>
      ) : (
        <>
          <p className="ts-section-label">
            {categories.length} {categories.length === 1 ? "tema" : "temas"} de
            estudio
          </p>
          <div className="ts-grid">
            {categories.map((cat) => (
              <ThemeCard
                key={cat.id}
                id={cat.id}
                title={cat.title}
                description={cat.description}
                onEdit={() =>
                  openEdit(cat.id, cat.title, cat.description || "")
                }
                onDelete={() => handleDelete(cat.id, cat.title)}
                onOpen={() => setDetailCat(cat)}
              />
            ))}
            <button className="ts-card-add" onClick={openCreate}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Nuevo tema
            </button>
          </div>
        </>
      )}

      {detailCat && (
        <CategoryDetailModal
          category={detailCat}
          onClose={() => setDetailCat(null)}
        />
      )}

      {/* ── Modal ── */}
      {modal && modal.mode === "create" && (
        <ThemeModal
          mode="create"
          onSubmit={handleCreate}
          onClose={closeModal}
        />
      )}
      {modal && modal.mode === "edit" && (
        <ThemeModal
          mode="edit"
          initialTitle={modal.title}
          initialDescription={modal.description}
          onSubmit={handleUpdate}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
