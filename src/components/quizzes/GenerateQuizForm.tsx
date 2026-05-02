import React, { useCallback, useEffect, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import {
  ALLOWED_UPLOAD_FORMATS,
  MAX_QUIZ_QUESTIONS_GENERATED,
} from "../../constants";
import { quizApi } from "../../api/quiz";
import { DraftQuizState } from "../../types/quiz.types";
import { useGenerationQueue } from "../../contexts/GenerationQueueContext";
import { AiUsageStatus, statsApi } from "../../api/stats";
import "./QuizzesPage.css";

interface GenerateQuizFormProps {
  onDrafted: (draft: DraftQuizState) => void;
  onCancel: () => void;
}

const GenerateQuizForm: React.FC<GenerateQuizFormProps> = ({ onCancel }) => {
  const { categories } = useCategories();
  const { enqueue, isModuleQueued } = useGenerationQueue();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [queued, setQueued] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<AiUsageStatus | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actionCost = usage?.costs?.quizzes ?? 1;

  const loadUsage = useCallback(async () => {
    setLoadingUsage(true);
    try {
      const data = await statsApi.getAiUsage();
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setLoadingUsage(false);
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

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
    if (
      usage?.enabled &&
      Number.isFinite(usage.creditsRemaining) &&
      usage.creditsRemaining < actionCost
    ) {
      return setError(
        "No tienes créditos IA suficientes para generar un quiz.",
      );
    }

    const capturedTitle = title.trim();
    const capturedCategoryId = categoryId;
    const capturedQuantity = quantity;
    const capturedFile = file;
    const capturedText = text.trim();
    const categoryLabel =
      categories.find((c) => c.id === capturedCategoryId)?.title ?? "";

    const result = enqueue({
      moduleType: "quiz",
      label: `Quiz${categoryLabel ? ` · ${categoryLabel}` : ""}`,
      startFn: async () => {
        const formData = new FormData();
        formData.append("title", capturedTitle);
        formData.append("categoryId", capturedCategoryId);
        formData.append("quantity", String(capturedQuantity));
        if (capturedFile) formData.append("file", capturedFile);
        if (capturedText) formData.append("text", capturedText);
        const job = await quizApi.startGenerateQuizJob(formData);
        return job.id;
      },
      pollFn: async (jobId) => {
        const job = await quizApi.getGenerationJob(jobId);
        return {
          status: job.status as any,
          progress: job.progress,
          result: job.result
            ? ({
                title: capturedTitle,
                categoryId: capturedCategoryId,
                questions: job.result.questions,
              } as DraftQuizState)
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
        <h2>Generar cuestionario con IA</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-usage-box" aria-live="polite">
          {loadingUsage ? (
            <span>Cargando créditos IA...</span>
          ) : usage?.enabled ? (
            <>
              <strong>
                Créditos IA: {usage.creditsRemaining}/{usage.creditsLimit}
              </strong>
              <span>
                Costo por generación de quiz: {actionCost} crédito
                {actionCost === 1 ? "" : "s"}.
              </span>
            </>
          ) : (
            <span>Créditos IA no disponibles por ahora.</span>
          )}
        </div>

        <div className="qz-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Historia de Chile — Capítulo 3"
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
        <div className="qz-field">
          <label>
            Número de preguntas (1 – {MAX_QUIZ_QUESTIONS_GENERATED})
          </label>
          <input
            type="number"
            min={1}
            max={MAX_QUIZ_QUESTIONS_GENERATED}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(
                  MAX_QUIZ_QUESTIONS_GENERATED,
                  Math.max(1, parseInt(e.target.value) || 5),
                ),
              )
            }
          />
        </div>
      </div>

      <div className="qz-field">
        <label>Texto de estudio</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Pega aquí el contenido del que quieres generar preguntas..."
        />
      </div>

      <div className="qz-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="qz-file-row">
          <button
            type="button"
            className="qz-btn-secondary qz-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <>
                <Paperclip size={14} /> {file.name}
              </>
            ) : (
              "Seleccionar archivo"
            )}
          </button>
          {file && (
            <button
              type="button"
              className="qz-remove-btn"
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
          accept={ALLOWED_UPLOAD_FORMATS}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
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
          type="submit"
          className="qz-btn-primary"
          disabled={queued || isModuleQueued("quiz")}
        >
          {queued || isModuleQueued("quiz")
            ? "En cola..."
            : "Generar cuestionario"}
        </button>
      </div>
    </form>
  );
};

export default GenerateQuizForm;
