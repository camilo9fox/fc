import React, { useState } from "react";
import { Category } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";
import ThemeCard from "./ThemeCard";
import ThemeModal from "./ThemeModal";
import CategoryDetailModal from "./CategoryDetailModal";
import "./CategoriesPage.css";

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
      {/* Hero */}
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

      {/* Cómo funciona */}
      <div className="ts-how">
        <div className="ts-how-step">
          <div className="ts-how-num">1</div>
          <div className="ts-how-info">
            <strong>Crea un tema</strong>
            <span>Dale un nombre como "Biología" o "Historia"</span>
          </div>
        </div>
        <div className="ts-how-arrow" aria-hidden="true">→</div>
        <div className="ts-how-step">
          <div className="ts-how-num">2</div>
          <div className="ts-how-info">
            <strong>Añade contenido</strong>
            <span>Flashcards, cuestionarios y V/F</span>
          </div>
        </div>
        <div className="ts-how-arrow" aria-hidden="true">→</div>
        <div className="ts-how-step">
          <div className="ts-how-num">3</div>
          <div className="ts-how-info">
            <strong>Estudia por tema</strong>
            <span>Todo tu material organizado en un lugar</span>
          </div>
        </div>
      </div>

      {/* Alerta de error */}
      {(pageError || loadError) && (
        <div className="ts-alert">
          <span>{pageError || loadError}</span>
          <button onClick={() => setPageError(null)}>✕</button>
        </div>
      )}

      {/* Contenido */}
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
              <span>Nuevo tema</span>
            </button>
          </div>
        </>
      )}

      {/* Detail modal */}
      {detailCat && (
        <CategoryDetailModal
          category={detailCat}
          onClose={() => setDetailCat(null)}
        />
      )}

      {/* Create / Edit modal */}
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