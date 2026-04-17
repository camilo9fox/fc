import React, { useState } from "react";
import { FlashcardGenerationJob, flashCardsApi } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";
import {
  ALLOWED_UPLOAD_FORMATS,
  MAX_FLASHCARDS_GENERATED,
} from "../../constants";

interface GenerateFlashcardsFormProps {
  onGenerated: (
    cards: Array<{
      question: string;
      answer: string;
      source: "ai" | "manual";
      categoryId?: string;
    }>,
  ) => void;
  onCancel: () => void;
}

const GenerateFlashcardsForm: React.FC<GenerateFlashcardsFormProps> = ({
  onGenerated,
  onCancel,
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

    if (!selectedCategoryId) {
      setError("Debes seleccionar un tema de estudio.");
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
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Generar flashcards con IA</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label htmlFor="generateCategory">Tema de estudio</label>
          <select
            id="generateCategory"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={isLoading}
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

        <div className="qz-field">
          <label htmlFor="generateQuantity">
            Cantidad de flashcards (1 – 10)
          </label>
          <input
            id="generateQuantity"
            type="number"
            min={1}
            max={MAX_FLASHCARDS_GENERATED}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="qz-field">
        <label htmlFor="generateText">Texto de estudio</label>
        <textarea
          id="generateText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Pega aquí el contenido del que quieres generar flashcards..."
          disabled={isLoading}
        />
      </div>

      <div className="qz-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="qz-file-row">
          <label
            className="qz-btn-secondary qz-file-btn"
            style={{ cursor: "pointer" }}
          >
            {file ? `📄 ${file.name}` : "Seleccionar archivo"}
            <input
              id="generateFile"
              type="file"
              accept={ALLOWED_UPLOAD_FORMATS}
              onChange={handleFileChange}
              disabled={isLoading}
              style={{ display: "none" }}
            />
          </label>
          {file && (
            <button
              type="button"
              className="qz-remove-btn"
              onClick={() => setFile(null)}
              disabled={isLoading}
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      {error && <p className="qz-error">{error}</p>}

      {job && (
        <div className="qz-generating-msg" aria-live="polite">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
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
            <p style={{ marginTop: 6, fontSize: "0.85rem" }}>
              Secciones procesadas: {job.progress.metadata.completed} /{" "}
              {job.progress.metadata.total}
            </p>
          )}
        </div>
      )}

      <div className="qz-form-actions">
        <button
          type="button"
          className="qz-btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button className="qz-btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? "Procesando documento..." : "Generar flashcards"}
        </button>
      </div>
    </form>
  );
};

export default GenerateFlashcardsForm;
