import React, { useState } from "react";

interface CardRowProps {
  question: string;
  answer: string;
  source?: string;
  onDelete?: () => void;
}

const CardRow: React.FC<CardRowProps> = ({
  question,
  answer,
  source,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`fc-row ${open ? "open" : ""}`}>
      <button className="fc-row-toggle" onClick={() => setOpen((v) => !v)}>
        <span className="fc-row-chevron">{open ? "▾" : "▸"}</span>
        <span className="fc-row-question">{question}</span>
        {source && <span className={`fc-row-badge ${source}`}>{source}</span>}
      </button>
      {open && (
        <div className="fc-row-answer">
          <p>{answer}</p>
          {onDelete && (
            <button className="fc-row-delete" onClick={onDelete}>
              ✕ Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CardRow;
