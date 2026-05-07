import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMobilePrivateLibrarySummary,
  useMobilePublicLibrary,
} from "./useMobileData";
import {
  MobileHero,
  MobileListButton,
  MobilePublicCard,
  MobileSection,
} from "./MobileUi";
import "./MobilePages.css";

const MobileLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");
  const { loading: loadingPrivate, summary: privateSummary } =
    useMobilePrivateLibrarySummary();
  const { loading: loadingPublic, categories: publicCategories } =
    useMobilePublicLibrary();

  return (
    <div className="mb-page">
      <MobileHero
        eyebrow="Biblioteca"
        title="Privada y publica, en un mismo lugar"
        description="Gestiona tus creaciones y explora contenido de la comunidad desde una experiencia movil unificada."
        variant="library"
      />

      <div className="mb-tabs">
        <button
          className={`mb-tab ${activeTab === "private" ? "active" : ""}`}
          onClick={() => setActiveTab("private")}
        >
          Privada
        </button>
        <button
          className={`mb-tab ${activeTab === "public" ? "active" : ""}`}
          onClick={() => setActiveTab("public")}
        >
          Pública
        </button>
      </div>

      {activeTab === "private" ? (
        <MobileSection title="Tus recursos">
          <div className="mb-list">
            <MobileListButton
              label="Flashcards"
              badge={loadingPrivate ? "..." : privateSummary.flashcards}
              onClick={() => navigate("/flashcards")}
            />
            <MobileListButton
              label="Cuestionarios"
              badge={loadingPrivate ? "..." : privateSummary.quizzes}
              onClick={() => navigate("/quizzes")}
            />
            <MobileListButton
              label="Verdadero/Falso"
              badge={loadingPrivate ? "..." : privateSummary.trueFalse}
              onClick={() => navigate("/truefalse")}
            />
            <MobileListButton
              label="Guias"
              badge={loadingPrivate ? "..." : privateSummary.guides}
              onClick={() => navigate("/study-guides")}
            />
            <MobileListButton
              label="Simulaciones"
              badge={loadingPrivate ? "..." : privateSummary.exams}
              onClick={() => navigate("/exam-simulations")}
            />
          </div>
        </MobileSection>
      ) : (
        <MobileSection title="Comunidad">
          {loadingPublic ? (
            <p className="mb-muted">Cargando biblioteca pública...</p>
          ) : publicCategories.length === 0 ? (
            <p className="mb-muted">
              No hay temas públicos disponibles por ahora.
            </p>
          ) : (
            <div className="mb-public-grid">
              {publicCategories.map((category) => (
                <MobilePublicCard
                  key={category.id}
                  title={category.title}
                  description={
                    category.description || "Tema publico de la comunidad"
                  }
                  totalResources={
                    category.flashcardCount +
                    category.quizCount +
                    category.trueFalseCount
                  }
                  onClick={() => navigate("/biblioteca")}
                />
              ))}
            </div>
          )}
        </MobileSection>
      )}
    </div>
  );
};

export default MobileLibraryPage;
