import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flashCardsApi, FlashCard, Category } from "../../api/flashcards";
import { quizApi, Quiz } from "../../api/quiz";
import { trueFalseApi, TrueFalseSet } from "../../api/trueFalse";
import StudySession from "../flashcards/StudySession";
import FlashcardsTab from "./FlashcardsTab";
import QuizzesTab from "./QuizzesTab";
import TrueFalseTab from "./TrueFalseTab";

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

        {/* Tabs nav */}
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

        {/* Tab body */}
        <div className="ts-detail-body">
          {loading ? (
            <div className="ts-loading" style={{ padding: "40px 0" }}>
              <div className="ts-spinner" />
              <span>Cargando contenido…</span>
            </div>
          ) : (
            <>
              {tab === "flashcards" && (
                <FlashcardsTab
                  flashcards={flashcards}
                  onStudy={setStudyCards}
                  onNavigate={() => {
                    onClose();
                    navigate("/flashcards");
                  }}
                />
              )}
              {tab === "quizzes" && (
                <QuizzesTab
                  quizzes={quizzes}
                  onNavigate={() => {
                    onClose();
                    navigate("/quizzes");
                  }}
                />
              )}
              {tab === "truefalse" && (
                <TrueFalseTab
                  tfSets={tfSets}
                  onNavigate={() => {
                    onClose();
                    navigate("/truefalse");
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
