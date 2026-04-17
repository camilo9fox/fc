import React, { useState } from "react";
import { X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { CreateQuizQuestionRequest, DraftQuizQuestion } from "../../api/quiz";
import { DraftQuizState } from "../../types/quiz.types";
import "./QuizzesPage.css";

interface CreateQuizFormProps {
  onDrafted: (draft: DraftQuizState) => void;
  onCancel: () => void;
}

const CreateQuizForm: React.FC<CreateQuizFormProps> = ({
  onDrafted,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [questions, setQuestions] = useState<CreateQuizQuestionRequest[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = (
    qi: number,
    field: keyof CreateQuizQuestionRequest,
    value: any,
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], [field]: value };
      return next;
    });
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qi].options];
      opts[oi] = value;
      next[qi] = { ...next[qi], options: opts };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      },
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
      return setError("Agrega al menos una pregunta.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim())
        return setError(`Pregunta ${i + 1}: el enunciado es obligatorio.`);
      const validOpts = q.options.filter((o) => o.trim());
      if (validOpts.length < 2)
        return setError(`Pregunta ${i + 1}: necesitas al menos 2 opciones.`);
      if (!q.correct_answer.trim())
        return setError(`Pregunta ${i + 1}: selecciona la respuesta correcta.`);
      if (!validOpts.includes(q.correct_answer))
        return setError(
          `Pregunta ${i + 1}: la respuesta correcta debe ser una de las opciones.`,
        );
    }

    setSaving(true);
    try {
      const draftQuestions: DraftQuizQuestion[] = questions.map((q, i) => ({
        question: q.question.trim(),
        options: q.options.filter((o) => o.trim()),
        correct_answer: q.correct_answer.trim(),
        explanation: q.explanation?.trim() || null,
        order_index: i,
      }));
      onDrafted({
        title: title.trim(),
        categoryId,
        description: description.trim() || undefined,
        questions: draftQuestions,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear el cuestionario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Nuevo cuestionario</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Historia de Chile — Capítulo 3"
          />
        </div>
        <div className="qz-field">
          <label>Descripción (opcional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del cuestionario"
          />
        </div>
        <div className="qz-field">
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

      <div className="qz-questions-list">
        {questions.map((q, qi) => (
          <div key={qi} className="qz-question-block">
            <div className="qz-question-block-header">
              <span className="qz-q-number">Pregunta {qi + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="qz-remove-btn"
                  onClick={() => removeQuestion(qi)}
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="qz-field">
              <label>Enunciado</label>
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                rows={2}
                placeholder="¿Cuál es la capital de Francia?"
              />
            </div>

            <div className="qz-options-form-grid">
              {q.options.map((opt, oi) => (
                <div key={oi} className="qz-option-input-row">
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Opción ${oi + 1}`}
                  />
                  <label className="qz-radio-label">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct_answer === opt && opt.trim() !== ""}
                      onChange={() =>
                        opt.trim() && updateQuestion(qi, "correct_answer", opt)
                      }
                    />
                    Correcta
                  </label>
                </div>
              ))}
            </div>

            <div className="qz-field">
              <label>Explicación (opcional)</label>
              <input
                value={q.explanation || ""}
                onChange={(e) =>
                  updateQuestion(qi, "explanation", e.target.value)
                }
                placeholder="¿Por qué esta es la respuesta correcta?"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="qz-btn-add-question"
        onClick={addQuestion}
      >
        + Agregar pregunta
      </button>

      {error && <p className="qz-error">{error}</p>}

      <div className="qz-form-actions">
        <button type="button" className="qz-btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="qz-btn-primary" disabled={saving}>
          {saving ? "Preparando..." : "Añadir al borrador"}
        </button>
      </div>
    </form>
  );
};

export default CreateQuizForm;
