import React, { useEffect, useState } from "react";
import {
  FileText,
  Pencil,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import { quizApi, Quiz, QuizQuestion, CreateQuizRequest } from "../../api/quiz";
import { attemptsApi } from "../../api/attempts";
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

  // Per-card question editing state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    quizId: string;
    questionId: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuizQuestion>>({});
  const [savingQuestion, setSavingQuestion] = useState(false);

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
    if (!window.confirm("¿Eliminar este cuestionario?")) return;
    try {
      await quizApi.delete(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      setError("No se pudo eliminar el cuestionario.");
    }
  };

  const toggleCardExpand = async (quiz: Quiz) => {
    if (expandedCard === quiz.id) {
      setExpandedCard(null);
      setEditingQuestion(null);
      return;
    }
    // Load questions if not yet present
    if (!quiz.questions || quiz.questions.length === 0) {
      setLoadingDetail(quiz.id);
      try {
        const full = await quizApi.getById(quiz.id);
        setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? full : q)));
      } catch {
        setError("No se pudieron cargar las preguntas.");
        setLoadingDetail(null);
        return;
      }
      setLoadingDetail(null);
    }
    setExpandedCard(quiz.id);
    setEditingQuestion(null);
  };

  const startEditQuestion = (quizId: string, q: QuizQuestion) => {
    setEditingQuestion({ quizId, questionId: q.id });
    setEditForm({
      question: q.question,
      options: [...q.options],
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? "",
    });
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !editForm.question || !editForm.options) return;
    setSavingQuestion(true);
    try {
      const updated = await quizApi.updateQuestion(
        editingQuestion.quizId,
        editingQuestion.questionId,
        {
          question: editForm.question,
          options: editForm.options,
          correct_answer: editForm.correct_answer,
          explanation: editForm.explanation || undefined,
        },
      );
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === editingQuestion.quizId
            ? {
                ...quiz,
                questions: quiz.questions?.map((q) =>
                  q.id === updated.id ? updated : q,
                ),
              }
            : quiz,
        ),
      );
      setEditingQuestion(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo guardar la pregunta.");
    } finally {
      setSavingQuestion(false);
    }
  };

  if (studyQuiz) {
    return (
      <DraftQuizStudySession
        draft={quizToDraft(studyQuiz)}
        onClose={() => setStudyQuiz(null)}
        badge={studyQuiz.category?.title}
        returnLabel="Volver al listado"
        onComplete={(score, total) => {
          attemptsApi
            .recordQuiz({
              quiz_id: studyQuiz.id,
              category_id: studyQuiz.category?.id,
              score,
              total_questions: total,
            })
            .catch(() => {}); // fire-and-forget; don't block the UI
        }}
      />
    );
  }

  if (studyingDraft && draftQuiz) {
    return (
      <DraftQuizStudySession
        draft={draftQuiz}
        onClose={() => setStudyingDraft(false)}
        onComplete={(score, total) => {
          if (draftQuiz.categoryId) {
            attemptsApi
              .recordQuiz({
                category_id: draftQuiz.categoryId,
                score,
                total_questions: total,
              })
              .catch(() => {});
          }
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
            Crea y practica cuestionarios de múltiple opción
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
                Estudiar borrador →
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
                  <X size={14} />
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
          <div className="qz-empty-icon">
            <FileText size={48} />
          </div>
          <h3>Aún no tienes cuestionarios</h3>
          <p>Crea tu primer cuestionario de múltiple opción</p>
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
                  <X size={14} />
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
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="qz-btn-edit-questions"
                    onClick={() => toggleCardExpand(quiz)}
                    disabled={loadingDetail === quiz.id}
                    title="Editar preguntas"
                  >
                    {expandedCard === quiz.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    Editar
                  </button>
                  <button
                    className="qz-btn-study"
                    onClick={() => handleStudy(quiz)}
                    disabled={loadingDetail === quiz.id}
                  >
                    {loadingDetail === quiz.id ? "Cargando..." : "Estudiar →"}
                  </button>
                </div>
              </div>

              {/* Inline question editor */}
              {expandedCard === quiz.id && quiz.questions && (
                <div className="qz-question-list">
                  {quiz.questions.map((q, idx) => (
                    <div key={q.id} className="qz-question-item">
                      {editingQuestion?.questionId === q.id ? (
                        <div className="qz-question-edit-form">
                          <textarea
                            className="qz-question-edit-input"
                            value={editForm.question ?? ""}
                            maxLength={2000}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                question: e.target.value,
                              }))
                            }
                            rows={2}
                          />
                          {(editForm.options ?? []).map((opt, oi) => (
                            <div key={oi} className="qz-option-row">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={editForm.correct_answer === opt}
                                onChange={() =>
                                  setEditForm((f) => ({
                                    ...f,
                                    correct_answer: opt,
                                  }))
                                }
                                title="Marcar como respuesta correcta"
                              />
                              <input
                                type="text"
                                className="qz-option-input"
                                value={opt}
                                maxLength={500}
                                onChange={(e) => {
                                  const newOpts = [...(editForm.options ?? [])];
                                  newOpts[oi] = e.target.value;
                                  const wasCorrect =
                                    editForm.correct_answer === opt;
                                  setEditForm((f) => ({
                                    ...f,
                                    options: newOpts,
                                    correct_answer: wasCorrect
                                      ? e.target.value
                                      : f.correct_answer,
                                  }));
                                }}
                              />
                            </div>
                          ))}
                          <input
                            type="text"
                            className="qz-explanation-input"
                            placeholder="Explicación (opcional)"
                            value={editForm.explanation ?? ""}
                            maxLength={2000}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                explanation: e.target.value,
                              }))
                            }
                          />
                          <div className="qz-question-edit-actions">
                            <button
                              className="qz-btn-save-question"
                              onClick={handleSaveQuestion}
                              disabled={savingQuestion}
                            >
                              <Check size={13} />
                              {savingQuestion ? "Guardando…" : "Guardar"}
                            </button>
                            <button
                              className="qz-btn-cancel-edit"
                              onClick={() => setEditingQuestion(null)}
                              disabled={savingQuestion}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="qz-question-row">
                          <span className="qz-question-num">{idx + 1}.</span>
                          <span className="qz-question-text">{q.question}</span>
                          <button
                            className="qz-btn-edit-q"
                            onClick={() => startEditQuestion(quiz.id, q)}
                            title="Editar pregunta"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
