import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Pencil,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import {
  trueFalseApi,
  TrueFalseSet,
  TrueFalseQuestion,
  CreateTrueFalseSetRequest,
} from "../../api/trueFalse";
import { attemptsApi } from "../../api/attempts";
import { DraftTFState, setToDraft } from "../../types/trueFalse.types";
import DraftTFStudySession from "./DraftTFStudySession";
import GenerateTFForm from "./GenerateTFForm";
import CreateTFForm from "./CreateTFForm";
import "./TrueFalsePage.css";

const TrueFalsePage: React.FC = () => {
  const [sets, setSets] = useState<TrueFalseSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"manual" | "ai">("manual");
  const [studySet, setStudySet] = useState<TrueFalseSet | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);
  const [draftSet, setDraftSet] = useState<DraftTFState | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [studyingDraft, setStudyingDraft] = useState(false);

  // Per-card question editing state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    setId: string;
    questionId: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<Partial<TrueFalseQuestion>>({});
  const [savingQuestion, setSavingQuestion] = useState(false);

  const { categories, loading: catsLoading } = useCategories();
  const hasCategories = catsLoading || categories.length > 0;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await trueFalseApi.getAll();
        setSets(res.sets);
      } catch {
        setError("No se pudieron cargar los sets de verdadero/falso.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDrafted = (draft: DraftTFState) => {
    setDraftSet(draft);
    setShowCreate(false);
  };

  const handleSaveDraft = async () => {
    if (!draftSet) return;
    setSavingDraft(true);
    try {
      const payload: CreateTrueFalseSetRequest = {
        title: draftSet.title,
        category_id: draftSet.categoryId,
        description: draftSet.description,
        questions: draftSet.questions.map((q) => ({
          statement: q.statement,
          is_true: q.is_true,
          explanation: q.explanation ?? undefined,
          order_index: q.order_index,
        })),
      };
      const saved = await trueFalseApi.create(payload);
      setSets((prev) => [saved, ...prev]);
      setDraftSet(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al guardar el set.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRemoveDraftQuestion = (index: number) => {
    setDraftSet((prev) =>
      prev
        ? { ...prev, questions: prev.questions.filter((_, i) => i !== index) }
        : null,
    );
  };

  const handleStudy = async (set: TrueFalseSet) => {
    if (set.questions && set.questions.length > 0) {
      setStudySet(set);
      return;
    }
    setLoadingDetail(set.id);
    try {
      const full = await trueFalseApi.getById(set.id);
      setStudySet(full);
    } catch {
      setError("No se pudo cargar el set.");
    } finally {
      setLoadingDetail(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este set?")) return;
    try {
      await trueFalseApi.delete(id);
      setSets((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("No se pudo eliminar el set.");
    }
  };

  const toggleCardExpand = async (set: TrueFalseSet) => {
    if (expandedCard === set.id) {
      setExpandedCard(null);
      setEditingQuestion(null);
      return;
    }
    if (!set.questions || set.questions.length === 0) {
      setLoadingDetail(set.id);
      try {
        const full = await trueFalseApi.getById(set.id);
        setSets((prev) => prev.map((s) => (s.id === set.id ? full : s)));
      } catch {
        setError("No se pudieron cargar los enunciados.");
        setLoadingDetail(null);
        return;
      }
      setLoadingDetail(null);
    }
    setExpandedCard(set.id);
    setEditingQuestion(null);
  };

  const startEditQuestion = (setId: string, q: TrueFalseQuestion) => {
    setEditingQuestion({ setId, questionId: q.id });
    setEditForm({
      statement: q.statement,
      is_true: q.is_true,
      explanation: q.explanation ?? "",
    });
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || editForm.statement === undefined) return;
    setSavingQuestion(true);
    try {
      const updated = await trueFalseApi.updateQuestion(
        editingQuestion.setId,
        editingQuestion.questionId,
        {
          statement: editForm.statement,
          is_true: editForm.is_true,
          explanation: editForm.explanation || undefined,
        },
      );
      setSets((prev) =>
        prev.map((set) =>
          set.id === editingQuestion.setId
            ? {
                ...set,
                questions: set.questions?.map((q) =>
                  q.id === updated.id ? updated : q,
                ),
              }
            : set,
        ),
      );
      setEditingQuestion(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "No se pudo guardar el enunciado.",
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  if (studySet) {
    return (
      <DraftTFStudySession
        draft={setToDraft(studySet)}
        onClose={() => setStudySet(null)}
        badge={studySet.category?.title}
        returnLabel="Volver al listado"
        onComplete={(score, total) => {
          attemptsApi
            .recordTrueFalse({
              set_id: studySet.id,
              category_id: studySet.category?.id,
              score,
              total_questions: total,
            })
            .catch(() => {}); // fire-and-forget; don't block the UI
        }}
      />
    );
  }

  if (studyingDraft && draftSet) {
    return (
      <DraftTFStudySession
        draft={draftSet}
        onClose={() => setStudyingDraft(false)}
        onComplete={(score, total) => {
          if (draftSet.categoryId) {
            attemptsApi
              .recordTrueFalse({
                category_id: draftSet.categoryId,
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
      <div className="tf-page">
        <div className="tf-mode-toggle">
          <button
            className={`tf-mode-btn ${createMode === "manual" ? "active" : ""}`}
            onClick={() => setCreateMode("manual")}
          >
            <Pencil size={14} /> Manual
          </button>
          <button
            className={`tf-mode-btn ${createMode === "ai" ? "active" : ""}`}
            onClick={() => setCreateMode("ai")}
          >
            <Sparkles size={14} /> Generar con IA
          </button>
        </div>

        {createMode === "manual" ? (
          <CreateTFForm
            onDrafted={handleDrafted}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <GenerateTFForm
            onDrafted={handleDrafted}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="tf-page">
      <div className="tf-page-header">
        <div>
          <h1 className="tf-page-title">Verdadero o Falso</h1>
          <p className="tf-page-sub">
            Crea y practica sets de enunciados verdadero/falso
          </p>
        </div>
        <button
          className="tf-btn-primary"
          onClick={() => setShowCreate(true)}
          disabled={!hasCategories}
        >
          + Nuevo set
        </button>
      </div>

      {error && <p className="tf-error">{error}</p>}

      {!hasCategories && <NoCategoryBanner feature="sets de V/F" />}

      {draftSet && (
        <section className="tf-draft-panel">
          <div className="tf-draft-header">
            <div>
              <h2 className="tf-draft-title">Borrador: {draftSet.title}</h2>
              <span className="tf-draft-badge">
                {draftSet.questions.length} enunciado
                {draftSet.questions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="tf-draft-actions">
              <button
                className="tf-btn-secondary"
                onClick={() => setDraftSet(null)}
              >
                Descartar
              </button>
              <button
                className="tf-btn-study-draft"
                onClick={() => setStudyingDraft(true)}
                disabled={draftSet.questions.length === 0}
              >
                Estudiar borrador →
              </button>
              <button
                className="tf-btn-primary"
                onClick={handleSaveDraft}
                disabled={savingDraft || draftSet.questions.length === 0}
              >
                {savingDraft ? "Guardando..." : "Guardar set"}
              </button>
            </div>
          </div>
          <div className="tf-draft-questions">
            {draftSet.questions.map((q, i) => (
              <div key={i} className="tf-draft-question">
                <span className="tf-draft-q-badge">
                  {q.is_true ? "V" : "F"}
                </span>
                <span className="tf-draft-q-text">
                  {i + 1}. {q.statement}
                </span>
                <button
                  className="tf-draft-q-remove"
                  onClick={() => handleRemoveDraftQuestion(i)}
                  aria-label="Eliminar enunciado"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="tf-loading">Cargando sets...</div>
      ) : sets.length === 0 ? (
        <div className="tf-empty">
          <div className="tf-empty-icon">
            <CheckSquare size={48} />
          </div>
          <h3>Aún no tienes sets de Verdadero o Falso</h3>
          <p>Crea tu primer set de enunciados</p>
          <button
            className="tf-btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={!hasCategories}
          >
            Crear set
          </button>
        </div>
      ) : (
        <div className="tf-grid">
          {sets.map((set) => (
            <div key={set.id} className="tf-card">
              <div className="tf-card-header">
                {set.category && (
                  <span className="tf-card-category">{set.category.title}</span>
                )}
                <button
                  className="tf-card-delete"
                  onClick={() => handleDelete(set.id)}
                  aria-label="Eliminar"
                >
                  <X size={14} />
                </button>
              </div>
              <h3 className="tf-card-title">{set.title}</h3>
              {set.description && (
                <p className="tf-card-desc">{set.description}</p>
              )}
              <div className="tf-card-footer">
                <span className="tf-card-count">
                  {set.questions?.length ?? "?"} enunciados
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="tf-btn-edit-questions"
                    onClick={() => toggleCardExpand(set)}
                    disabled={loadingDetail === set.id}
                    title="Editar enunciados"
                  >
                    {expandedCard === set.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    Editar
                  </button>
                  <button
                    className="tf-btn-study"
                    onClick={() => handleStudy(set)}
                    disabled={loadingDetail === set.id}
                  >
                    {loadingDetail === set.id ? "Cargando..." : "Estudiar →"}
                  </button>
                </div>
              </div>

              {/* Inline question editor */}
              {expandedCard === set.id && set.questions && (
                <div className="tf-question-list">
                  {set.questions.map((q, idx) => (
                    <div key={q.id} className="tf-question-item">
                      {editingQuestion?.questionId === q.id ? (
                        <div className="tf-question-edit-form">
                          <textarea
                            className="tf-question-edit-input"
                            value={editForm.statement ?? ""}
                            maxLength={2000}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                statement: e.target.value,
                              }))
                            }
                            rows={2}
                          />
                          <div className="tf-is-true-toggle">
                            <label>
                              <input
                                type="radio"
                                name={`is_true-${q.id}`}
                                checked={editForm.is_true === true}
                                onChange={() =>
                                  setEditForm((f) => ({ ...f, is_true: true }))
                                }
                              />{" "}
                              Verdadero
                            </label>
                            <label>
                              <input
                                type="radio"
                                name={`is_true-${q.id}`}
                                checked={editForm.is_true === false}
                                onChange={() =>
                                  setEditForm((f) => ({ ...f, is_true: false }))
                                }
                              />{" "}
                              Falso
                            </label>
                          </div>
                          <input
                            type="text"
                            className="tf-explanation-input"
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
                          <div className="tf-question-edit-actions">
                            <button
                              className="tf-btn-save-question"
                              onClick={handleSaveQuestion}
                              disabled={savingQuestion}
                            >
                              <Check size={13} />
                              {savingQuestion ? "Guardando…" : "Guardar"}
                            </button>
                            <button
                              className="tf-btn-cancel-edit"
                              onClick={() => setEditingQuestion(null)}
                              disabled={savingQuestion}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="tf-question-row">
                          <span
                            className={`tf-q-badge ${q.is_true ? "tf-q-true" : "tf-q-false"}`}
                          >
                            {q.is_true ? "V" : "F"}
                          </span>
                          <span className="tf-question-text">
                            {idx + 1}. {q.statement}
                          </span>
                          <button
                            className="tf-btn-edit-q"
                            onClick={() => startEditQuestion(set.id, q)}
                            title="Editar enunciado"
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

export default TrueFalsePage;
