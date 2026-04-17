import React, { useState } from "react";
import { X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";

interface CreateFlashcardFormProps {
  onCreated: (card: {
    question: string;
    answer: string;
    source: "manual";
    categoryId?: string;
  }) => void;
  onCancel: () => void;
}

const CreateFlashcardForm: React.FC<CreateFlashcardFormProps> = ({
  onCreated,
  onCancel,
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { categories } = useCategories();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      setError("Pregunta y respuesta son obligatorias.");
      return;
    }

    if (!selectedCategoryId) {
      setError("Debes seleccionar un tema de estudio.");
      return;
    }

    const card = {
      question: question.trim(),
      answer: answer.trim(),
      source: "manual" as const,
      categoryId: selectedCategoryId || undefined,
    };
    onCreated(card);
    setQuestion("");
    setAnswer("");
    setSelectedCategoryId("");
    setError(null);
  };

  return (
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Nueva flashcard</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label htmlFor="manualQuestion">Pregunta</label>
          <input
            id="manualQuestion"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escribe la pregunta aquí"
          />
        </div>

        <div className="qz-field">
          <label htmlFor="manualAnswer">Respuesta</label>
          <textarea
            id="manualAnswer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder="Escribe la respuesta aquí"
          />
        </div>

        <div className="qz-field">
          <label htmlFor="manualCategory">Tema de estudio</label>
          <select
            id="manualCategory"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
          >
            <option value="">Selecciona un tema</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="qz-error">{error}</p>}

      <div className="qz-form-actions">
        <button type="button" className="qz-btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="qz-btn-primary">
          Agregar a borrador
        </button>
      </div>
    </form>
  );
};

export default CreateFlashcardForm;
