import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import {
  CreateTrueFalseQuestionRequest,
  DraftTrueFalseQuestion,
} from "../../api/trueFalse";
import { DraftTFState } from "../../types/trueFalse.types";
import "./TrueFalsePage.css";

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
          <X size={16} />
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
                  <Check size={14} /> Verdadero
                </button>
                <button
                  type="button"
                  className={`tf-toggle-btn ${!q.is_true ? "active-false" : ""}`}
                  onClick={() => updateQuestion(qi, "is_true", false)}
                >
                  <X size={14} /> Falso
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

export default CreateTFForm;
