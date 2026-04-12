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
  options: string[];
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
    setSaving(true);
    setError(null);

    try {
      const result = await flashCardsApi.saveFlashCards(draftFlashcards);
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
            <h2>Crear flashcard manual</h2>
            <p>
              Agrega una flashcard con pregunta, respuesta y pistas. Se guardará
              en el borrador hasta que pulses{" "}
              <strong>Guardar flashcards</strong>.
            </p>
            <CreateFlashcardForm onCreated={handleAddManual} />
          </section>
        );
      case "generate":
        return (
          <section className="flashcards-section">
            <h2>Generar flashcards con IA</h2>
            <p>Usa texto o un archivo para generar flashcards automáticas.</p>
            <GenerateFlashcardsForm onGenerated={handleAddGenerated} />
          </section>
        );
      case "my":
        return (
          <section className="flashcards-section">
            <h2>Bienvenido a tus flashcards</h2>
            <p>
              Organiza tus flashcards por categorías. Crea categorías primero y
              luego asigna flashcards a ellas.
            </p>
            <CategoryManager />
          </section>
        );
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

      <section className="flashcards-hero">
        <p className="flashcards-kicker">Workspace de estudio</p>
        <h1>Flashcards</h1>
        <p>
          Crea, genera y organiza tus tarjetas en un flujo rapido. Tu panel de
          estudio 3D se mantiene igual.
        </p>
      </section>

      <div className="flashcards-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flashcards-menu-button ${activeItem?.id === item.id ? "active" : ""}`}
            onClick={() => handleMenuClick(item.path)}
          >
            <span className="menu-item-icon">{item.icon}</span>
            <span className="menu-item-content">
              <span className="menu-item-label">{item.label}</span>
              <span className="menu-item-description">{item.description}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flashcards-content">
        {renderActiveSection()}

        <section className="flashcards-section">
          <div className="draft-header">
            <div>
              <h2>Draft de flashcards</h2>
              <p>
                Las flashcards generadas o creadas manualmente se guardan aquí
                hasta que pulses <strong>Guardar flashcards</strong>.
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
              <p>
                Estudia tus tarjetas guardadas, ve categoría por categoría y
                elimina las que ya no necesites.
              </p>
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
