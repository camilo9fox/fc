import React, { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, Plus, Trash2, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import { studyGuideApi, StudyGuide } from "../../api/studyGuides";
import GenerateStudyGuideForm from "./GenerateStudyGuideForm";
import "./StudyGuidesPage.css";

type View = "list" | "generate" | "detail";

const StudyGuidesPage: React.FC = () => {
  const { categories, loading: catsLoading } = useCategories();
  const hasCategories = catsLoading || categories.length > 0;
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [selectedGuide, setSelectedGuide] = useState<StudyGuide | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterCategoryId ? { categoryId: filterCategoryId } : {};
      const { guides: data } = await studyGuideApi.getAll(params);
      setGuides(data);
    } catch {
      setError("Error al cargar las guías de estudio.");
    } finally {
      setLoading(false);
    }
  }, [filterCategoryId]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleGenerated = (guide: StudyGuide) => {
    setGuides((prev) => [guide, ...prev]);
    setSelectedGuide(guide);
    setView("detail");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta guía de estudio?")) return;
    setDeletingId(id);
    try {
      await studyGuideApi.remove(id);
      setGuides((prev) => prev.filter((g) => g.id !== id));
      if (selectedGuide?.id === id) {
        setSelectedGuide(null);
        setView("list");
      }
    } catch {
      setError("Error al eliminar la guía.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Generate form ────────────────────────────────────────────────────────────
  if (view === "generate") {
    return (
      <div className="sg-page">
        <GenerateStudyGuideForm
          onGenerated={handleGenerated}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  // ─── Detail view ──────────────────────────────────────────────────────────────
  if (view === "detail" && selectedGuide) {
    return (
      <div className="sg-page">
        <div className="sg-detail">
          <div className="sg-detail-header">
            <div>
              <h2 className="sg-detail-title">{selectedGuide.title}</h2>
              {selectedGuide.category && (
                <p className="sg-detail-category">
                  {selectedGuide.category.title}
                </p>
              )}
            </div>
            <div className="sg-detail-actions">
              <button
                className="sg-btn-danger"
                onClick={() => handleDelete(selectedGuide.id)}
                disabled={deletingId === selectedGuide.id}
              >
                <Trash2 size={14} />
                Eliminar
              </button>
              <button
                className="sg-close-btn"
                onClick={() => {
                  setSelectedGuide(null);
                  setView("list");
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="sg-markdown-body">
            <ReactMarkdown>{selectedGuide.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // ─── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="sg-page">
      <div className="sg-page-header">
        <div>
          <h1 className="sg-page-title">Guías de Estudio</h1>
          <p className="sg-page-sub">
            Genera y consulta guías estructuradas con IA
          </p>
        </div>
        <button
          className="sg-btn-primary"
          onClick={() => setView("generate")}
          disabled={!hasCategories}
          title={!hasCategories ? "Crea un tema de estudio primero" : undefined}
        >
          <Plus size={16} /> Nueva guía
        </button>
      </div>

      {categories.length > 1 && (
        <div className="sg-filter-row">
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {!hasCategories && <NoCategoryBanner feature="guías de estudio" />}

      {error && <p className="sg-error">{error}</p>}

      {loading ? (
        <p className="sg-muted">Cargando guías…</p>
      ) : guides.length === 0 ? (
        <div className="sg-empty">
          <BookOpen size={40} className="sg-empty-icon" />
          <p>Aún no tienes guías de estudio.</p>
          {hasCategories && (
            <button
              className="sg-btn-primary"
              onClick={() => setView("generate")}
            >
              Generar primera guía
            </button>
          )}
        </div>
      ) : (
        <div className="sg-grid">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="sg-card"
              onClick={() => {
                setSelectedGuide(guide);
                setView("detail");
              }}
            >
              <div className="sg-card-body">
                <h3 className="sg-card-title">{guide.title}</h3>
                {guide.category && (
                  <span className="sg-card-category">
                    {guide.category.title}
                  </span>
                )}
                <p className="sg-card-preview">
                  {guide.content.slice(0, 140).replace(/[#*]/g, "").trim()}…
                </p>
              </div>
              <div className="sg-card-footer">
                <span className="sg-card-date">
                  {new Date(guide.createdAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <button
                  className="sg-card-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(guide.id);
                  }}
                  disabled={deletingId === guide.id}
                  title="Eliminar guía"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyGuidesPage;
