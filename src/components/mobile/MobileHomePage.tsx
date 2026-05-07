import React from "react";
import { useNavigate } from "react-router-dom";
import { useMobileHomeStats } from "./useMobileData";
import {
  MobileActionCard,
  MobileHero,
  MobileListButton,
  MobileSection,
  MobileStatCard,
} from "./MobileUi";
import "./MobilePages.css";

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, stats } = useMobileHomeStats();

  return (
    <div className="mb-page">
      <MobileHero
        eyebrow="Inicio"
        title="Tu estudio, listo para avanzar"
        description="Visualiza progreso, prioriza repasos y entra a crear contenido desde un flujo pensado para movil."
        variant="home"
      />

      <section className="mb-card-grid mb-card-grid-2">
        <MobileStatCard
          label="Pendientes hoy"
          value={loading ? "..." : stats.due}
          helper="Tarjetas para repasar"
        />
        <MobileStatCard
          label="Total de recursos"
          value={
            loading
              ? "..."
              : stats.flashcards +
                stats.quizzes +
                stats.trueFalse +
                stats.guides +
                stats.exams
          }
          helper="Tu biblioteca privada"
        />
      </section>

      <MobileSection title="Resumen rapido">
        <div className="mb-list">
          <MobileListButton
            label="Flashcards"
            badge={stats.flashcards}
            onClick={() => navigate("/flashcards")}
          />
          <MobileListButton
            label="Cuestionarios"
            badge={stats.quizzes}
            onClick={() => navigate("/quizzes")}
          />
          <MobileListButton
            label="Verdadero/Falso"
            badge={stats.trueFalse}
            onClick={() => navigate("/truefalse")}
          />
          <MobileListButton
            label="Guias de Estudio"
            badge={stats.guides}
            onClick={() => navigate("/study-guides")}
          />
          <MobileListButton
            label="Simulaciones"
            badge={stats.exams}
            onClick={() => navigate("/exam-simulations")}
          />
        </div>
      </MobileSection>

      <MobileSection title="Acciones clave">
        <div className="mb-card-grid">
          <MobileActionCard
            label="Ir a repaso SM-2"
            onClick={() => navigate("/repaso")}
          />
          <MobileActionCard
            label="Ver historial"
            onClick={() => navigate("/historial")}
          />
        </div>
      </MobileSection>
    </div>
  );
};

export default MobileHomePage;
