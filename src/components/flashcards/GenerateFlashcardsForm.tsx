import React, { useState } from "react";
import { flashCardsApi } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";

interface GenerateFlashcardsFormProps {
  onGenerated: (cards: Array<{ question: string; answer: string; options: string[]; source: "ai" | "manual"; categoryId?: string }>) => void;
}

const GenerateFlashcardsForm: React.FC<GenerateFlashcardsFormProps> = ({ onGenerated }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(3);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { categories } = useCategories();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file && !text.trim()) {
      setError("Debes ingresar texto o seleccionar un archivo.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const cards = await flashCardsApi.generateFlashCards(file || undefined, text || undefined, quantity);
      const normalizedCards = cards.map((card) => ({
        ...card,
        source: "ai" as const,
        categoryId: selectedCategoryId || undefined,
      }));
      onGenerated(normalizedCards);
      setText("");
      setFile(null);
      setSelectedCategoryId("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error generando las flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flashcard-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="generateText">Texto para generar flashcards</label>
        <textarea
          id="generateText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Escribe un texto, resumen o pregunta para generar flashcards..."
          disabled={isLoading}
        />
      </div>

      <div className="form-row">
        <label htmlFor="generateFile">Archivo PDF/TXT</label>
        <input
          id="generateFile"
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {file && <span className="selected-file">Archivo: {file.name}</span>}
      </div>

      <div className="form-row compact-row">
        <label htmlFor="generateQuantity">Cantidad de flashcards</label>
        <input
          id="generateQuantity"
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={isLoading}
        />
      </div>

      <div className="form-row">
        <label htmlFor="generateCategory">Categoría (opcional)</label>
        <select
          id="generateCategory"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? "Generando..." : "Generar flashcards"}
      </button>

      {error && <p className="field-error">{error}</p>}
    </form>
  );
};

export default GenerateFlashcardsForm;
