import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  Clock3,
  ListTree,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import { studyGuideApi, StudyGuide } from "../../api/studyGuides";
import GenerateStudyGuideForm from "./GenerateStudyGuideForm";
import "./StudyGuidesPage.css";

type View = "list" | "generate" | "detail";

const normalizePreview = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[>#*_~\-|\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractSections = (markdown: string) => {
  const lines = markdown.split("\n");
  const sections: { level: 2 | 3; title: string }[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h3) {
      sections.push({ level: 3, title: h3[1].trim() });
      continue;
    }
    if (h2) {
      sections.push({ level: 2, title: h2[1].trim() });
    }
  }

  return sections;
};

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

  const detailStats = useMemo(() => {
    if (!selectedGuide) {
      return {
        words: 0,
        readMinutes: 0,
        sections: [] as { level: 2 | 3; title: string }[],
      };
    }

    const plainText = normalizePreview(selectedGuide.content);
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const readMinutes = Math.max(1, Math.ceil(words / 180));
    const sections = extractSections(selectedGuide.content);

    return { words, readMinutes, sections };
  }, [selectedGuide]);

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
        <div className="sg-detail sg-detail--immersive">
          <section className="sg-detail-hero">
            <div className="sg-detail-hero-top">
              <button
                className="sg-btn-secondary"
                onClick={() => {
                  setSelectedGuide(null);
                  setView("list");
                }}
              >
                <X size={14} /> Volver a guías
              </button>
              <div className="sg-detail-actions">
                <button
                  className="sg-btn-danger"
                  onClick={() => handleDelete(selectedGuide.id)}
                  disabled={deletingId === selectedGuide.id}
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>

            <h2 className="sg-detail-title">{selectedGuide.title}</h2>

            <div className="sg-detail-meta-strip">
              {selectedGuide.category && (
                <span className="sg-detail-category">
                  <Sparkles size={13} />
                  {selectedGuide.category.title}
                </span>
              )}
              <span className="sg-detail-chip">
                <Clock3 size={13} />
                {detailStats.readMinutes} min lectura
              </span>
              <span className="sg-detail-chip">
                <ListTree size={13} />
                {Math.max(1, detailStats.sections.length)} secciones
              </span>
              <span className="sg-detail-chip">
                {detailStats.words} palabras
              </span>
            </div>

            <p className="sg-detail-intro">
              Guía optimizada para repaso activo: identifica los conceptos
              clave, conecta ideas y vuelve a esta vista para reforzar puntos
              críticos.
            </p>
          </section>

          <div className="sg-detail-shell">
            <aside className="sg-detail-aside">
              <div className="sg-aside-card">
                <p className="sg-aside-eyebrow">Mapa rápido</p>
                {detailStats.sections.length === 0 ? (
                  <p className="sg-aside-muted">
                    Esta guía no incluye encabezados markdown. Agrega ## títulos
                    para mejorar la navegación visual.
                  </p>
                ) : (
                  <ul className="sg-section-list">
                    {detailStats.sections.slice(0, 8).map((section, idx) => (
                      <li
                        key={`${section.title}-${idx}`}
                        className={
                          section.level === 3
                            ? "sg-section-item sg-section-item--nested"
                            : "sg-section-item"
                        }
                      >
                        {section.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="sg-aside-card sg-aside-card--tip">
                <p className="sg-aside-eyebrow">Sugerencia de estudio</p>
                <p className="sg-aside-muted">
                  Lee una sección, pausa y explícatela en voz alta sin mirar. Si
                  no puedes hacerlo, vuelve al bloque y resume en 2 frases.
                </p>
              </div>
            </aside>

            <article className="sg-markdown-body">
              <ReactMarkdown>{selectedGuide.content}</ReactMarkdown>
            </article>
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
