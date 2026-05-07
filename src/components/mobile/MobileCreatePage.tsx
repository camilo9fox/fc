import React from "react";
import { useNavigate } from "react-router-dom";
import { MobileCreateCard, MobileHero, MobileSection } from "./MobileUi";
import "./MobilePages.css";

const createModules = [
  {
    title: "Flashcards",
    description: "Genera o crea tarjetas de estudio rápidas.",
    path: "/flashcards",
    icon: "🃏",
    iconBg: "linear-gradient(135deg, #7e22ce, #a855f7)",
  },
  {
    title: "Cuestionarios",
    description: "Crea evaluaciones de opción múltiple.",
    path: "/quizzes",
    icon: "✏️",
    iconBg: "linear-gradient(135deg, #2563eb, #60a5fa)",
  },
  {
    title: "Verdadero/Falso",
    description: "Arma sets para práctica de conceptos.",
    path: "/truefalse",
    icon: "✅",
    iconBg: "linear-gradient(135deg, #059669, #34d399)",
  },
  {
    title: "Guías de Estudio",
    description: "Consolida temas en formatos de lectura.",
    path: "/study-guides",
    icon: "📖",
    iconBg: "linear-gradient(135deg, #d97706, #fbbf24)",
  },
  {
    title: "Simulación de Examen",
    description: "Combina V/F, alternativas y desarrollo.",
    path: "/exam-simulations",
    icon: "🎯",
    iconBg: "linear-gradient(135deg, #dc2626, #f87171)",
  },
  {
    title: "Temas de estudio",
    description: "Organiza todo tu contenido por tema.",
    path: "/categories",
    icon: "🗂️",
    iconBg: "linear-gradient(135deg, #0891b2, #22d3ee)",
  },
];

const MobileCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-page">
      <MobileHero
        eyebrow="Crear"
        title="Un solo modulo para crear todo"
        description="Desde aqui eliges el tipo de recurso que quieres construir. Flujo centralizado, directo y optimizado para movil."
        variant="create"
      />

      <MobileSection title="Elige que crear">
        <div className="mb-create-grid">
          {createModules.map((module) => (
            <MobileCreateCard
              key={module.path}
              title={module.title}
              description={module.description}
              cta="Abrir"
              icon={module.icon}
              iconBg={module.iconBg}
              onClick={() => navigate(module.path)}
            />
          ))}
        </div>
      </MobileSection>
    </div>
  );
};

export default MobileCreatePage;
