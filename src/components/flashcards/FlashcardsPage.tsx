import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Download,
  Layers,
  Pencil,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { flashCardsApi, FlashCard } from "../../api/flashcards";
import { attemptsApi } from "../../api/attempts";
import { useCategories } from "../../hooks/useCategories";
import StudySession from "./StudySession";
import GenerateFlashcardsForm from "./GenerateFlashcardsForm";
import CreateFlashcardForm from "./CreateFlashcardForm";
import CardRow from "./CardRow";
import CategoryAccordion from "./CategoryAccordion";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import CsvImportModal from "./CsvImportModal";
import { CardRowSkeleton } from "../shared/Skeleton";
import "./FlashcardsPage.css";
import { useGenerationQueue } from "../../contexts/GenerationQueueContext";

type DraftFlashcard = {
  question: string;
  answer: string;
  source: "ai" | "manual";
  categoryId?: string;
  category?: {
    id: string;
    title: string;
    description?: string;
  };
};

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const FlashcardsPage: React.FC = () => {
  const { token } = useAuth();
  const { categories, loading: catsLoading } = useCategories();
  const hasCategories = catsLoading || categories.length > 0;
  const [draftFlashcards, setDraftFlashcards] = useState<DraftFlashcard[]>([]);
  const [savedFlashcards, setSavedFlashcards] = useState<FlashCard[]>([]);
  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [studyMode, setStudyMode] = useState(false);
  const [studyTitle, setStudyTitle] = useState("Estudio de flashcards");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"manual" | "ai">("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FlashCard[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedFlashcards = useMemo(() => {
    const grouped: { [key: string]: any[] } = { "Sin categoría": [] };
    savedFlashcards.forEach((card) => {
      const categoryTitle = card.category?.title || "Sin categoría";
      if (!grouped[categoryTitle]) grouped[categoryTitle] = [];
      grouped[categoryTitle].push(card);
    });
    return grouped;
  }, [savedFlashcards]);

  const { claimResult } = useGenerationQueue();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const pending = claimResult("flashcards");
    if (pending?.flashcards?.length) {
      handleAddGenerated(pending.flashcards);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const loadSaved = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await flashCardsApi.getFlashCards();
        setSavedFlashcards(response.flashcards || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "No se pudieron cargar las flashcards.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
  }, [token]);

  const handleSaveDrafts = async () => {
    if (!draftFlashcards.length) return;
    const withoutCategory = draftFlashcards.filter((c) => !c.categoryId);
    if (withoutCategory.length > 0) {
      setError(
        "Todas las flashcards deben tener una categoría antes de guardar.",
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await flashCardsApi.saveFlashCards(
        draftFlashcards as Array<{
          question: string;
          answer: string;
          source?: "ai" | "manual";
          categoryId: string;
        }>,
      );
      setSavedFlashcards((prev) => [...result.flashcards, ...prev]);
      setDraftFlashcards([]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "No se pudieron guardar las flashcards.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddGenerated = (cards: DraftFlashcard[]) => {
    setDraftFlashcards((prev) => [...cards, ...prev]);
  };

  const handleAddManual = (card: DraftFlashcard) => {
    setDraftFlashcards((prev) => [card, ...prev]);
  };

  const handleRemoveDraft = (index: number) => {
    setDraftFlashcards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartStudy = (cards: FlashCard[], title: string) => {
    if (!cards.length) return;
    setStudyCards(cards);
    setStudyTitle(title);
    setStudyMode(true);
  };

  const handleDeleteSavedCard = async (cardId: string) => {
    try {
      await flashCardsApi.deleteFlashCard(cardId);
      setSavedFlashcards((prev) => prev.filter((card) => card.id !== cardId));
      setStudyCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudo eliminar la flashcard.",
      );
    }
  };

  const handleUpdateSavedCard = async (
    cardId: string,
    question: string,
    answer: string,
  ) => {
    const updated = await flashCardsApi.updateFlashCard(cardId, {
      question,
      answer,
    });
    setSavedFlashcards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, ...updated } : card)),
    );
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);

      if (searchTimeout.current) clearTimeout(searchTimeout.current);

      if (q.trim().length < 2) {
        setSearchResults(null);
        return;
      }

      searchTimeout.current = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await flashCardsApi.searchFlashCards({ q: q.trim() });
          setSearchResults(res.flashcards);
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [],
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
  };

  const [exportingPdf, setExportingPdf] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await flashCardsApi.exportFlashCards();
    } catch {
      setError("No se pudo exportar el CSV.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = () => {
    if (!savedFlashcards.length) return;
    setExportingPdf(true);

    // Group by category title for the printed output
    const grouped: Record<string, FlashCard[]> = {};
    for (const card of savedFlashcards) {
      const cat = card.category?.title ?? "Sin categoría";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(card);
    }

    const rows = Object.entries(grouped)
      .map(
        ([cat, cards]) => `
        <section>
          <h2>${escapeHtml(cat)}</h2>
          ${cards
            .map(
              (c, i) => `
            <div class="card">
              <div class="card-num">${i + 1}</div>
              <div class="card-q"><strong>P:</strong> ${escapeHtml(c.question)}</div>
              <div class="card-a"><strong>R:</strong> ${escapeHtml(c.answer)}</div>
            </div>`,
            )
            .join("")}
        </section>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Flashcards — StudyAI</title>
<style>
  body { font-family: Georgia, serif; color: #1a1a1a; padding: 32px; max-width: 720px; margin: auto; }
  h1 { font-size: 1.5rem; color: #631D76; border-bottom: 2px solid #631D76; padding-bottom: 8px; margin-bottom: 24px; }
  h2 { font-size: 1.1rem; color: #631D76; margin: 28px 0 12px; border-left: 4px solid #EE4266; padding-left: 10px; }
  .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; page-break-inside: avoid; position: relative; }
  .card-num { position: absolute; top: 8px; right: 12px; font-size: 0.75rem; color: #999; }
  .card-q { margin-bottom: 6px; line-height: 1.5; }
  .card-a { line-height: 1.5; color: #333; border-top: 1px solid #f0f0f0; padding-top: 6px; margin-top: 6px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>📚 Mis Flashcards — StudyAI</h1>
${rows}
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      setError(
        "El navegador bloqueó la ventana emergente. Permite popups e inténtalo de nuevo.",
      );
      setExportingPdf(false);
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      setExportingPdf(false);
    }, 400);
  };

  if (studyMode && studyCards.length > 0) {
    // Derive categoryId: use the common category if all cards belong to the same one
    const categoryIds = new Set(
      studyCards.map((c) => c.category?.id).filter(Boolean),
    );
    const categoryId =
      categoryIds.size === 1 ? Array.from(categoryIds)[0] : undefined;

    return (
      <StudySession
        cards={studyCards}
        title={studyTitle}
        onClose={() => setStudyMode(false)}
        onComplete={(known, unknown, total) => {
          attemptsApi
            .recordFlashcards({
              category_id: categoryId,
              cards_known: known,
              cards_unknown: unknown,
              total_cards: total,
            })
            .catch(() => {}); // fire-and-forget
        }}
      />
    );
  }

  if (showCreate) {
    return (
      <div className="qz-page">
        <div className="qz-mode-toggle">
          <button
            className={`qz-mode-btn ${createMode === "manual" ? "active" : ""}`}
            onClick={() => setCreateMode("manual")}
          >
            <Pencil size={14} /> Manual
          </button>
          <button
            className={`qz-mode-btn ${createMode === "ai" ? "active" : ""}`}
            onClick={() => setCreateMode("ai")}
          >
            <Sparkles size={14} /> Generar con IA
          </button>
        </div>

        {createMode === "manual" ? (
          <CreateFlashcardForm
            onCreated={(card) => {
              handleAddManual(card);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <GenerateFlashcardsForm
            onGenerated={(cards) => {
              handleAddGenerated(cards);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="qz-page">
      <div className="qz-page-header">
        <div>
          <h1 className="qz-page-title">Flashcards</h1>
          <p className="qz-page-sub">Crea y estudia tus tarjetas de repaso</p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {savedFlashcards.length > 0 && (
            <>
              <button
                className="qz-btn-secondary"
                onClick={handleExport}
                disabled={exporting}
                title="Exportar flashcards como CSV"
              >
                <Download size={14} /> {exporting ? "Exportando..." : "CSV"}
              </button>
              <button
                className="qz-btn-secondary"
                onClick={handleExportPdf}
                disabled={exportingPdf}
                title="Exportar flashcards como PDF (imprimir)"
              >
                <Download size={14} /> {exportingPdf ? "Preparando..." : "PDF"}
              </button>
            </>
          )}
          <button
            className="qz-btn-secondary"
            onClick={() => setShowCsvImport(true)}
            disabled={!hasCategories}
            title="Importar flashcards desde CSV"
          >
            <Upload size={14} /> Importar CSV
          </button>
          <button
            className="qz-btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={!hasCategories}
          >
            + Nueva flashcard
          </button>
        </div>
      </div>

      {error && <p className="qz-error">{error}</p>}

      {!hasCategories && <NoCategoryBanner feature="flashcards" />}

      {/* Search bar */}
      {savedFlashcards.length > 0 && (
        <div className="fc-search-bar">
          <Search size={16} className="fc-search-icon" />
          <input
            type="text"
            placeholder="Buscar flashcards por pregunta o respuesta..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="fc-search-input"
          />
          {searchQuery && (
            <button className="fc-search-clear" onClick={handleClearSearch}>
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Search results */}
      {searchResults !== null && (
        <section className="qz-draft-panel">
          <div className="qz-draft-header">
            <div>
              <h2 className="qz-draft-title">Resultados de búsqueda</h2>
              <span className="qz-draft-badge">
                {searching
                  ? "Buscando..."
                  : `${searchResults.length} resultado${searchResults.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
          {!searching && searchResults.length === 0 && (
            <p style={{ padding: "1rem", color: "#64748b" }}>
              No se encontraron flashcards con ese término.
            </p>
          )}
          {searchResults.map((card) => (
            <CardRow
              key={card.id}
              question={card.question}
              answer={card.answer}
              source={card.source as any}
              onDelete={() => handleDeleteSavedCard(card.id)}
            />
          ))}
        </section>
      )}

      {/* Sección borrador */}
      {draftFlashcards.length > 0 && (
        <section className="qz-draft-panel">
          <div className="qz-draft-header">
            <div>
              <h2 className="qz-draft-title">Borrador</h2>
              <span className="qz-draft-badge">
                {draftFlashcards.length} flashcard
                {draftFlashcards.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="qz-draft-actions">
              <button
                className="qz-btn-secondary"
                onClick={() => setDraftFlashcards([])}
              >
                Descartar
              </button>
              <button
                className="qz-btn-primary"
                onClick={handleSaveDrafts}
                disabled={saving || draftFlashcards.length === 0}
              >
                {saving ? "Guardando..." : "Guardar flashcards"}
              </button>
              <button
                className="qz-btn-study"
                onClick={() =>
                  handleStartStudy(
                    draftFlashcards.map(
                      (card) =>
                        ({
                          ...card,
                          id: `${card.question}-${card.answer}`,
                          category: card.category,
                        }) as FlashCard,
                    ),
                    "Estudio de borrador",
                  )
                }
              >
                Estudiar borrador →
              </button>
            </div>
          </div>
          <div
            className="fc-accordion-body"
            style={{ borderTop: "1px solid #e2e8f0" }}
          >
            {draftFlashcards.map((card, index) => (
              <CardRow
                key={`${card.question}-${index}`}
                question={card.question}
                answer={card.answer}
                source={card.source}
                onDelete={() => handleRemoveDraft(index)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sección guardadas */}
      {loading ? (
        <div style={{ marginTop: "0.5rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="fc-accordion-skeleton">
              <CardRowSkeleton />
              <CardRowSkeleton />
              <CardRowSkeleton />
            </div>
          ))}
        </div>
      ) : savedFlashcards.length === 0 && draftFlashcards.length === 0 ? (
        <div className="qz-empty">
          <div className="qz-empty-icon">
            <Layers size={48} />
          </div>
          <h3>Aún no tienes flashcards guardadas</h3>
          <p>Crea tu primera flashcard manual o con IA</p>
          <button
            className="qz-btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={!hasCategories}
          >
            Crear flashcard
          </button>
        </div>
      ) : savedFlashcards.length > 0 ? (
        <>
          <div className="fc-list-header">
            <span className="fc-list-count">
              {savedFlashcards.length} flashcard
              {savedFlashcards.length !== 1 ? "s" : ""} guardadas
            </span>
            <button
              className="qz-btn-study"
              onClick={() =>
                handleStartStudy(savedFlashcards, "Todas las flashcards")
              }
            >
              Estudiar todas →
            </button>
          </div>
          {Object.entries(groupedFlashcards).map(([categoryTitle, cards]) => {
            const catId = (cards[0] as FlashCard)?.category?.id;
            return cards.length > 0 ? (
              <CategoryAccordion
                key={categoryTitle}
                title={categoryTitle}
                cards={cards}
                categoryId={catId}
                onStudy={() =>
                  handleStartStudy(
                    cards as FlashCard[],
                    `Categoría: ${categoryTitle}`,
                  )
                }
                onDelete={handleDeleteSavedCard}
                onUpdate={handleUpdateSavedCard}
              />
            ) : null;
          })}
        </>
      ) : null}

      {showCsvImport && (
        <CsvImportModal
          categories={categories}
          onClose={() => setShowCsvImport(false)}
          onImported={() => {
            // reload saved flashcards
            flashCardsApi
              .getFlashCards({ limit: 200 })
              .then((res) => {
                setSavedFlashcards(res.flashcards);
              })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
};

export default FlashcardsPage;
