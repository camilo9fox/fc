import React, { useEffect, useRef, useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import {
  trueFalseApi,
  TrueFalseSet,
  TrueFalseQuestion,
  CreateTrueFalseSetRequest,
  CreateTrueFalseQuestionRequest,
} from "../../api/trueFalse";
import "./TrueFalsePage.css";

// ─── Study Session ─────────────────────────────────────────────────────────────

interface TFStudyProps {
  set: TrueFalseSet;
  onClose: () => void;
}

const TFStudySession: React.FC<TFStudyProps> = ({ set, onClose }) => {
  const questions = set.questions || [];
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
    return (
      <div className="tf-overlay">
        <div className="tf-result-card">
          <div
            className={`tf-score-circle ${pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"}`}
          >
            <span className="tf-score-pct">{pct}%</span>
            <span className="tf-score-label">Aciertos</span>
          </div>
          <h2 className="tf-result-title">{set.title}</h2>
          <p className="tf-result-sub">
            {score} de {questions.length} respuestas correctas
          </p>
          <div className="tf-result-actions">
            <button className="tf-btn-primary" onClick={handleRestart}>
              Intentar de nuevo
            </button>
            <button className="tf-btn-secondary" onClick={onClose}>
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = selected !== null && selected === current.is_true;
  const showFeedback = selected !== null;

  return (
    <div className="tf-overlay">
      <header className="tf-study-header">
        <h2 className="tf-study-title">{set.title}</h2>
        <div className="tf-study-meta">
          <span className="tf-counter">
            {index + 1} / {questions.length}
          </span>
          <button
            className="tf-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="tf-progress-track">
        <div
          className="tf-progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="tf-study-body">
        <div className="tf-statement-card">
          <p className="tf-statement-text">{current.statement}</p>

          {!showFeedback && (
            <div className="tf-answer-row">
              <button
                className="tf-btn-true"
                onClick={() => handleAnswer(true)}
              >
                ✓ Verdadero
              </button>
              <button
                className="tf-btn-false"
                onClick={() => handleAnswer(false)}
              >
                ✗ Falso
              </button>
            </div>
          )}

          {showFeedback && (
            <>
              <div className={`tf-feedback ${isCorrect ? "correct" : "wrong"}`}>
                <span className="tf-feedback-icon">
                  {isCorrect ? "✓" : "✗"}
                </span>
                <span>
                  {isCorrect
                    ? "¡Correcto!"
                    : `Incorrecto — era ${current.is_true ? "Verdadero" : "Falso"}`}
                </span>
              </div>

              {current.explanation && (
                <div className="tf-explanation">
                  <strong>Explicación:</strong> {current.explanation}
                </div>
              )}

              <button
                className="tf-btn-primary tf-next-btn"
                onClick={handleNext}
              >
                {index + 1 >= questions.length
                  ? "Ver resultado"
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
  onCreated: (set: TrueFalseSet) => void;
  onCancel: () => void;
}

const GenerateTFForm: React.FC<GenerateTFFormProps> = ({
  onCreated,
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

      const created = await trueFalseApi.generate(formData);
      onCreated(created);
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
  onCreated: (set: TrueFalseSet) => void;
  onCancel: () => void;
}

const CreateTFForm: React.FC<CreateTFFormProps> = ({ onCreated, onCancel }) => {
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
      const payload: CreateTrueFalseSetRequest = {
        title: title.trim(),
        category_id: categoryId,
        description: description.trim() || undefined,
        questions: questions.map((q, i) => ({
          statement: q.statement.trim(),
          is_true: q.is_true,
          explanation: q.explanation?.trim() || undefined,
          order_index: i,
        })),
      };
      const created = await trueFalseApi.create(payload);
      onCreated(created);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Error al crear el set de verdadero/falso.",
      );
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
          {saving ? "Guardando..." : "Crear set"}
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

  const handleCreated = (set: TrueFalseSet) => {
    setSets((prev) => [set, ...prev]);
    setShowCreate(false);
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
    return <TFStudySession set={studySet} onClose={() => setStudySet(null)} />;
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
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <GenerateTFForm
            onCreated={handleCreated}
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
        <button className="tf-btn-primary" onClick={() => setShowCreate(true)}>
          + Nuevo set
        </button>
      </div>

      {error && <p className="tf-error">{error}</p>}

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
