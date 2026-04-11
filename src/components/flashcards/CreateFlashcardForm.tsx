import React, { useState } from "react";
import { useCategories } from "../../hooks/useCategories";

interface CreateFlashcardFormProps {
  onCreated: (card: { question: string; answer: string; options: string[]; source: "manual"; categoryId?: string }) => void;
}

const CreateFlashcardForm: React.FC<CreateFlashcardFormProps> = ({ onCreated }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { categories } = useCategories();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      setError("Pregunta y respuesta son obligatorias.");
      return;
    }

    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const card = {
      question: question.trim(),
      answer: answer.trim(),
      options,
      source: "manual" as const,
      categoryId: selectedCategoryId || undefined,
    };
    onCreated(card);
    setQuestion("");
    setAnswer("");
    setOptionsText("");
    setSelectedCategoryId("");
    setError(null);
  };

  return (
    <form className="flashcard-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="manualQuestion">Pregunta</label>
        <input
          id="manualQuestion"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Escribe la pregunta aquí"
        />
      </div>

      <div className="form-row">
        <label htmlFor="manualAnswer">Respuesta</label>
        <textarea
          id="manualAnswer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          placeholder="Escribe la respuesta aquí"
        />
      </div>

      <div className="form-row">
        <label htmlFor="manualOptions">Opciones (una por línea, opcional)</label>
        <textarea
          id="manualOptions"
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          rows={4}
          placeholder="Describe algunas opciones clave o pistas..."
        />
      </div>

      <div className="form-row">
        <label htmlFor="manualCategory">Categoría (opcional)</label>
        <select
          id="manualCategory"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      <button className="primary-button" type="submit">
        Agregar a borrador
      </button>

      {error && <p className="field-error">{error}</p>}
    </form>
  );
};

export default CreateFlashcardForm;
