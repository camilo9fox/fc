import React from "react";
import { useNavigate } from "react-router-dom";
import { useMobileHomeStats } from "./useMobileData";
import {
  MobileHero,
  MobileListButton,
  MobileSection,
  MobileStatCard,
} from "./MobileUi";
import "./MobilePages.css";

const quickStartItems = [
  {
    title: "Flashcards",
    desc: "Tarjetas de estudio rápidas",
    icon: "🃏",
    bg: "linear-gradient(135deg, #7e22ce, #a855f7)",
    path: "/flashcards",
  },
  {
    title: "Cuestionario",
    desc: "Opción múltiple con IA",
    icon: "✏️",
    bg: "linear-gradient(135deg, #2563eb, #60a5fa)",
    path: "/quizzes",
  },
  {
    title: "Guía de estudio",
    desc: "Resumen consolidado",
    icon: "📖",
    bg: "linear-gradient(135deg, #d97706, #fbbf24)",
    path: "/study-guides",
  },
  {
    title: "Simulación",
    desc: "Examen completo",
    icon: "🎯",
    bg: "linear-gradient(135deg, #dc2626, #f87171)",
    path: "/exam-simulations",
  },
];

const resourceList = [
  {
    label: "Flashcards",
    icon: "🃏",
    iconBg: "linear-gradient(135deg, #7e22ce, #a855f7)",
    path: "/flashcards",
    key: "flashcards" as const,
  },
  {
    label: "Cuestionarios",
    icon: "✏️",
    iconBg: "linear-gradient(135deg, #2563eb, #60a5fa)",
    path: "/quizzes",
    key: "quizzes" as const,
  },
  {
    label: "Verdadero/Falso",
    icon: "✅",
    iconBg: "linear-gradient(135deg, #059669, #34d399)",
    path: "/truefalse",
    key: "trueFalse" as const,
  },
  {
    label: "Guías de Estudio",
    icon: "📖",
    iconBg: "linear-gradient(135deg, #d97706, #fbbf24)",
    path: "/study-guides",
    key: "guides" as const,
  },
  {
    label: "Simulaciones",
    icon: "🎯",
    iconBg: "linear-gradient(135deg, #dc2626, #f87171)",
    path: "/exam-simulations",
    key: "exams" as const,
  },
];

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, stats } = useMobileHomeStats();

  const total =
    stats.flashcards +
    stats.quizzes +
    stats.trueFalse +
    stats.guides +
    stats.exams;

  const isNewUser = !loading && total === 0;

  if (isNewUser) {
    return (
      <div className="mb-page">
        <MobileHero
          eyebrow="¡Bienvenido!"
          title="Tu espacio de estudio inteligente"
          description="Crea tu primer recurso y empieza a estudiar de forma más eficiente con IA."
          variant="home"
        />

        <MobileSection title="Cómo funciona">
          <div className="mb-onboarding-steps">
            <div className="mb-step">
              <span className="mb-step-num">1</span>
              <div className="mb-step-body">
                <strong>Crea un recurso</strong>
                <p>
                  Sube un documento o escribe tu contenido. La IA genera
                  flashcards, cuestionarios o guías en segundos.
                </p>
              </div>
            </div>
            <div className="mb-step">
              <span className="mb-step-num">2</span>
              <div className="mb-step-body">
                <strong>Estudia cuando quieras</strong>
                <p>
                  Accede a tus recursos desde el móvil, sin complicaciones. Todo
                  está en un solo lugar.
                </p>
              </div>
            </div>
            <div className="mb-step">
              <span className="mb-step-num">3</span>
              <div className="mb-step-body">
                <strong>Repasa con inteligencia</strong>
                <p>
                  El sistema SM-2 recuerda exactamente qué repasar cada día para
                  que no olvides nada.
                </p>
              </div>
            </div>
          </div>
        </MobileSection>

        <MobileSection title="Empieza ahora">
          <div className="mb-quickstart-grid">
            {quickStartItems.map((item) => (
              <button
                key={item.path}
                className="mb-quickstart-card"
                onClick={() => navigate(item.path)}
              >
                <span
                  className="mb-quickstart-icon"
                  style={{ background: item.bg }}
                >
                  {item.icon}
                </span>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </button>
            ))}
          </div>
        </MobileSection>

        <button
          className="mb-cta-banner"
          onClick={() => navigate("/m/library")}
        >
          <span className="mb-cta-text">
            <strong>Explora la biblioteca pública</strong>
            <span>Recursos creados por la comunidad</span>
          </span>
          <span className="mb-cta-arrow">›</span>
        </button>
      </div>
    );
  }

  const topResource = resourceList.reduce(
    (best, r) => (stats[r.key] > stats[best.key] ? r : best),
    resourceList[0],
  );

  const studiedPercent =
    total > 0 ? Math.min(100, Math.round((stats.flashcards / total) * 100)) : 0;

  return (
    <div className="mb-page">
      <MobileHero
        eyebrow="Inicio"
        title="Tu estudio, listo para avanzar"
        description="Visualiza progreso, prioriza repasos y accede a tus recursos de un solo toque."
        variant="home"
      />

      {stats.due > 0 && (
        <button className="mb-due-alert" onClick={() => navigate("/repaso")}>
          <span className="mb-due-alert-icon">🔔</span>
          <span className="mb-due-alert-text">
            <strong>
              {stats.due} tarjeta{stats.due !== 1 ? "s" : ""} pendiente
              {stats.due !== 1 ? "s" : ""} hoy
            </strong>
            <span>Haz tu repaso diario ahora</span>
          </span>
          <span className="mb-due-alert-arrow">›</span>
        </button>
      )}

      {/* Acceso rápido */}
      <div className="mb-chips">
        <button className="mb-chip" onClick={() => navigate("/repaso")}>
          <span className="mb-chip-icon">🔁</span> Repasar
        </button>
        <button className="mb-chip" onClick={() => navigate("/historial")}>
          <span className="mb-chip-icon">📋</span> Historial
        </button>
        <button className="mb-chip" onClick={() => navigate("/m/library")}>
          <span className="mb-chip-icon">🌐</span> Biblioteca pública
        </button>
        <button className="mb-chip" onClick={() => navigate("/m/create")}>
          <span className="mb-chip-icon">✨</span> Crear nuevo
        </button>
      </div>

      {/* Stats */}
      <section className="mb-card-grid mb-card-grid-2">
        <MobileStatCard
          label="Pendientes hoy"
          value={loading ? "…" : stats.due}
          helper="Tarjetas para repasar"
        />
        <MobileStatCard
          label="Total recursos"
          value={loading ? "…" : total}
          helper="Tu biblioteca privada"
        />
      </section>

      {/* Barra de progreso */}
      {!loading && total > 0 && (
        <div className="mb-progress-banner">
          <div className="mb-progress-header">
            <span>Tu biblioteca</span>
            <strong>{total} recursos</strong>
          </div>
          <div className="mb-progress-bar-track">
            <div
              className="mb-progress-bar-fill"
              style={{ width: `${studiedPercent}%` }}
            />
          </div>
          <div className="mb-progress-meta">
            <div className="mb-progress-meta-item">
              <span>Módulo más usado</span>
              <strong>
                {topResource.icon} {topResource.label}
              </strong>
            </div>
            <div className="mb-progress-meta-item">
              <span>Flashcards</span>
              <strong>{stats.flashcards}</strong>
            </div>
            <div className="mb-progress-meta-item">
              <span>Cuestionarios</span>
              <strong>{stats.quizzes}</strong>
            </div>
          </div>
        </div>
      )}

      <MobileSection title="Mis recursos">
        <div className="mb-list">
          {resourceList.map((r) => (
            <MobileListButton
              key={r.path}
              label={r.label}
              icon={r.icon}
              iconBg={r.iconBg}
              badge={loading ? "…" : stats[r.key]}
              onClick={() => navigate(r.path)}
            />
          ))}
        </div>
      </MobileSection>
    </div>
  );
};

export default MobileHomePage;
