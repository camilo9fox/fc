import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Brain,
  CheckSquare,
  FileText,
  Flame,
  Layers,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useStats } from "../../hooks/useStats";
import { flashCardsApi } from "../../api/flashcards";
import { useAuth } from "../../contexts/AuthContext";
import { RecentAttempt, StatTotals } from "../../api/stats";
import "./DashboardPage.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
};

const formatToday = () =>
  new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Tool card type ───────────────────────────────────────────────────────────

interface ToolCard {
  id: string;
  label: string;
  sublabel: string;
  path: string;
  count: number;
  countLabel: string;
  gradient: string;
  icon: React.ReactNode;
  urgent?: boolean;
}

// ─── Page ────────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { stats, loading } = useStats();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dueCount, setDueCount] = useState<number>(0);

  useEffect(() => {
    flashCardsApi
      .getReviewStats()
      .then((s) => setDueCount(s.due))
      .catch(() => {});
  }, []);

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "Tu";

  const totals: StatTotals | undefined = stats?.totals;
  const attemptStats = stats?.attemptStats;
  const recentAttempts: RecentAttempt[] = attemptStats?.recentAttempts ?? [];
  const recentAttempt: RecentAttempt | null = recentAttempts[0] ?? null;

  // Today's priority — drives the big CTA card
  const priority = (() => {
    if (!loading && (!totals || totals.categories === 0)) {
      return {
        icon: <BookMarked size={22} />,
        tag: "PRIMER PASO",
        tagClass: "db2-tag--purple",
        title: "Crea tu primer tema de estudio",
        desc: "Todo comienza aqui: crea un tema y luego anade flashcards, quizzes o guias bajo el.",
        cta: "Crear tema",
        path: "/categories",
        cardClass: "db2-priority--purple",
      };
    }
    if (dueCount > 0) {
      return {
        icon: <Brain size={22} />,
        tag: "PENDIENTE HOY",
        tagClass: "db2-tag--pink",
        title: `Tienes ${dueCount} ${dueCount === 1 ? "tarjeta" : "tarjetas"} por repasar`,
        desc: "El algoritmo SM-2 ya sabe que necesitas reforzar. Cada minuto de repaso cuenta.",
        cta: "Ir al repaso",
        path: "/repaso",
        cardClass: "db2-priority--pink",
      };
    }
    if (recentAttempt?.type === "quiz") {
      return {
        icon: <FileText size={22} />,
        tag: "CONTINUAR",
        tagClass: "db2-tag--orange",
        title: "Manten el ritmo con cuestionarios",
        desc: "Tu ultima sesion fue un quiz. Una ronda mas hoy refuerza lo que ya aprendiste.",
        cta: "Practicar quiz",
        path: "/quizzes",
        cardClass: "db2-priority--orange",
      };
    }
    if (recentAttempt?.type === "true_false") {
      return {
        icon: <CheckSquare size={22} />,
        tag: "CONTINUAR",
        tagClass: "db2-tag--orange",
        title: "Retoma tu practica de Verdadero/Falso",
        desc: "Seguias con una buena racha de V/F. Una sesion corta mantiene el avance.",
        cta: "Practicar V/F",
        path: "/truefalse",
        cardClass: "db2-priority--orange",
      };
    }
    return {
      icon: <Layers size={22} />,
      tag: "SUGERIDO",
      tagClass: "db2-tag--blue",
      title: "Empieza con una sesion de flashcards",
      desc: "Sesiones cortas y frecuentes retienen mas que estudiar de golpe. Elige un tema y arranca.",
      cta: "Estudiar flashcards",
      path: "/flashcards",
      cardClass: "db2-priority--blue",
    };
  })();

  // Tool cards
  const tools: ToolCard[] = [
    {
      id: "repaso",
      label: "Repaso SM-2",
      sublabel: "Repeticion espaciada inteligente",
      path: "/repaso",
      count: dueCount,
      countLabel: "pendientes hoy",
      gradient: "linear-gradient(135deg, #ee4266 0%, #f97316 100%)",
      icon: <Brain size={20} />,
      urgent: dueCount > 0,
    },
    {
      id: "flashcards",
      label: "Flashcards",
      sublabel: "Crea y estudia tarjetas",
      path: "/flashcards",
      count: totals?.flashcards ?? 0,
      countLabel: "tarjetas",
      gradient: "linear-gradient(135deg, #631d76 0%, #9333ea 100%)",
      icon: <Layers size={20} />,
    },
    {
      id: "quizzes",
      label: "Cuestionarios",
      sublabel: "Preguntas de multiple opcion",
      path: "/quizzes",
      count: totals?.quizzes ?? 0,
      countLabel: "sets",
      gradient: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
      icon: <FileText size={20} />,
    },
    {
      id: "truefalse",
      label: "Verdadero / Falso",
      sublabel: "Practica enunciados V/F",
      path: "/truefalse",
      count: totals?.trueFalseSets ?? 0,
      countLabel: "sets",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      icon: <CheckSquare size={20} />,
    },
    {
      id: "studyguides",
      label: "Guias de estudio",
      sublabel: "Generadas con IA",
      path: "/study-guides",
      count: totals?.studyGuides ?? 0,
      countLabel: "guias",
      gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
      icon: <BookOpen size={20} />,
    },
    {
      id: "categories",
      label: "Temas de estudio",
      sublabel: "Organiza tu material",
      path: "/categories",
      count: totals?.categories ?? 0,
      countLabel: "temas creados",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
      icon: <BookMarked size={20} />,
    },
  ];

  return (
    <div className="db2-page">
      {/* Greeting */}
      <div className="db2-greeting">
        <div className="db2-greeting-text">
          <h1 className="db2-greeting-title">
            {getGreeting()},{" "}
            <span className="db2-greeting-name">{userInitials}</span>
          </h1>
          <p className="db2-greeting-date">{capitalize(formatToday())}</p>
        </div>
        <div className="db2-greeting-stats">
          <div className="db2-mini-stat">
            <Flame size={13} />
            <span>{attemptStats?.currentStreak ?? 0} dias de racha</span>
          </div>
          <div className={`db2-mini-stat${dueCount > 0 ? " db2-mini-stat--urgent" : ""}`}>
            <Zap size={13} />
            <span>{dueCount > 0 ? `${dueCount} pendientes` : "Al dia con el repaso"}</span>
          </div>
          <div className="db2-mini-stat">
            <TrendingUp size={13} />
            <span>{attemptStats?.avgScore ?? 0}% promedio</span>
          </div>
        </div>
      </div>

      {/* Today's priority */}
      <div className={`db2-priority ${priority.cardClass}`}>
        <div className="db2-priority-icon">{priority.icon}</div>
        <div className="db2-priority-body">
          <span className={`db2-priority-tag ${priority.tagClass}`}>{priority.tag}</span>
          <h2 className="db2-priority-title">{priority.title}</h2>
          <p className="db2-priority-desc">{priority.desc}</p>
        </div>
        <button className="db2-priority-cta" onClick={() => navigate(priority.path)}>
          {priority.cta}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Tools grid */}
      <div className="db2-section">
        <h2 className="db2-section-title">Herramientas de estudio</h2>
        <div className="db2-tools-grid">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`db2-tool-card${tool.urgent ? " db2-tool-card--urgent" : ""}`}
              onClick={() => navigate(tool.path)}
            >
              <div className="db2-tool-icon" style={{ background: tool.gradient }}>
                {tool.icon}
              </div>
              <div className="db2-tool-info">
                <span className="db2-tool-label">{tool.label}</span>
                <span className="db2-tool-sub">{tool.sublabel}</span>
              </div>
              <div className="db2-tool-count">
                <strong>{tool.count}</strong>
                <span>{tool.countLabel}</span>
              </div>
              <ArrowRight size={15} className="db2-tool-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: progress + recent */}
      <div className="db2-bottom-grid">
        <div className="db2-panel">
          <h3 className="db2-panel-title">Tu progreso</h3>
          <div className="db2-progress-list">
            <div className="db2-progress-row">
              <span className="db2-progress-label"><Flame size={14} /> Racha actual</span>
              <strong className="db2-progress-value">{attemptStats?.currentStreak ?? 0} dias</strong>
            </div>
            <div className="db2-progress-row">
              <span className="db2-progress-label"><Brain size={14} /> Pendientes hoy</span>
              <strong className={`db2-progress-value${dueCount > 0 ? " db2-value--urgent" : ""}`}>{dueCount}</strong>
            </div>
            <div className="db2-progress-row">
              <span className="db2-progress-label"><Target size={14} /> Promedio de aciertos</span>
              <strong className="db2-progress-value">{attemptStats?.avgScore ?? 0}%</strong>
            </div>
            <div className="db2-progress-row">
              <span className="db2-progress-label"><TrendingUp size={14} /> Total de intentos</span>
              <strong className="db2-progress-value">{attemptStats?.totalAttempts ?? 0}</strong>
            </div>
          </div>
        </div>

        <div className="db2-panel">
          <h3 className="db2-panel-title">Actividad reciente</h3>
          {recentAttempts.length === 0 ? (
            <p className="db2-panel-empty">
              Aun no hay intentos registrados. Practica y aqui veras tu avance.
            </p>
          ) : (
            <div className="db2-recent-list">
              {recentAttempts.slice(0, 5).map((a, i) => {
                const pct = Math.round((a.score / a.total) * 100);
                const typeLabel = a.type === "quiz" ? "Cuestionario" : "V / F";
                const good = pct >= 70;
                return (
                  <div key={i} className="db2-recent-row">
                    <div className="db2-recent-meta">
                      <span className="db2-recent-type">{typeLabel}</span>
                      <span className="db2-recent-cat">{a.categoryTitle ?? "—"}</span>
                    </div>
                    <span className={`db2-recent-score${good ? " db2-score--good" : " db2-score--bad"}`}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
