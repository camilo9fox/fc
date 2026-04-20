import React, { useRef, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

interface CardRowProps {
  question: string;
  answer: string;
  source?: string;
  onDelete?: () => void;
  onUpdate?: (question: string, answer: string) => Promise<void>;
}

const CardRow: React.FC<CardRowProps> = ({
  question,
  answer,
  source,
  onDelete,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editQ, setEditQ] = useState(question);
  const [editA, setEditA] = useState(answer);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const qRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditQ(question);
    setEditA(answer);
    setEditError(null);
    setEditing(true);
    setOpen(true);
    setTimeout(() => qRef.current?.focus(), 50);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setEditError(null);
  };

  const saveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editQ.trim() || !editA.trim()) {
      setEditError("La pregunta y la respuesta no pueden estar vacías.");
      return;
    }
    if (!onUpdate) return;
    setSaving(true);
    setEditError(null);
    try {
      await onUpdate(editQ.trim(), editA.trim());
      setEditing(false);
    } catch {
      setEditError("No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`fc-row ${open ? "open" : ""}`}>
      <button
        className="fc-row-toggle"
        onClick={() => !editing && setOpen((v) => !v)}
      >
        <span className="fc-row-chevron">{open ? "▾" : "▸"}</span>
        <span className="fc-row-question">{question}</span>
        <span
          style={{
            display: "flex",
            gap: "4px",
            marginLeft: "auto",
            alignItems: "center",
          }}
        >
          {source && <span className={`fc-row-badge ${source}`}>{source}</span>}
          {onUpdate && (
            <span
              role="button"
              className="fc-row-edit-btn"
              onClick={startEdit}
              title="Editar"
            >
              <Pencil size={13} />
            </span>
          )}
        </span>
      </button>
      {open && (
        <div className="fc-row-answer">
          {editing ? (
            <div className="fc-row-edit-form">
              <label className="fc-edit-label">Pregunta</label>
              <textarea
                ref={qRef}
                className="fc-edit-input"
                value={editQ}
                onChange={(e) => setEditQ(e.target.value)}
                rows={2}
              />
              <label className="fc-edit-label">Respuesta</label>
              <textarea
                className="fc-edit-input"
                value={editA}
                onChange={(e) => setEditA(e.target.value)}
                rows={2}
              />
              {editError && <p className="fc-edit-error">{editError}</p>}
              <div className="fc-edit-actions">
                <button
                  className="fc-edit-save"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  <Check size={13} /> {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  className="fc-edit-cancel"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{answer}</p>
              {onDelete && (
                <button className="fc-row-delete" onClick={onDelete}>
                  <Trash2 size={13} /> Eliminar
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CardRow;
