import React, { useRef, useState } from "react";
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

      const result = await quizApi.generate(formData);
      onDrafted({
        title: title.trim(),
        categoryId,
        questions: result.questions,
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
          ✕
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
            {file ? `📄 ${file.name}` : "Seleccionar archivo"}
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
        <p className="qz-generating-msg">
          ✨ Generando {quantity} preguntas con IA…
        </p>
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
