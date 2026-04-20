import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="db-page">
      {/* ── SM-2 review reminder ── */}
      {dueCount > 0 && (
        <div className="db-sm2-banner">
          <div className="db-sm2-icon">
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="db-sm2-body">
            <p className="db-sm2-title">
              Tienes <strong>{dueCount}</strong>{" "}
              {dueCount === 1 ? "flashcard pendiente" : "flashcards pendientes"}{" "}
              de repaso
            </p>
            <p className="db-sm2-sub">
              Repasar ahora maximiza tu retención a largo plazo.
            </p>
          </div>
          <button
            className="db-sm2-btn"
            onClick={() => navigate("/spaced-repetition")}
          >
            Repasar ahora →
          </button>
        </div>
      )}

      {/* ── Summary banner ── */}
      {mostActive && (
        <div className="db-banner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Tema más activo: <strong>{mostActive.title}</strong>
          {" · "}
          {totalResources} recursos en total
        </div>
      )}

      {/* ── Streak banner ── */}
      {attemptStats.currentStreak >= 3 && (
        <div className="db-streak-banner">
          <span className="db-streak-fire">🔥</span>
          <span>
            ¡Llevas <strong>{attemptStats.currentStreak} días seguidos</strong>{" "}
            estudiando. ¡Sigue así!
          </span>
        </div>
      )}

      {/* ── Stat cards ── */}
      <section className="db-section">
        <h2 className="db-section-title">Resumen general</h2>
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
      </section>

      {/* ── Activity stats ── */}
      <section className="db-section">
        <h2 className="db-section-title">Actividad de estudio</h2>
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
      </section>

      {/* -- Charts -- */}
      <section className="db-section">
        <h2 className="db-section-title">Progreso de estudio</h2>
        <DashboardCharts />
      </section>

      {/* -- Recent attempts -- */}
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

      {/* ── Category breakdown ── */}
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
