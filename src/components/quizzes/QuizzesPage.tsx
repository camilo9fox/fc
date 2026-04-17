import React, { useEffect, useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import { quizApi, Quiz, CreateQuizRequest } from "../../api/quiz";
import { DraftQuizState, quizToDraft } from "../../types/quiz.types";
import DraftQuizStudySession from "./DraftQuizStudySession";
import GenerateQuizForm from "./GenerateQuizForm";
import CreateQuizForm from "./CreateQuizForm";
import "./QuizzesPage.css";

const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"manual" | "ai">("manual");
  const [studyQuiz, setStudyQuiz] = useState<Quiz | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);
  const [draftQuiz, setDraftQuiz] = useState<DraftQuizState | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [studyingDraft, setStudyingDraft] = useState(false);
  const { categories, loading: catsLoading } = useCategories();
  const hasCategories = catsLoading || categories.length > 0;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizApi.getAll();
        setQuizzes(res.quizzes);
      } catch {
        setError("No se pudieron cargar los cuestionarios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDrafted = (draft: DraftQuizState) => {
    setDraftQuiz(draft);
    setShowCreate(false);
  };

  const handleSaveDraft = async () => {
    if (!draftQuiz) return;
    setSavingDraft(true);
    try {
      const payload: CreateQuizRequest = {
        title: draftQuiz.title,
        category_id: draftQuiz.categoryId,
        description: draftQuiz.description,
        questions: draftQuiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation ?? undefined,
          order_index: q.order_index,
        })),
      };
      const saved = await quizApi.create(payload);
      setQuizzes((prev) => [saved, ...prev]);
      setDraftQuiz(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Error al guardar el cuestionario.",
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRemoveDraftQuestion = (index: number) => {
    setDraftQuiz((prev) =>
      prev
        ? { ...prev, questions: prev.questions.filter((_, i) => i !== index) }
        : null,
    );
  };

  const handleStudy = async (quiz: Quiz) => {
    if (quiz.questions && quiz.questions.length > 0) {
      setStudyQuiz(quiz);
      return;
    }
    setLoadingDetail(quiz.id);
    try {
      const full = await quizApi.getById(quiz.id);
      setStudyQuiz(full);
    } catch {
      setError("No se pudo cargar el cuestionario.");
    } finally {
      setLoadingDetail(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Â¿Eliminar este cuestionario?")) return;
    try {
      await quizApi.delete(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      setError("No se pudo eliminar el cuestionario.");
    }
  };

  if (studyQuiz) {
    return (
      <DraftQuizStudySession
        draft={quizToDraft(studyQuiz)}
        onClose={() => setStudyQuiz(null)}
        badge={studyQuiz.category?.title}
        returnLabel="Volver al listado"
      />
    );
  }

  if (studyingDraft && draftQuiz) {
    return (
      <DraftQuizStudySession
        draft={draftQuiz}
        onClose={() => setStudyingDraft(false)}
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
            âœï¸ Manual
          </button>
          <button
            className={`qz-mode-btn ${createMode === "ai" ? "active" : ""}`}
            onClick={() => setCreateMode("ai")}
          >
            âœ¨ Generar con IA
          </button>
        </div>

        {createMode === "manual" ? (
          <CreateQuizForm
            onDrafted={handleDrafted}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <GenerateQuizForm
            onDrafted={handleDrafted}
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
          <h1 className="qz-page-title">Cuestionarios</h1>
          <p className="qz-page-sub">
            Crea y practica cuestionarios de mÃºltiple opciÃ³n
          </p>
        </div>
        <button
          className="qz-btn-primary"
          onClick={() => setShowCreate(true)}
          disabled={!hasCategories}
        >
          + Nuevo cuestionario
        </button>
      </div>

      {error && <p className="qz-error">{error}</p>}

      {!hasCategories && <NoCategoryBanner feature="cuestionarios" />}

      {draftQuiz && (
        <section className="qz-draft-panel">
          <div className="qz-draft-header">
            <div>
              <h2 className="qz-draft-title">Borrador: {draftQuiz.title}</h2>
              <span className="qz-draft-badge">
                {draftQuiz.questions.length} pregunta
                {draftQuiz.questions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="qz-draft-actions">
              <button
                className="qz-btn-secondary"
                onClick={() => setDraftQuiz(null)}
              >
                Descartar
              </button>
              <button
                className="qz-btn-study-draft"
                onClick={() => setStudyingDraft(true)}
                disabled={draftQuiz.questions.length === 0}
              >
                Estudiar borrador â†’
              </button>
              <button
                className="qz-btn-primary"
                onClick={handleSaveDraft}
                disabled={savingDraft || draftQuiz.questions.length === 0}
              >
                {savingDraft ? "Guardando..." : "Guardar cuestionario"}
              </button>
            </div>
          </div>
          <div className="qz-draft-questions">
            {draftQuiz.questions.map((q, i) => (
              <div key={i} className="qz-draft-question">
                <span className="qz-draft-q-text">
                  {i + 1}. {q.question}
                </span>
                <button
                  className="qz-draft-q-remove"
                  onClick={() => handleRemoveDraftQuestion(i)}
                  aria-label="Eliminar pregunta"
                >
                  âœ•
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="qz-loading">Cargando cuestionarios...</div>
      ) : quizzes.length === 0 ? (
        <div className="qz-empty">
          <div className="qz-empty-icon">ðŸ“</div>
          <h3>AÃºn no tienes cuestionarios</h3>
          <p>Crea tu primer cuestionario de mÃºltiple opciÃ³n</p>
          <button
            className="qz-btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={!hasCategories}
          >
            Crear cuestionario
          </button>
        </div>
      ) : (
        <div className="qz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="qz-card">
              <div className="qz-card-header">
                {quiz.category && (
                  <span className="qz-card-category">
                    {quiz.category.title}
                  </span>
                )}
                <button
                  className="qz-card-delete"
                  onClick={() => handleDelete(quiz.id)}
                  aria-label="Eliminar"
                >
                  âœ•
                </button>
              </div>
              <h3 className="qz-card-title">{quiz.title}</h3>
              {quiz.description && (
                <p className="qz-card-desc">{quiz.description}</p>
              )}
              <div className="qz-card-footer">
                <span className="qz-card-count">
                  {quiz.questions?.length ?? "?"} preguntas
                </span>
                <button
                  className="qz-btn-study"
                  onClick={() => handleStudy(quiz)}
                  disabled={loadingDetail === quiz.id}
                >
                  {loadingDetail === quiz.id ? "Cargando..." : "Estudiar â†’"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
