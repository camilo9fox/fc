import React, { useEffect, useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import {
  trueFalseApi,
  TrueFalseSet,
  CreateTrueFalseSetRequest,
} from "../../api/trueFalse";
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
    if (!window.confirm("Â¿Eliminar este set?")) return;
    try {
      await trueFalseApi.delete(id);
      setSets((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("No se pudo eliminar el set.");
    }
  };

  if (studySet) {
    return (
      <DraftTFStudySession
        draft={setToDraft(studySet)}
        onClose={() => setStudySet(null)}
        badge={studySet.category?.title}
        returnLabel="Volver al listado"
      />
    );
  }

  if (studyingDraft && draftSet) {
    return (
      <DraftTFStudySession
        draft={draftSet}
        onClose={() => setStudyingDraft(false)}
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
            âœï¸ Manual
          </button>
          <button
            className={`tf-mode-btn ${createMode === "ai" ? "active" : ""}`}
            onClick={() => setCreateMode("ai")}
          >
            âœ¨ Generar con IA
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
                Estudiar borrador â†’
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
                  âœ•
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
          <div className="tf-empty-icon">â˜‘ï¸</div>
          <h3>AÃºn no tienes sets de Verdadero o Falso</h3>
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
                  âœ•
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
                <button
                  className="tf-btn-study"
                  onClick={() => handleStudy(set)}
                  disabled={loadingDetail === set.id}
                >
                  {loadingDetail === set.id ? "Cargando..." : "Estudiar â†’"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrueFalsePage;
