import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { flashCardsApi, FlashCard } from "../../api/flashcards";
import FlashcardPreview from "./FlashcardPreview";
import StudySession from "./StudySession";
import GenerateFlashcardsForm from "./GenerateFlashcardsForm";
import CreateFlashcardForm from "./CreateFlashcardForm";
import CategoryManager from "./CategoryManager";
import "./FlashcardsPage.css";

const menuItems = [
  {
    id: "my",
    label: "Mis flashcards",
    description: "Organiza y estudia por categoria",
    icon: "01",
    path: "/flashcards",
  },
  {
    id: "create",
    label: "Crear flashcards",
    description: "Carga tarjetas manuales en borrador",
    icon: "02",
    path: "/flashcards/create",
  },
  {
    id: "generate",
    label: "Generar con IA",
    description: "Convierte texto o archivos en tarjetas",
    icon: "03",
    path: "/flashcards/generate",
  },
];

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
  const navigate = useNavigate();
  const location = useLocation();
  const [draftFlashcards, setDraftFlashcards] = useState<DraftFlashcard[]>([]);
  const [savedFlashcards, setSavedFlashcards] = useState<FlashCard[]>([]);
  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [studyMode, setStudyMode] = useState(false);
  const [studyTitle, setStudyTitle] = useState("Estudio de flashcards");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeItem = useMemo(
    () =>
      menuItems.find((item) => location.pathname === item.path) || menuItems[0],
    [location.pathname],
  );

  // Group flashcards by category
  const groupedFlashcards = useMemo(() => {
    const grouped: { [key: string]: any[] } = { "Sin categoría": [] };

    savedFlashcards.forEach((card) => {
      const categoryTitle = card.category?.title || "Sin categoría";
      if (!grouped[categoryTitle]) {
        grouped[categoryTitle] = [];
      }
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

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

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

  const renderActiveSection = () => {
    switch (activeItem.id) {
      case "create":
        return (
          <section className="flashcards-section">
            <div className="section-heading">
              <h2>Crear flashcard manual</h2>
              <p>
                Agrega una flashcard con pregunta, respuesta y pistas. Se
                guardará en el borrador hasta que pulses{" "}
                <strong>Guardar flashcards</strong>.
              </p>
            </div>
            <CreateFlashcardForm onCreated={handleAddManual} />
          </section>
        );
      case "generate":
        return (
          <section className="flashcards-section">
            <div className="section-heading">
              <h2>Generar flashcards con IA</h2>
              <p>
                Sube un PDF o pega texto y la IA creará tarjetas de estudio
                automáticamente.
              </p>
            </div>
            <GenerateFlashcardsForm onGenerated={handleAddGenerated} />
          </section>
        );
      case "my": {
        const nonEmptyCategories = Object.values(groupedFlashcards).filter(
          (cards) => cards.length > 0,
        ).length;
        return (
          <>
            {/* Stats cards */}
            <div className="fc-stats-row">
              <div className="fc-stat-card">
                <div className="fc-stat-icon purple">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="fc-stat-body">
                  <p className="fc-stat-value">
                    {loading ? "—" : savedFlashcards.length}
                  </p>
                  <p className="fc-stat-label">Flashcards guardadas</p>
                </div>
              </div>
              <div className="fc-stat-card">
                <div className="fc-stat-icon pink">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="fc-stat-body">
                  <p className="fc-stat-value">
                    {loading ? "—" : nonEmptyCategories}
                  </p>
                  <p className="fc-stat-label">Categorías activas</p>
                </div>
              </div>
              <div className="fc-stat-card">
                <div className="fc-stat-icon orange">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div className="fc-stat-body">
                  <p className="fc-stat-value">{draftFlashcards.length}</p>
                  <p className="fc-stat-label">En borrador</p>
                </div>
              </div>
              <div className="fc-stat-card">
                <div className="fc-stat-icon teal">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="fc-stat-body">
                  <p className="fc-stat-value">IA</p>
                  <p className="fc-stat-label">Generación activa</p>
                </div>
              </div>
            </div>

            <section className="flashcards-section">
              <div className="section-heading">
                <h2>Gestionar categorías</h2>
                <p>
                  Crea categorías para organizar tus flashcards y estudiarlas
                  por grupo.
                </p>
              </div>
              <CategoryManager />
            </section>
          </>
        );
      }
    }
  };

  return (
    <div className="flashcards-page">
      {studyMode && studyCards.length > 0 && (
        <StudySession
          cards={studyCards}
          title={studyTitle}
          onClose={() => setStudyMode(false)}
        />
      )}

      <div className="flashcards-content">
        {renderActiveSection()}

        <section className="flashcards-section">
          <div className="draft-header">
            <div>
              <h2>Borrador</h2>
              <p>
                Flashcards pendientes de guardar.{" "}
                {draftFlashcards.length > 0 && (
                  <span className="draft-count-badge">
                    {draftFlashcards.length}
                  </span>
                )}
              </p>
            </div>
            <div className="draft-actions">
              <button
                className="flashcards-save-button"
                onClick={handleSaveDrafts}
                disabled={saving || draftFlashcards.length === 0}
              >
                {saving ? "Guardando..." : "Guardar flashcards"}
              </button>
              <button
                className="primary-button"
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
                disabled={draftFlashcards.length === 0}
              >
                Estudiar borrador
              </button>
            </div>
          </div>

          {draftFlashcards.length === 0 ? (
            <p className="flashcards-empty">No hay flashcards en borrador.</p>
          ) : (
            <div className="flashcards-list">
              {draftFlashcards.map((card, index) => (
                <FlashcardPreview
                  key={`${card.question}-${index}`}
                  flashcard={card}
                  onDelete={() => handleRemoveDraft(index)}
                />
              ))}
            </div>
          )}

          {error && <div className="flashcards-error">{error}</div>}
        </section>

        <section className="flashcards-section">
          <div className="saved-header">
            <div>
              <h2>Flashcards guardadas</h2>
              <p>Estudia por categoría o lanza todas a la vez.</p>
            </div>
            <button
              className="primary-button"
              onClick={() =>
                handleStartStudy(
                  savedFlashcards,
                  "Estudio de flashcards guardadas",
                )
              }
              disabled={savedFlashcards.length === 0}
            >
              Estudiar todas
            </button>
          </div>
          {loading ? (
            <p>Cargando tus flashcards...</p>
          ) : Object.keys(groupedFlashcards).length === 0 ? (
            <p className="flashcards-empty">
              Aún no tienes flashcards guardadas.
            </p>
          ) : (
            <div className="categories-container">
              {Object.entries(groupedFlashcards).map(
                ([categoryTitle, cards]) => (
                  <div key={categoryTitle} className="category-section">
                    <div className="category-title-row">
                      <h3 className="category-title">{categoryTitle}</h3>
                      <button
                        className="secondary-button small"
                        onClick={() =>
                          handleStartStudy(cards, `Estudio: ${categoryTitle}`)
                        }
                        disabled={cards.length === 0}
                      >
                        Estudiar categoría
                      </button>
                    </div>
                    {cards.length === 0 ? (
                      <p className="flashcards-empty">
                        No hay flashcards en esta categoría.
                      </p>
                    ) : (
                      <div className="flashcards-list">
                        {cards.map((card, index) => (
                          <FlashcardPreview
                            key={`${card.question}-${index}`}
                            flashcard={card}
                            onDelete={() => handleDeleteSavedCard(card.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FlashcardsPage;
