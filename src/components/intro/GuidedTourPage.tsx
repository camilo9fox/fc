import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, SkipForward, RotateCcw } from "lucide-react";
import { markIntroSeenForUser } from "../../hooks/useOnboardingIntroGate";
import { useAuth } from "../../contexts/AuthContext";
import "./GuidedTourPage.css";

interface TourStep {
  emoji: string;
  title: string;
  description: string;
  tip: string;
  path: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    emoji: "🗂️",
    title: "Crea tus Temas de estudio",
    description:
      "Organiza tu contenido por temas. Cada tema agrupa flashcards, cuestionarios y más. Es el primer paso para mantener todo ordenado.",
    tip: "Ejemplo: \"Matemáticas\", \"Historia Universal\", \"Anatomía\".",
    path: "/categories",
  },
  {
    emoji: "🃏",
    title: "Genera Flashcards con IA",
    description:
      "Sube un PDF, pega texto o escribe tus apuntes. La IA crea tarjetas de pregunta-respuesta en segundos.",
    tip: "También puedes crearlas manualmente si lo prefieres.",
    path: "/flashcards",
  },
  {
    emoji: "✏️",
    title: "Practica con Cuestionarios",
    description:
      "Genera preguntas de opción múltiple desde tu material. Cada pregunta incluye 4 alternativas y explicación.",
    tip: "Ideal para medir tu comprensión antes de un examen.",
    path: "/quizzes",
  },
  {
    emoji: "✅",
    title: "Desafíate con Verdadero o Falso",
    description:
      "Afirmaciones que ponen a prueba tu comprensión conceptual. La IA genera explicaciones detalladas para cada respuesta.",
    tip: "Perfecto para repasar conceptos clave rápidamente.",
    path: "/truefalse",
  },
  {
    emoji: "📖",
    title: "Guías de Estudio completas",
    description:
      "Consolida temas enteros en una guía estructurada con resumen, conceptos, términos y preguntas de repaso.",
    tip: "Útil para preparar exámenes finales o temas muy extensos.",
    path: "/study-guides",
  },
  {
    emoji: "🎯",
    title: "Simulaciones de Examen",
    description:
      "Combina verdadero/falso, opción múltiple y preguntas de desarrollo en un formato cronometrado. La IA califica tus respuestas.",
    tip: "Simula condiciones reales de evaluación.",
    path: "/exam-simulations",
  },
  {
    emoji: "🧠",
    title: "Repaso Espaciado SM-2",
    description:
      "El sistema programa tus repasos justo antes de que olvides. Califica cada tarjeta y el algoritmo optimiza tu memoria a largo plazo.",
    tip: "Haz tu repaso diario — solo toma unos minutos.",
    path: "/repaso",
  },
  {
    emoji: "🎮",
    title: "Aprende jugando",
    description:
      "Modo Supervivencia, Memoria, Contrarreloj y Escritura. Refuerza lo aprendido mientras te diviertes.",
    tip: "Los juegos usan tus propias tarjetas como material.",
    path: "/games",
  },
  {
    emoji: "🌐",
    title: "Explora la Biblioteca pública",
    description:
      "Descubre temas creados por la comunidad. Puedes copiar cualquier tema público a tu biblioteca personal.",
    tip: "Busca temas de tu interés y empieza a estudiar al instante.",
    path: "/biblioteca",
  },
];

const STORAGE_KEY = "Flashy:tour-seen";

const GuidedTourPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "1");
      markIntroSeenForUser(user?.id);
      setFinished(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    markIntroSeenForUser(user?.id);
    navigate("/dashboard");
  };

  const progressPercent = Math.round(((step + 1) / TOUR_STEPS.length) * 100);

  if (finished) {
    return (
      <div className="gt-page">
        <div className="gt-finish-card">
          <span className="gt-finish-emoji">🚀</span>
          <h2>¡Estás listo para empezar!</h2>
          <p>
            Ya conoces las herramientas principales. Ahora crea tu primer tema y
            empieza a estudiar.
          </p>
          <div className="gt-finish-buttons">
            <button
              className="gt-btn-primary"
              onClick={() => navigate("/categories")}
            >
              Crear mi primer tema
            </button>
            <button
              className="gt-btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gt-page">
      <div className="gt-card">
        <div className="gt-progress">
          <div
            className="gt-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="gt-step-counter">
          {step + 1} de {TOUR_STEPS.length}
        </p>

        <span className="gt-step-emoji">{current.emoji}</span>
        <h1 className="gt-step-title">{current.title}</h1>
        <p className="gt-step-desc">{current.description}</p>
        <p className="gt-step-tip">💡 {current.tip}</p>

        <div className="gt-step-actions">
          <button className="gt-btn-skip" onClick={handleSkip}>
            <SkipForward size={15} />
            Omitir tutorial
          </button>
          <button className="gt-btn-next" onClick={handleNext}>
            {isLast ? "Finalizar" : "Siguiente"}
            {isLast ? (
              <CheckIcon />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default GuidedTourPage;
