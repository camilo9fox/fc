import React, { useEffect, useRef } from "react";
import "./flashCard.css";
import { useFlashCard } from "../../hooks/useFlashCard";

const FlashCard: React.FC = () => {
  const { flashCardData, flipCard, flashCardRef } = useFlashCard();

  return (
    <>
      <div onClick={flipCard} className="flash-card-container">
        <div ref={flashCardRef} className="flash-card">
          <div className="flash-card-front">
            <div className="flash-card-content">{flashCardData.question}</div>
          </div>
          <div className="flash-card-back">
            <div className="flash-card-content">{flashCardData.answer}</div>
          </div>
        </div>
      </div>
      <div className="options-container">
        {flashCardData.options.map((option, index) => (
          <button key={index} className="option-button">
            {option}
          </button>
        ))}
      </div>
    </>
  );
};

export default FlashCard;
