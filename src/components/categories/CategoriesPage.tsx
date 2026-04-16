import React, { useRef, useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import "./CategoriesPage.css";

// ─── ThemeCard ─────────────────────────────────────────────────────────────────

interface ThemeCardProps {
  id: string;
  title: string;
  description?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  title,
  description,
  onEdit,
  onDelete,
}) => (
  <div className="ts-card">
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
          <button className="ts-card-btn" onClick={onEdit} title="Editar">
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
            onClick={onDelete}
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
