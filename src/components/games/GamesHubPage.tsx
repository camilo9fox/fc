import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Gamepad2 } from "lucide-react";
import "./GamesHubPage.css";

interface GameCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  bestKey: (userId: string) => string;
  bestLabel: (val: number) => string;
  gradient: string;
}

const GAMES: GameCard[] = [
  {
    id: "survival",
    icon: "💀",
    title: "Modo Supervivencia",
    subtitle: "1 vida · Quiz + V/F",
    description:
      "Un fallo y todo se acaba. Responde preguntas de quiz y verdadero/falso encadenadas. ¿Cuántas rondas aguantas?",
    path: "/games/survival",
    bestKey: (uid) => `survival_best_${uid}`,
    bestLabel: (v) => `${v} rondas`,
    gradient: "linear-gradient(135deg, #631D76, #EE4266)",
  },
  {
    id: "memoria",
    icon: "🃏",
    title: "Modo Memoria",
    subtitle: "Flashcards · Parejas",
    description:
      "Empareja cada pregunta con su respuesta. Las cartas están boca abajo — pondrá a prueba tu memoria y concentración.",
    path: "/games/memoria",
    bestKey: (uid) => `memory_best_${uid}`,
    bestLabel: (v) => `${v} intentos`,
    gradient: "linear-gradient(135deg, #1a6b8a, #22c55e)",
  },
  {
    id: "contrarreloj",
    icon: "⏱️",
    title: "Modo Contrarreloj",
    subtitle: "60s · Quiz + V/F",
    description:
      "Tienes 60 segundos. Cada acierto suma +3s, cada fallo resta -5s. ¿Cuántos aciertos puedes acumular?",
    path: "/games/contrarreloj",
    bestKey: (uid) => `cr_best_${uid}`,
    bestLabel: (v) => `${v} aciertos`,
    gradient: "linear-gradient(135deg, #b45309, #f59e0b)",
  },
  {
    id: "escritura",
    icon: "✍️",
    title: "Modo Escritura",
    subtitle: "Flashcards · Anki",
    description:
      "Lee la pregunta, escribe tu respuesta y comprueba si la sabías. Entrena la memoria activa.",
    path: "/games/escritura",
    bestKey: (uid) => `wrt_best_streak_${uid}`,
    bestLabel: (v) => `Racha de ${v}`,
    gradient: "linear-gradient(135deg, #1e3a8a, #6366f1)",
  },
];

const GamesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getBest = (key: string): number => {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) : 0;
  };

  return (
    <div className="ghub-page">
      <div className="ghub-header">
        <div className="ghub-header-left">
          <div className="ghub-page-icon">
            <Gamepad2 size={20} />
          </div>
          <div>
            <h1 className="ghub-title">Juegos de estudio</h1>
            <p className="ghub-subtitle">
              Aprende jugando. Elige un modo y pon a prueba tu conocimiento.
            </p>
          </div>
        </div>
      </div>

      <div className="ghub-grid">
        {GAMES.map((game) => {
          const best = user ? getBest(game.bestKey(user.id)) : 0;
          return (
            <div key={game.id} className="ghub-card">
              <div
                className="ghub-card-banner"
                style={{ background: game.gradient }}
              >
                <span className="ghub-card-icon">{game.icon}</span>
              </div>
              <div className="ghub-card-body">
                <div className="ghub-card-meta">
                  <h2 className="ghub-card-title">{game.title}</h2>
                  <span className="ghub-card-tag">{game.subtitle}</span>
                </div>
                <p className="ghub-card-desc">{game.description}</p>
                {best > 0 && (
                  <div className="ghub-card-best">
                    <span className="ghub-best-icon">🏆</span>
                    <span className="ghub-best-text">
                      Récord: <strong>{game.bestLabel(best)}</strong>
                    </span>
                  </div>
                )}
                <button
                  className="ghub-play-btn"
                  style={{ background: game.gradient }}
                  onClick={() => navigate(game.path)}
                >
                  Jugar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesHubPage;
