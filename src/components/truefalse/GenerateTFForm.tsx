import React, { useRef, useState } from "react";
import { Paperclip, Sparkles, X } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import {
  ALLOWED_UPLOAD_FORMATS,
  MAX_TF_STATEMENTS_GENERATED,
} from "../../constants";
import { trueFalseApi } from "../../api/trueFalse";
import { DraftTFState } from "../../types/trueFalse.types";
import "./TrueFalsePage.css";

interface GenerateTFFormProps {
  onDrafted: (draft: DraftTFState) => void;
  onCancel: () => void;
}

const GenerateTFForm: React.FC<GenerateTFFormProps> = ({
  onDrafted,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(10);
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

      const result = await trueFalseApi.generate(formData);
      onDrafted({
        title: title.trim(),
        categoryId,
        questions: result.questions,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Error al generar el set de verdadero/falso.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form className="tf-form" onSubmit={handleSubmit}>
      <div className="tf-form-header">
        <h2>Generar set V/F con IA</h2>
        <button type="button" className="tf-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

      <div className="tf-form-meta">
        <div className="tf-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Anatomía — Aparato Digestivo"
          />
        </div>
        <div className="tf-field">
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
        <div className="tf-field">
          <label>
            Número de enunciados (1 – {MAX_TF_STATEMENTS_GENERATED})
          </label>
          <input
            type="number"
            min={1}
            max={MAX_TF_STATEMENTS_GENERATED}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(
                  MAX_TF_STATEMENTS_GENERATED,
                  Math.max(1, parseInt(e.target.value) || 10),
                ),
              )
            }
          />
        </div>
      </div>

      <div className="tf-field">
        <label>Texto de estudio</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Pega aquí el contenido del que quieres generar enunciados..."
        />
      </div>

      <div className="tf-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="tf-file-row">
          <button
            type="button"
            className="tf-btn-secondary tf-file-btn"
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
              className="tf-remove-btn"
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

      {error && <p className="tf-error">{error}</p>}

      {generating && (
        <p className="tf-generating-msg">
          <Sparkles size={14} /> Generando {quantity} enunciados con IA…
        </p>
      )}

      <div className="tf-form-actions">
        <button
          type="button"
          className="tf-btn-secondary"
          onClick={onCancel}
          disabled={generating}
        >
          Cancelar
        </button>
        <button type="submit" className="tf-btn-primary" disabled={generating}>
          {generating ? "Generando..." : "Generar set"}
        </button>
      </div>
    </form>
  );
};

export default GenerateTFForm;
