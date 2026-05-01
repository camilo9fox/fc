import React, { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { flashCardsApi } from "../../api/flashcards";
import { useCategories } from "../../hooks/useCategories";
import { useGenerationQueue } from "../../contexts/GenerationQueueContext";
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
  onCancel,
}) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(3);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  const { categories } = useCategories();
  const { enqueue, isModuleQueued } = useGenerationQueue();
  const isBusy = queued || isModuleQueued("flashcards");

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

    const capturedFile = file;
    const capturedText = text;
    const capturedQuantity = quantity;
    const capturedCategoryId = selectedCategoryId;
    const categoryLabel =
      categories.find((c) => c.id === capturedCategoryId)?.title ?? "";

    const result = enqueue({
      moduleType: "flashcards",
      label: `Flashcards${categoryLabel ? ` · ${categoryLabel}` : ""}`,
      startFn: async () => {
        const job = await flashCardsApi.startGenerateFlashCardsJob(
          capturedFile || undefined,
          capturedText || undefined,
          capturedQuantity,
        );
        return job.id;
      },
      pollFn: async (jobId) => {
        const job = await flashCardsApi.getGenerationJob(jobId);
        return {
          status: job.status as any,
          progress: job.progress,
          result: job.result
            ? {
                flashcards: (job.result.flashcards || []).map((card) => ({
                  ...card,
                  source: "ai" as const,
                  categoryId: capturedCategoryId || undefined,
                })),
              }
            : null,
          error: job.error,
        };
      },
    });

    if (!result.success) {
      setError(result.reason ?? "No se pudo agregar a la cola.");
      return;
    }

    setQueued(true);
    setTimeout(() => onCancel(), 1800);
  };

  return (
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Generar flashcards con IA</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label htmlFor="generateCategory">Tema de estudio</label>
          <select
            id="generateCategory"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={isBusy}
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
            disabled={isBusy}
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
          disabled={isBusy}
        />
      </div>

      <div className="qz-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="qz-file-row">
          <label
            className="qz-btn-secondary qz-file-btn"
            style={{ cursor: "pointer" }}
          >
            {file ? (
              <>
                <Paperclip size={14} /> {file.name}
              </>
            ) : (
              "Seleccionar archivo"
            )}
            <input
              id="generateFile"
              type="file"
              accept={ALLOWED_UPLOAD_FORMATS}
              onChange={handleFileChange}
              disabled={isBusy}
              style={{ display: "none" }}
            />
          </label>
          {file && (
            <button
              type="button"
              className="qz-remove-btn"
              onClick={() => setFile(null)}
              disabled={isBusy}
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      {error && <p className="qz-error">{error}</p>}

      {queued && (
        <p className="qz-generating-msg" aria-live="polite">
          ✓ Generación en cola. Recibirás una notificación al terminar.
        </p>
      )}

      <div className="qz-form-actions">
        <button type="button" className="qz-btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="qz-btn-primary"
          type="submit"
          disabled={queued || isModuleQueued("flashcards")}
        >
          {queued || isModuleQueued("flashcards")
            ? "En cola..."
            : "Generar flashcards"}
        </button>
      </div>
    </form>
  );
};

export default GenerateFlashcardsForm;
