import React, { useRef, useState } from "react";
import { Paperclip, Sparkles, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import {
  ALLOWED_UPLOAD_FORMATS,
  MAX_QUIZ_QUESTIONS_GENERATED,
} from "../../constants";
import { quizApi } from "../../api/quiz";
import { DraftQuizState } from "../../types/quiz.types";
import "./QuizzesPage.css";

interface GenerateQuizFormProps {
  onDrafted: (draft: DraftQuizState) => void;
  onCancel: () => void;
}

const GenerateQuizForm: React.FC<GenerateQuizFormProps> = ({
  onDrafted,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] =
    useState<string>("Generando...");
  const [generatingPercent, setGeneratingPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("categoryId", categoryId);
      formData.append("quantity", String(quantity));
      if (file) formData.append("file", file);
      if (text.trim()) formData.append("text", text.trim());

      // Start async job
      const job = await quizApi.startGenerateQuizJob(formData);

      // Poll until done
      const POLL_INTERVAL = 2500;
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const updated = await quizApi.getGenerationJob(job.id);
            setGeneratingStage(updated.progress.stage);
            setGeneratingPercent(updated.progress.percent);

            if (updated.status === "completed" && updated.result) {
              clearInterval(interval);
              onDrafted({
                title: title.trim(),
                categoryId,
                questions: updated.result.questions,
              });
              resolve();
            } else if (updated.status === "failed") {
              clearInterval(interval);
              reject(
                new Error(updated.error || "Error al generar el cuestionario."),
              );
            }
          } catch (pollErr) {
            clearInterval(interval);
            reject(pollErr);
          }
        }, POLL_INTERVAL);
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Error al generar el cuestionario.",
      );
    } finally {
      setGenerating(false);
    }
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

      {generating && (
        <div className="qz-generating-msg">
          <p>
            <Sparkles size={14} /> {generatingStage}
          </p>
          <div className="qz-progress-bar">
            <div
              className="qz-progress-fill"
              style={{ width: `${generatingPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="qz-form-actions">
        <button
          type="button"
          className="qz-btn-secondary"
          onClick={onCancel}
          disabled={generating}
        >
          Cancelar
        </button>
        <button type="submit" className="qz-btn-primary" disabled={generating}>
          {generating ? "Generando..." : "Generar cuestionario"}
        </button>
      </div>
    </form>
  );
};

export default GenerateQuizForm;
