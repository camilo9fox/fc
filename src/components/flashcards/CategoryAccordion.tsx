import React, { useState } from "react";
import CardRow from "./CardRow";

interface CategoryAccordionProps {
  title: string;
  cards: any[];
  onStudy: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, question: string, answer: string) => Promise<void>;
  isDraft?: boolean;
  categoryId?: string;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  title,
  cards,
  onStudy,
  onDelete,
  onUpdate,
  isDraft,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="fc-accordion">
      <div
        className="fc-accordion-header"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="fc-accordion-left">
          <span className="fc-accordion-chevron">{expanded ? "▾" : "▸"}</span>
          <span className="fc-accordion-title">{title}</span>
          <span className="fc-accordion-count">{cards.length}</span>
        </div>
        <button
          className="fc-accordion-study"
          onClick={(e) => {
            e.stopPropagation();
            onStudy();
          }}
        >
          Estudiar →
        </button>
      </div>
      {expanded && (
        <div className="fc-accordion-body">
          {cards.map((card, i) => (
            <CardRow
              key={card.id ?? `${card.question}-${i}`}
              question={card.question}
              answer={card.answer}
              source={card.source}
              onDelete={onDelete ? () => onDelete(card.id) : undefined}
              onUpdate={
                onUpdate && card.id
                  ? (q, a) => onUpdate(card.id, q, a)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryAccordion;
