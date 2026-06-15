import React, { useState } from "react";
import { X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";

interface FlashcardDraft {
  question: string;
  answer: string;
  source: "manual";
}

interface CreateFlashcardFormProps {
  onDrafted: (draft: {
    title: string;
    categoryId: string;
    cards: FlashcardDraft[];
  }) => void;
  onCancel: () => void;
}

const EMPTY_CARD: FlashcardDraft = { question: "", answer: "", source: "manual" };

const CreateFlashcardForm: React.FC<CreateFlashcardFormProps> = ({
  onDrafted,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [cards, setCards] = useState<FlashcardDraft[]>([{ ...EMPTY_CARD }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { categories } = useCategories();

  const updateCard = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addCard = () => {
    setCards((prev) => [...prev, { ...EMPTY_CARD }]);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 1) return;
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Debes ingresar un título para el set.");
      return;
    }
    if (!selectedCategoryId) {
      setError("Debes seleccionar un tema de estudio.");
      return;
    }

    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].question.trim()) {
        setError(`Flashcard ${i + 1}: la pregunta es obligatoria.`);
        return;
      }
      if (!cards[i].answer.trim()) {
        setError(`Flashcard ${i + 1}: la respuesta es obligatoria.`);
        return;
      }
    }

    const validCards = cards.map((c) => ({
      question: c.question.trim(),
      answer: c.answer.trim(),
      source: "manual" as const,
    }));

    setSaving(true);
    onDrafted({
      title: title.trim(),
      categoryId: selectedCategoryId,
      cards: validCards,
    });
  };

  return (
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Nuevo set de flashcards</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label htmlFor="manualFormTitle">Título del set</label>
          <input
            id="manualFormTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Biología celular - Unidad 1"
            maxLength={255}
          />
        </div>

        <div className="qz-field">
          <label htmlFor="manualFormCategory">Tema de estudio</label>
          <select
            id="manualFormCategory"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Selecciona un tema</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="qz-questions-list">
        {cards.map((card, i) => (
          <div key={i} className="qz-question-block">
            <div className="qz-question-block-header">
              <span className="qz-q-number">Flashcard {i + 1}</span>
              {cards.length > 1 && (
                <button
                  type="button"
                  className="qz-remove-btn"
                  onClick={() => removeCard(i)}
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="qz-field">
              <label>Pregunta</label>
              <input
                type="text"
                value={card.question}
                onChange={(e) => updateCard(i, "question", e.target.value)}
                placeholder="Escribe la pregunta aquí"
              />
            </div>

            <div className="qz-field">
              <label>Respuesta</label>
              <textarea
                value={card.answer}
                onChange={(e) => updateCard(i, "answer", e.target.value)}
                rows={3}
                placeholder="Escribe la respuesta aquí"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="qz-btn-add-question"
        onClick={addCard}
      >
        + Agregar flashcard
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

export default CreateFlashcardForm;
