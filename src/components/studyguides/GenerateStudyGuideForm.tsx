import React, { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { ALLOWED_UPLOAD_FORMATS } from "../../constants";
import { studyGuideApi, StudyGuide } from "../../api/studyGuides";
import { useGenerationQueue } from "../../contexts/GenerationQueueContext";
import "./StudyGuidesPage.css";

interface GenerateStudyGuideFormProps {
  onGenerated: (guide: StudyGuide) => void;
  onCancel: () => void;
}

const GenerateStudyGuideForm: React.FC<GenerateStudyGuideFormProps> = ({
  onCancel,
}) => {
  const { categories } = useCategories();
  const { enqueue, isModuleQueued } = useGenerationQueue();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [queued, setQueued] = useState(false);
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

    const capturedTitle = title.trim();
    const capturedCategoryId = categoryId;
    const capturedFile = file;
    const capturedText = text.trim();
    const categoryLabel =
      categories.find((c) => c.id === capturedCategoryId)?.title ?? "";

    const result = enqueue({
      moduleType: "studyguide",
      label: `Guía${categoryLabel ? ` · ${categoryLabel}` : ""}`,
      startFn: async () => {
        const formData = new FormData();
        formData.append("title", capturedTitle);
        formData.append("categoryId", capturedCategoryId);
        if (capturedFile) formData.append("file", capturedFile);
        if (capturedText) formData.append("text", capturedText);
        const job = await studyGuideApi.startGenerateJob(formData);
        return job.id;
      },
      pollFn: async (jobId) => {
        const job = await studyGuideApi.getGenerationJob(jobId);
        return {
          status: job.status as any,
          progress: job.progress,
          result: job.result ?? null,
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

      {queued && (
        <p className="sg-generating-msg" aria-live="polite">
          ✓ Generación en cola. Recibirás una notificación al terminar.
        </p>
      )}

      <div className="sg-form-actions">
        <button type="button" className="sg-btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="submit"
          className="sg-btn-primary"
          disabled={queued || isModuleQueued("studyguide")}
        >
          {queued || isModuleQueued("studyguide")
            ? "En cola..."
            : "Generar guía"}
        </button>
      </div>
    </form>
  );
};

export default GenerateStudyGuideForm;
