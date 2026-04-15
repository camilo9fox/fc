import React, { useState } from "react";
import { FlashcardGenerationJob, flashCardsApi } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";

interface GenerateFlashcardsFormProps {
  onGenerated: (
    cards: Array<{
      question: string;
      answer: string;
      options: string[];
      source: "ai" | "manual";
      categoryId?: string;
    }>,
  ) => void;
}

const GenerateFlashcardsForm: React.FC<GenerateFlashcardsFormProps> = ({
  onGenerated,
}) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(3);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState<FlashcardGenerationJob | null>(null);
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
    setJob(null);

    try {
      const initialJob = await flashCardsApi.startGenerateFlashCardsJob(
        file || undefined,
        text || undefined,
        quantity,
      );
      setJob(initialJob);

      let currentJob = initialJob;
      while (
        currentJob.status !== "completed" &&
        currentJob.status !== "failed"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        currentJob = await flashCardsApi.getGenerationJob(initialJob.id);
        setJob(currentJob);
      }

      if (currentJob.status === "failed") {
        throw new Error(currentJob.error || "Error generando las flashcards.");
      }

      const cards = currentJob.result?.flashcards || [];
      const normalizedCards = cards.map((card) => ({
        ...card,
        source: "ai" as const,
        categoryId: selectedCategoryId || undefined,
      }));
      onGenerated(normalizedCards);
      setText("");
      setFile(null);
      setSelectedCategoryId("");
      setJob(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Error generando las flashcards.",
      );
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
        {isLoading ? "Procesando documento..." : "Generar flashcards"}
      </button>

      {job && (
        <div className="generation-job-status" aria-live="polite">
          <div className="generation-job-status-header">
            <strong>{job.progress.stage}</strong>
            <span>{job.progress.percent}%</span>
          </div>
          <div className="generation-job-progress-track">
            <div
              className="generation-job-progress-fill"
              style={{ width: `${job.progress.percent}%` }}
            />
          </div>
          {job.progress.metadata?.completed && job.progress.metadata?.total && (
            <p>
              Secciones procesadas: {job.progress.metadata.completed} /{" "}
              {job.progress.metadata.total}
            </p>
          )}
        </div>
      )}

      {error && <p className="field-error">{error}</p>}
    </form>
  );
};

export default GenerateFlashcardsForm;
