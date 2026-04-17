import React, { useRef, useState } from "react";
import "./flashCard.css";
import { useFlashCard } from "../../hooks/useFlashCard";
import { useAuth } from "../../contexts/AuthContext";

const FlashCard: React.FC = () => {
  const {
    flashCardData,
    selectedFile,
    inputText,
    handleFileChange,
    handleTextChange,
    handleGenerateFlashCard,
    isLoading,
    error,
  } = useFlashCard();
  const flashCardRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  const flipCard = () => {
    setFlipped((f) => !f);
    if (flashCardRef.current) {
      flashCardRef.current.classList.toggle("flipped");
    }
  };
  const { user, logout } = useAuth();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleGenerateFlashCard();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FlashCards App</h1>
        <div className="user-info">
          <span>Hola, {user?.email}</span>
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="main-content">
        <form className="upload-container" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="flashcardText">
            Texto para generar flashcard (opcional)
          </label>
          <textarea
            id="flashcardText"
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Escribe un texto, un resumen o una pregunta..."
            rows={6}
            disabled={isLoading}
          />

          <label className="field-label" htmlFor="flashcardFile">
            Archivo PDF/TXT (opcional)
          </label>
          <input
            type="file"
            id="flashcardFile"
            accept=".txt,.pdf"
            onChange={onFileChange}
            disabled={isLoading}
          />
          {selectedFile && (
            <p className="file-name">
              Archivo seleccionado: {selectedFile.name}
            </p>
          )}

          <button
            style={{ marginTop: "20px" }}
            type="submit"
            disabled={isLoading || (!selectedFile && !inputText.trim())}
          >
            {isLoading ? "Generando..." : "Generar flashcard"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>

        {flashCardData.question && (
          <div onClick={flipCard} className="flash-card-container">
            <div ref={flashCardRef} className="flash-card">
              <div className="flash-card-front">
                <div className="flash-card-content">
                  {flashCardData.question}
                </div>
              </div>
              <div className="flash-card-back">
                <div className="flash-card-content">{flashCardData.answer}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FlashCard;
