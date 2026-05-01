import React, { useRef, useState } from "react";
import { Paperclip, Sparkles, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { ALLOWED_UPLOAD_FORMATS } from "../../constants";
import { studyGuideApi, StudyGuide } from "../../api/studyGuides";
import "./StudyGuidesPage.css";

interface GenerateStudyGuideFormProps {
  onGenerated: (guide: StudyGuide) => void;
  onCancel: () => void;
}

const GenerateStudyGuideForm: React.FC<GenerateStudyGuideFormProps> = ({
  onGenerated,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
      if (file) formData.append("file", file);
      if (text.trim()) formData.append("text", text.trim());

      const job = await studyGuideApi.startGenerateJob(formData);

      const POLL_INTERVAL = 2500;
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const updated = await studyGuideApi.getGenerationJob(job.id);
            setGeneratingStage(updated.progress.stage);
            setGeneratingPercent(updated.progress.percent);

            if (updated.status === "completed" && updated.result) {
              clearInterval(interval);
              onGenerated(updated.result);
              resolve();
            } else if (updated.status === "failed") {
              clearInterval(interval);
              reject(
                new Error(
                  updated.error ||
                    "Ocurrió un error al generar la guía. Inténtalo de nuevo más tarde.",
                ),
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
        err?.message?.startsWith("Ocurrió")
          ? err.message
          : "Ocurrió un error al generar la guía. Inténtalo de nuevo más tarde.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form className="sg-form" onSubmit={handleSubmit}>
      <div className="sg-form-header">
        <h2>Generar Guía de Estudio con IA</h2>
        <button type="button" className="sg-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="sg-form-meta">
        <div className="sg-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Guía — Sistema Cardiovascular"
          />
        </div>
        <div className="sg-field">
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

      <div className="sg-field">
        <label>Texto de estudio</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Pega aquí el contenido del que quieres generar la guía..."
        />
      </div>

      <div className="sg-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="sg-file-row">
          <button
            type="button"
            className="sg-btn-secondary sg-file-btn"
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
              className="sg-remove-btn"
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

      {error && <p className="sg-error">{error}</p>}

      {generating && (
        <div className="sg-generating-msg">
          <p>
            <Sparkles size={14} /> {generatingStage}
          </p>
          <div className="sg-progress-bar">
            <div
              className="sg-progress-fill"
              style={{ width: `${generatingPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="sg-form-actions">
        <button
          type="button"
          className="sg-btn-secondary"
          onClick={onCancel}
          disabled={generating}
        >
          Cancelar
        </button>
        <button type="submit" className="sg-btn-primary" disabled={generating}>
          {generating ? "Generando…" : "Generar guía"}
        </button>
      </div>
    </form>
  );
};

export default GenerateStudyGuideForm;
