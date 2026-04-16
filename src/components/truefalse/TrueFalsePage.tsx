import React, { useEffect, useRef, useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import {
  trueFalseApi,
  TrueFalseSet,
  TrueFalseQuestion,
  CreateTrueFalseSetRequest,
  CreateTrueFalseQuestionRequest,
  DraftTrueFalseQuestion,
} from "../../api/trueFalse";
import "./TrueFalsePage.css";

interface DraftTFState {
  title: string;
  categoryId: string;
  description?: string;
  questions: DraftTrueFalseQuestion[];
}

// ─── Study Session ─────────────────────────────────────────────────────────────

/** Convierte un TrueFalseSet guardado en DraftTFState para reutilizar DraftTFStudySession */
const setToDraft = (set: TrueFalseSet): DraftTFState => ({
  title: set.title,
  categoryId: set.category?.id || "",
  description: set.description ?? undefined,
  questions: (set.questions || []).map((q, i) => ({
    statement: q.statement,
    is_true: q.is_true,
    explanation: q.explanation ?? null,
    order_index: i,
  })),
});

interface DraftTFStudyProps {
  draft: DraftTFState;
  onClose: () => void;
  badge?: string;
  returnLabel?: string;
}

const DraftTFStudySession: React.FC<DraftTFStudyProps> = ({
  draft,
  onClose,
  badge = "Borrador",
  returnLabel = "Volver al borrador",
}) => {
  const questions = draft.questions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handleAnswer = (answer: boolean) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === current.is_true) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚";
    const ringColor = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
    return (
      <div className="dtf-result">
        <div className="dtf-result-card">
          <div className="dtf-result-emoji">{emoji}</div>
          <div
            className="dtf-score-ring"
            style={
              {
                "--dtf-ring-color": ringColor,
                "--dtf-pct": `${pct}%`,
              } as React.CSSProperties
            }
          >
            <span className="dtf-score-pct">{pct}%</span>
            <span className="dtf-score-sub">aciertos</span>
          </div>
          <h2 className="dtf-result-title">{draft.title}</h2>
          <p className="dtf-result-detail">
            {score} de {questions.length} respuestas correctas
          </p>
          <div className="dtf-result-actions">
            <button className="dtf-btn-primary" onClick={handleRestart}>
              Intentar de nuevo
            </button>
            <button className="dtf-btn-secondary" onClick={onClose}>
              {returnLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = selected !== null && selected === current.is_true;
  const showFeedback = selected !== null;

  return (
    <div className="dtf-overlay">
      <header className="dtf-header">
        <div className="dtf-header-left">
          {badge && <span className="dtf-draft-label">{badge}</span>}
          <h2 className="dtf-title">{draft.title}</h2>
        </div>
        <div className="dtf-header-right">
          <span className="dtf-counter">
            {index + 1} / {questions.length}
          </span>
          <button
            className="dtf-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="dtf-progress-bar">
        <div
          className="dtf-progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="dtf-body">
        <div className="dtf-card" key={index}>
          <p className="dtf-question-num">Enunciado {index + 1}</p>
          <p className="dtf-statement-text">{current.statement}</p>

          {!showFeedback && (
            <div className="dtf-answer-row">
              <button
                className="dtf-btn-true"
                onClick={() => handleAnswer(true)}
              >
                ✓ Verdadero
              </button>
              <button
                className="dtf-btn-false"
                onClick={() => handleAnswer(false)}
              >
                ✗ Falso
              </button>
            </div>
          )}

          {showFeedback && (
            <>
              <div
                className={`dtf-feedback ${isCorrect ? "correct" : "wrong"}`}
              >
                <span className="dtf-feedback-icon">
                  {isCorrect ? "✓" : "✗"}
                </span>
                <span>
                  {isCorrect
                    ? "¡Correcto!"
                    : `Incorrecto — era ${current.is_true ? "Verdadero" : "Falso"}`}
                </span>
              </div>

              {current.explanation && (
                <div className="dtf-explanation">
                  <strong>Explicación:</strong> {current.explanation}
                </div>
              )}

              <button className="dtf-next-btn" onClick={handleNext}>
                {index + 1 >= questions.length
                  ? "Ver resultado →"
                  : "Siguiente →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Generate Form (IA) ────────────────────────────────────────────────────────

interface GenerateTFFormProps {
  onDrafted: (draft: DraftTFState) => void;
  onCancel: () => void;
}

const GenerateTFForm: React.FC<GenerateTFFormProps> = ({
  onDrafted,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("El título es obligatorio.");
    if (!categoryId) return setError("Debes seleccionar una categoría.");
    if (!file && !text.trim())
      return setError("Proporciona un archivo o texto de estudio.");

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("categoryId", categoryId);
      formData.append("quantity", String(quantity));
      if (file) formData.append("file", file);
      if (text.trim()) formData.append("text", text.trim());

      const result = await trueFalseApi.generate(formData);
      onDrafted({
        title: title.trim(),
        categoryId,
        questions: result.questions,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Error al generar el set de verdadero/falso.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form className="tf-form" onSubmit={handleSubmit}>
      <div className="tf-form-header">
        <h2>Generar set V/F con IA</h2>
        <button type="button" className="tf-close-btn" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="tf-form-meta">
        <div className="tf-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Anatomía — Aparato Digestivo"
          />
        </div>
        <div className="tf-field">
          <label>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="tf-field">
          <label>Número de enunciados (1 – 30)</label>
          <input
            type="number"
            min={1}
            max={30}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(30, Math.max(1, parseInt(e.target.value) || 10)),
              )
            }
          />
        </div>
      </div>

      <div className="tf-field">
        <label>Texto de estudio</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Pega aquí el contenido del que quieres generar enunciados..."
        />
      </div>

      <div className="tf-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="tf-file-row">
          <button
            type="button"
            className="tf-btn-secondary tf-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? `📄 ${file.name}` : "Seleccionar archivo"}
          </button>
          {file && (
            <button
              type="button"
              className="tf-remove-btn"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Quitar
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="tf-error">{error}</p>}

      {generating && (
        <p className="tf-generating-msg">
          ✨ Generando {quantity} enunciados con IA…
        </p>
      )}

      <div className="tf-form-actions">
        <button
          type="button"
          className="tf-btn-secondary"
          onClick={onCancel}
          disabled={generating}
        >
          Cancelar
        </button>
        <button type="submit" className="tf-btn-primary" disabled={generating}>
          {generating ? "Generando..." : "Generar set"}
        </button>
      </div>
    </form>
  );
};

// ─── Create Form ───────────────────────────────────────────────────────────────

interface CreateTFFormProps {
  onDrafted: (draft: DraftTFState) => void;
  onCancel: () => void;
}

const CreateTFForm: React.FC<CreateTFFormProps> = ({ onDrafted, onCancel }) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [questions, setQuestions] = useState<CreateTrueFalseQuestionRequest[]>([
    { statement: "", is_true: true, explanation: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = (
    qi: number,
    field: keyof CreateTrueFalseQuestionRequest,
    value: any,
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], [field]: value };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { statement: "", is_true: true, explanation: "" },
    ]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("El título es obligatorio.");
    if (!categoryId) return setError("Debes seleccionar una categoría.");
    if (questions.length === 0)
      return setError("Agrega al menos un enunciado.");

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].statement.trim()) {
        return setError(`Enunciado ${i + 1}: el texto es obligatorio.`);
      }
    }

    setSaving(true);
    try {
      const draftQuestions: DraftTrueFalseQuestion[] = questions.map(
        (q, i) => ({
          statement: q.statement.trim(),
          is_true: q.is_true,
          explanation: q.explanation?.trim() || null,
          order_index: i,
        }),
      );
      onDrafted({
        title: title.trim(),
        categoryId,
        description: description.trim() || undefined,
        questions: draftQuestions,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="tf-form" onSubmit={handleSubmit}>
      <div className="tf-form-header">
        <h2>Nuevo set — Verdadero o Falso</h2>
        <button type="button" className="tf-close-btn" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="tf-form-meta">
        <div className="tf-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Anatomía — Aparato Digestivo"
          />
        </div>
        <div className="tf-field">
          <label>Descripción (opcional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del set"
          />
        </div>
        <div className="tf-field">
          <label>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tf-questions-list">
        {questions.map((q, qi) => (
          <div key={qi} className="tf-question-block">
            <div className="tf-question-block-header">
              <span className="tf-q-number">Enunciado {qi + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="tf-remove-btn"
                  onClick={() => removeQuestion(qi)}
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="tf-field">
              <label>Texto del enunciado</label>
              <textarea
                value={q.statement}
                onChange={(e) =>
                  updateQuestion(qi, "statement", e.target.value)
                }
                rows={2}
                placeholder="La fotosíntesis ocurre en las mitocondrias."
              />
            </div>

            <div className="tf-truth-toggle">
              <span className="tf-truth-label">¿Es verdadero?</span>
              <div className="tf-toggle-group">
                <button
                  type="button"
                  className={`tf-toggle-btn ${q.is_true ? "active-true" : ""}`}
                  onClick={() => updateQuestion(qi, "is_true", true)}
                >
                  ✓ Verdadero
                </button>
                <button
                  type="button"
                  className={`tf-toggle-btn ${!q.is_true ? "active-false" : ""}`}
                  onClick={() => updateQuestion(qi, "is_true", false)}
                >
                  ✗ Falso
                </button>
              </div>
            </div>

            <div className="tf-field">
              <label>Explicación (opcional)</label>
              <input
                value={q.explanation || ""}
                onChange={(e) =>
                  updateQuestion(qi, "explanation", e.target.value)
                }
                placeholder="¿Por qué es verdadero o falso?"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="tf-btn-add-question"
        onClick={addQuestion}
      >
        + Agregar enunciado
      </button>

      {error && <p className="tf-error">{error}</p>}

      <div className="tf-form-actions">
        <button type="button" className="tf-btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="tf-btn-primary" disabled={saving}>
          {saving ? "Preparando..." : "Añadir al borrador"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

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
    if (!window.confirm("¿Eliminar este set?")) return;
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
            ✏️ Manual
          </button>
          <button
            className={`tf-mode-btn ${createMode === "ai" ? "active" : ""}`}
            onClick={() => setCreateMode("ai")}
          >
            ✨ Generar con IA
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
                  ✕
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
          <div className="tf-empty-icon">☑️</div>
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
                  ✕
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
                  {loadingDetail === set.id ? "Cargando..." : "Estudiar →"}
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
