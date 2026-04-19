import React, { useRef, useState } from "react";

interface ThemeModalProps {
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  initialIsPublic?: boolean;
  onSubmit: (
    title: string,
    description: string,
    isPublic: boolean,
  ) => Promise<void>;
  onClose: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
  mode,
  initialTitle = "",
  initialDescription = "",
  initialIsPublic = false,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("El título es obligatorio.");
    setSaving(true);
    setError(null);
    try {
      await onSubmit(title.trim(), description.trim(), isPublic);
    } catch (err: any) {
      setError(err?.message || "Error al guardar.");
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      className="ts-modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="ts-modal" role="dialog" aria-modal="true">
        <div className="ts-modal-header">
          <div className="ts-modal-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="ts-modal-title">
            {mode === "create" ? "Nuevo tema de estudio" : "Editar tema"}
          </h2>
          <button
            className="ts-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="ts-modal-body">
            <div className="ts-field">
              <label className="ts-label">Nombre del tema</label>
              <input
                className="ts-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Biología, Historia, Matemáticas…"
                autoFocus
              />
            </div>
            <div className="ts-field">
              <label className="ts-label">
                Descripción <span className="ts-optional">(opcional)</span>
              </label>
              <textarea
                className="ts-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Qué material agruparás en este tema?"
                rows={3}
              />
            </div>
            {error && <p className="ts-field-error">{error}</p>}
            {mode === "edit" && (
              <div className="ts-field">
                <label className="ts-label">Visibilidad</label>
                <button
                  type="button"
                  className={`ts-visibility-toggle${isPublic ? " ts-visibility-toggle--on" : ""}`}
                  onClick={() => setIsPublic((v) => !v)}
                >
                  <span className="ts-visibility-icon">
                    {isPublic ? "🌐" : "🔒"}
                  </span>
                  <span>
                    {isPublic
                      ? "Público — visible en la biblioteca"
                      : "Privado — solo tú puedes verlo"}
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="ts-modal-footer">
            <button
              type="button"
              className="ts-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="ts-btn-primary" disabled={saving}>
              {saving
                ? "Guardando…"
                : mode === "create"
                  ? "Crear tema"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeModal;
