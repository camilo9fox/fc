import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { useStats } from "../../hooks/useStats";
import { flashCardsApi } from "../../api/flashcards";
import {
  CategoryBreakdownItem,
  StatTotals,
  RecentAttempt,
} from "../../api/stats";
import DashboardCharts from "./DashboardCharts";
import { StatCardSkeleton, SkeletonList, Skeleton } from "../shared/Skeleton";
import "./DashboardPage.css";

// ─── Stat card config ────────────────────────────────────────────────────────

interface StatCardConfig {
  key: keyof StatTotals;
  label: string;
  path: string;
  colorClass: string;
  icon: React.ReactNode;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  path: string;
  toneClass: string;
  icon: React.ReactNode;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    key: "categories",
    label: "Temas de estudio",
    path: "/categories",
    colorClass: "db-card--purple",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    key: "flashcards",
    label: "Flashcards",
    path: "/flashcards",
    colorClass: "db-card--blue",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    key: "quizzes",
    label: "Cuestionarios",
    path: "/quizzes",
    colorClass: "db-card--orange",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    key: "trueFalseSets",
    label: "Sets Verdadero / Falso",
    path: "/truefalse",
    colorClass: "db-card--red",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
  },
  {
    key: "studyGuides",
    label: "Guías de estudio",
    path: "/study-guides",
    colorClass: "db-card--green",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard: React.FC<{
  config: StatCardConfig;
  value: number;
  onClick: () => void;
}> = ({ config, value, onClick }) => (
  <button className={`db-stat-card ${config.colorClass}`} onClick={onClick}>
    <div className="db-stat-icon">{config.icon}</div>
    <div className="db-stat-info">
      <span className="db-stat-value">{value}</span>
      <span className="db-stat-label">{config.label}</span>
    </div>
  </button>
);

const BreakdownRow: React.FC<{ item: CategoryBreakdownItem }> = ({ item }) => (
  <tr className="db-breakdown-row">
    <td className="db-breakdown-title">{item.title}</td>
    <td className="db-breakdown-cell db-cell--blue">{item.flashcards}</td>
    <td className="db-breakdown-cell db-cell--orange">{item.quizzes}</td>
    <td className="db-breakdown-cell db-cell--red">{item.trueFalseSets}</td>
    <td className="db-breakdown-cell db-cell--green">{item.studyGuides}</td>
    <td className="db-breakdown-cell db-cell--total">{item.total}</td>
    <td className="db-breakdown-cell db-cell--score">
      {item.avgScore != null ? `${item.avgScore}%` : "—"}
    </td>
  </tr>
);

const EmptyBreakdown: React.FC<{ onNavigate: () => void }> = ({
  onNavigate,
}) => (
  <div className="db-empty">
    <p>Aún no tienes temas de estudio creados.</p>
    <button className="db-btn-primary" onClick={onNavigate}>
      Crear primer tema
    </button>
  </div>
);

const QuickActionCard: React.FC<{ item: QuickAction; onClick: () => void }> = ({
  item,
  onClick,
}) => (
  <button className={`db-quick-card ${item.toneClass}`} onClick={onClick}>
    <div className="db-quick-icon">{item.icon}</div>
    <div className="db-quick-info">
      <h3 className="db-quick-title">{item.title}</h3>
      <p className="db-quick-subtitle">{item.subtitle}</p>
      <span className="db-quick-cta">
        {item.cta} <ArrowRight size={14} />
      </span>
    </div>
  </button>
);

// ─── Activity sub-components ─────────────────────────────────────────────────

const ActivityCard: React.FC<{
  value: string | number;
  label: string;
  colorClass: string;
}> = ({ value, label, colorClass }) => (
  <div className={`db-activity-card ${colorClass}`}>
    <span className="db-activity-value">{value}</span>
    <span className="db-activity-label">{label}</span>
  </div>
);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

const RecentAttemptRow: React.FC<{ attempt: RecentAttempt }> = ({
  attempt,
}) => {
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const typeLabel = attempt.type === "quiz" ? "Cuestionario" : "V / F";
  const typeClass =
    attempt.type === "quiz" ? "db-cell--orange" : "db-cell--red";
  return (
    <tr className="db-breakdown-row">
      <td className={`db-breakdown-cell ${typeClass}`}>{typeLabel}</td>
      <td className="db-breakdown-title">{attempt.categoryTitle ?? "—"}</td>
      <td className="db-breakdown-cell">
        {attempt.score} / {attempt.total}
      </td>
      <td className="db-breakdown-cell db-cell--total">{pct}%</td>
      <td className="db-breakdown-cell">{formatDate(attempt.completedAt)}</td>
    </tr>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { stats, loading, error, refresh } = useStats();
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState<number>(0);

  useEffect(() => {
    flashCardsApi
      .getReviewStats()
      .then((s) => setDueCount(s.due))
      .catch(() => {}); // non-blocking
  }, []);

  if (loading) {
    return (
      <div className="db-page">
        <div className="db-section">
          <div className="db-stat-grid">
            <SkeletonList count={5} component={StatCardSkeleton} />
          </div>
        </div>
        <div className="db-section">
          <Skeleton height="220px" borderRadius="14px" />
        </div>
        <div className="db-section">
          <Skeleton height="180px" borderRadius="14px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-error">
        <p>{error}</p>
        <button className="db-btn-secondary" onClick={refresh}>
          Reintentar
        </button>
      </div>
    );
  }

  const { totals, categoryBreakdown, mostActive, attemptStats } = stats!;
  const totalResources =
    totals.flashcards +
    totals.quizzes +
    totals.trueFalseSets +
    totals.studyGuides;
  const hasAnyResource = totalResources > 0;
  const recentAttempt = attemptStats.recentAttempts[0] || null;

  const primaryFlow = (() => {
    if (totals.categories === 0) {
      return {
        title: "Crea tu primer tema para empezar",
        description:
          "Tu flujo comienza en Temas: crea uno y luego añade flashcards, quizzes o V/F.",
        cta: "Crear primer tema",
        path: "/categories",
      };
    }

    if (dueCount > 0) {
      return {
        title: "Tu repaso de hoy está listo",
        description:
          "Tienes material pendiente y este es el mejor punto de inicio para retener más.",
        cta: "Ir a repaso SM-2",
        path: "/repaso",
      };
    }

    if (recentAttempt?.type === "quiz") {
      return {
        title: "Continúa con cuestionarios",
        description:
          "Tu última práctica fue en quizzes. Mantén el ritmo con otra ronda rápida.",
        cta: "Continuar práctica",
        path: "/quizzes",
      };
    }

    if (recentAttempt?.type === "true_false") {
      return {
        title: "Retoma Verdadero/Falso",
        description:
          "Ya venías practicando V/F. Una sesión breve hoy mantiene la racha.",
        cta: "Practicar V/F",
        path: "/truefalse",
      };
    }

    return {
      title: "Empieza con una sesión rápida",
      description:
        "Tu espacio está listo. Un bloque corto de flashcards te pone en marcha.",
      cta: "Estudiar flashcards",
      path: "/flashcards",
    };
  })();

  const quickActions: QuickAction[] = [
    {
      id: "review",
      title: dueCount > 0 ? "Repaso pendiente" : "Repaso inteligente",
      subtitle:
        dueCount > 0
          ? `${dueCount} ${dueCount === 1 ? "flashcard espera" : "flashcards esperan"} hoy`
          : "No hay pendientes ahora, pero puedes reforzar memoria.",
      cta: "Abrir repaso",
      path: "/repaso",
      toneClass: "db-quick--purple",
      icon: <Clock3 size={18} />,
    },
    {
      id: "flashcards",
      title: "Sesión de flashcards",
      subtitle: "Ideal para entrar en flujo en menos de 5 minutos.",
      cta: "Ir a flashcards",
      path: "/flashcards",
      toneClass: "db-quick--blue",
      icon: <Layers3 size={18} />,
    },
    {
      id: "quiz",
      title: "Practicar evaluación",
      subtitle: "Cuestionarios y V/F para medir comprensión real.",
      cta: "Abrir cuestionarios",
      path: "/quizzes",
      toneClass: "db-quick--orange",
      icon: <CircleHelp size={18} />,
    },
    {
      id: "generate",
      title: "Generar con IA",
      subtitle: "Convierte material en recursos listos para estudiar.",
      cta: "Crear contenido",
      path: "/study-guides",
      toneClass: "db-quick--pink",
      icon: <Sparkles size={18} />,
    },
  ];

  return (
    <div className="db-page">
      <section className="db-start-card">
        <div className="db-start-main">
          <p className="db-start-kicker">INICIO RAPIDO</p>
          <h2 className="db-start-title">{primaryFlow.title}</h2>
          <p className="db-start-subtitle">{primaryFlow.description}</p>

          <div className="db-start-actions">
            <button
              className="db-btn-primary db-start-btn"
              onClick={() => navigate(primaryFlow.path)}
            >
              {primaryFlow.cta}
              <ArrowRight size={15} />
            </button>
            <button
              className="db-btn-secondary db-start-btn-secondary"
              onClick={() => navigate("/categories")}
            >
              Ver temas
            </button>
          </div>

          <p className="db-start-footnote">
            {hasAnyResource
              ? "Tip: sesiones cortas y frecuentes mejoran retención más que maratones largas."
              : "Aún no tienes recursos; comienza creando un tema y genera tu primer contenido."}
          </p>
        </div>

        <div className="db-start-side">
          <div className="db-focus-card db-focus--purple">
            <span className="db-focus-label">Pendientes hoy</span>
            <strong className="db-focus-value">{dueCount}</strong>
            <Clock3 size={16} />
          </div>

          <div className="db-focus-card db-focus--orange">
            <span className="db-focus-label">Racha actual</span>
            <strong className="db-focus-value">
              {attemptStats.currentStreak}
            </strong>
            <Target size={16} />
          </div>

          <div className="db-focus-card db-focus--green">
            <span className="db-focus-label">Promedio</span>
            <strong className="db-focus-value">{attemptStats.avgScore}%</strong>
            <CheckCircle2 size={16} />
          </div>

          <div className="db-focus-card db-focus--blue">
            <span className="db-focus-label">Tema activo</span>
            <strong className="db-focus-value db-focus-topic">
              {mostActive?.title || "Sin actividad"}
            </strong>
            <BookOpen size={16} />
          </div>
        </div>
      </section>

      <section className="db-section">
        <h2 className="db-section-title">Inicio rápido</h2>
        <div className="db-quick-grid">
          {quickActions.map((item) => (
            <QuickActionCard
              key={item.id}
              item={item}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </section>

      <section className="db-section">
        <h2 className="db-section-title">Panorama general</h2>
        <div className="db-overview-grid">
          <div className="db-panel">
            <div className="db-panel-head">
              <h3 className="db-panel-title">Recursos creados</h3>
              <span className="db-panel-meta">Total: {totalResources}</span>
            </div>
            <div className="db-cards-grid">
              {STAT_CARDS.map((cfg) => (
                <StatCard
                  key={cfg.key}
                  config={cfg}
                  value={totals[cfg.key]}
                  onClick={() => navigate(cfg.path)}
                />
              ))}
            </div>
          </div>

          <div className="db-panel">
            <div className="db-panel-head">
              <h3 className="db-panel-title">Actividad de estudio</h3>
              <span className="db-panel-meta">Últimos avances</span>
            </div>
            <div className="db-activity-grid">
              <ActivityCard
                value={attemptStats.totalAttempts}
                label="Intentos (Quiz / V·F)"
                colorClass="db-activity--blue"
              />
              <ActivityCard
                value={attemptStats.totalFlashcardSessions}
                label="Sesiones de flashcards"
                colorClass="db-activity--purple"
              />
              <ActivityCard
                value={`${attemptStats.avgScore}%`}
                label="Promedio de aciertos"
                colorClass="db-activity--green"
              />
              <ActivityCard
                value={attemptStats.currentStreak}
                label={`Día${attemptStats.currentStreak !== 1 ? "s" : ""} de racha`}
                colorClass="db-activity--orange"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="db-section">
        <h2 className="db-section-title">Progreso de estudio</h2>
        <DashboardCharts />
      </section>

      {attemptStats.recentAttempts.length > 0 && (
        <section className="db-section">
          <h2 className="db-section-title">Últimos intentos</h2>
          <div className="db-table-wrapper">
            <table className="db-breakdown-table">
              <thead>
                <tr>
                  <th className="db-th">Tipo</th>
                  <th className="db-th-title">Tema</th>
                  <th className="db-th">Resultado</th>
                  <th className="db-th db-cell--total">%</th>
                  <th className="db-th">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {attemptStats.recentAttempts.map((a, i) => (
                  <RecentAttemptRow key={i} attempt={a} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="db-section">
        <h2 className="db-section-title">Detalle por tema</h2>

        {categoryBreakdown.length === 0 ? (
          <EmptyBreakdown onNavigate={() => navigate("/categories")} />
        ) : (
          <div className="db-table-wrapper">
            <table className="db-breakdown-table">
              <thead>
                <tr>
                  <th className="db-th-title">Tema</th>
                  <th className="db-th db-cell--blue">Flashcards</th>
                  <th className="db-th db-cell--orange">Cuestionarios</th>
                  <th className="db-th db-cell--red">V / F</th>
                  <th className="db-th db-cell--green">Guías</th>
                  <th className="db-th db-cell--total">Total</th>
                  <th className="db-th db-cell--score">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item) => (
                  <BreakdownRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
