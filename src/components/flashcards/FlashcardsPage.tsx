import React, { useEffect, useMemo, useState } from "react";
import { Layers, Pencil, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { flashCardsApi, FlashCard } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";
import StudySession from "./StudySession";
import GenerateFlashcardsForm from "./GenerateFlashcardsForm";
import CreateFlashcardForm from "./CreateFlashcardForm";
import CardRow from "./CardRow";
import CategoryAccordion from "./CategoryAccordion";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import "./FlashcardsPage.css";

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

  const groupedFlashcards = useMemo(() => {
    const grouped: { [key: string]: any[] } = { "Sin categoría": [] };
    savedFlashcards.forEach((card) => {
      const categoryTitle = card.category?.title || "Sin categoría";
      if (!grouped[categoryTitle]) grouped[categoryTitle] = [];
      grouped[categoryTitle].push(card);
    });
    return grouped;
  }, [savedFlashcards]);

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

  if (studyMode && studyCards.length > 0) {
    return (
      <StudySession
        cards={studyCards}
        title={studyTitle}
        onClose={() => setStudyMode(false)}
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
        <button
          className="qz-btn-primary"
          onClick={() => setShowCreate(true)}
          disabled={!hasCategories}
        >
          + Nueva flashcard
        </button>
      </div>

      {error && <p className="qz-error">{error}</p>}

      {!hasCategories && <NoCategoryBanner feature="flashcards" />}

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
        <div className="qz-loading">Cargando tus flashcards...</div>
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
          {Object.entries(groupedFlashcards).map(([categoryTitle, cards]) =>
            cards.length > 0 ? (
              <CategoryAccordion
                key={categoryTitle}
                title={categoryTitle}
                cards={cards}
                onStudy={() =>
                  handleStartStudy(
                    cards as FlashCard[],
                    `Categoría: ${categoryTitle}`,
                  )
                }
                onDelete={handleDeleteSavedCard}
              />
            ) : null,
          )}
        </>
      ) : null}
    </div>
  );
};

export default FlashcardsPage;
