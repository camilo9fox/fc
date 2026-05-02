import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { flashCardsApi } from "../../api/flashcards";
import { GenerationQueueProvider } from "../../contexts/GenerationQueueContext";
import { GenerationQueueWidget } from "../shared/GenerationQueueWidget";
import { AiUsagePulseBar } from "../shared/AiUsagePulseBar";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  exact?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Perfil",
    items: [
      {
        id: "profile",
        label: "Mi perfil",
        path: "/profile",
        exact: true,
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        id: "historial",
        label: "Historial de actividad",
        path: "/historial",
        exact: true,
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Estudio",
    items: [
      {
        id: "categories",
        label: "Temas de estudio",
        path: "/categories",
        exact: true,
        icon: (
          <svg
            width="17"
            height="17"
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
        id: "flashcards",
        label: "Flashcards",
        path: "/flashcards",
        exact: true,
        icon: (
          <svg
            width="17"
            height="17"
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
        id: "repaso",
        label: "Repaso SM-2",
        path: "/repaso",
        exact: true,
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        ),
      },
      {
        id: "quizzes",
        label: "Cuestionarios",
        path: "/quizzes",
        icon: (
          <svg
            width="17"
            height="17"
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
        id: "truefalse",
        label: "Verdadero o Falso",
        path: "/truefalse",
        icon: (
          <svg
            width="17"
            height="17"
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
        id: "study-guides",
        label: "Guías de Estudio",
        path: "/study-guides",
        icon: (
          <svg
            width="17"
            height="17"
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
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
      },
      {
        id: "games",
        label: "Juegos de estudio",
        path: "/games",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59 27.2 27.2 0 0 0 .006 9.83A2.18 2.18 0 0 0 4.8 21h0a2.18 2.18 0 0 0 2.07-1.496L7.5 17h9l.63 2.504A2.18 2.18 0 0 0 19.2 21h0a2.18 2.18 0 0 0 2.072-2.58 27.2 27.2 0 0 0 .006-9.83A4 4 0 0 0 17.32 5z" />
            <line x1="6" y1="11" x2="10" y2="11" />
            <line x1="8" y1="9" x2="8" y2="13" />
            <line x1="15" y1="12" x2="15.01" y2="12" />
            <line x1="18" y1="10" x2="18.01" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Comunidad",
    items: [
      {
        id: "biblioteca",
        label: "Biblioteca",
        path: "/biblioteca",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="12" y1="6" x2="16" y2="6" />
            <line x1="12" y1="10" x2="16" y2="10" />
            <line x1="12" y1="14" x2="16" y2="14" />
          </svg>
        ),
      },
    ],
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/profile": {
    title: "Mi perfil",
    subtitle: "Gestiona tu cuenta y preferencias",
  },
  "/dashboard": {
    title: "Inicio",
    subtitle: "Tu punto de partida para estudiar",
  },
  "/historial": {
    title: "Historial de actividad",
    subtitle: "Todos tus intentos y sesiones de estudio",
  },
  "/flashcards": {
    title: "Flashcards",
    subtitle: "Crea y estudia tus tarjetas de repaso",
  },
  "/quizzes": {
    title: "Cuestionarios",
    subtitle: "Practica con preguntas de múltiple opción",
  },
  "/truefalse": {
    title: "Verdadero o Falso",
    subtitle: "Practica con enunciados verdadero/falso",
  },
  "/study-guides": {
    title: "Guías de Estudio",
    subtitle: "Guías estructuradas generadas con IA",
  },
  "/categories": {
    title: "Temas de estudio",
    subtitle: "Organiza tu material por tema",
  },
  "/biblioteca": {
    title: "Biblioteca pública",
    subtitle: "Explora e importa temas compartidos por la comunidad",
  },
  "/games": {
    title: "Juegos de estudio",
    subtitle: "Aprende jugando. Elige un modo y pon a prueba tu conocimiento.",
  },
  "/games/survival": {
    title: "Modo Supervivencia",
    subtitle: "¿Cuántas rondas aguantas sin fallar?",
  },
  "/games/memoria": {
    title: "Modo Memoria",
    subtitle: "Empareja cada pregunta con su respuesta.",
  },
  "/games/contrarreloj": {
    title: "Modo Contrarreloj",
    subtitle: "¿Cuánto aguantas con el tiempo en contra?",
  },
  "/games/escritura": {
    title: "Modo Escritura",
    subtitle: "Escribe tu respuesta y comprueba si la sabías.",
  },
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dueCount, setDueCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    flashCardsApi
      .getReviewStats()
      .then((s) => setDueCount(s.due))
      .catch(() => {});
  }, [user]);

  const pageInfo = pageTitles[location.pathname] || {
    title: "Dashboard",
    subtitle: "Flashy",
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/categories");
  };

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "US";

  return (
    <div className="ds-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="ds-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`ds-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="ds-brand">
          <div className="ds-brand-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="ds-brand-name">Flashy</span>
        </div>

        {/* Nav */}
        <nav className="ds-nav">
          {/* Home — always at top */}
          <Link
            to="/dashboard"
            className={`ds-nav-item ds-nav-home ${isActive("/dashboard", true) ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="ds-nav-icon">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="ds-nav-label">Inicio</span>
            {isActive("/dashboard", true) && <span className="ds-active-dot" />}
          </Link>

          {navSections.map((section) => (
            <div key={section.label} className="ds-nav-section">
              <p className="ds-section-label">{section.label}</p>
              {section.items.map((item) =>
                item.disabled ? (
                  <div key={item.id} className="ds-nav-item disabled">
                    <span className="ds-nav-icon">{item.icon}</span>
                    <span className="ds-nav-label">{item.label}</span>
                    <span className="ds-coming-badge">Pronto</span>
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`ds-nav-item ${isActive(item.path, item.exact) ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="ds-nav-icon">{item.icon}</span>
                    <span className="ds-nav-label">{item.label}</span>
                    {item.id === "repaso" && dueCount > 0 && (
                      <span className="ds-due-badge">
                        {dueCount > 99 ? "99+" : dueCount}
                      </span>
                    )}
                    {isActive(item.path, item.exact) && (
                      <span className="ds-active-dot" />
                    )}
                  </Link>
                ),
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="ds-user">
          <div className="ds-user-avatar">{userInitials}</div>
          <div className="ds-user-info">
            <p className="ds-user-name">{userInitials}</p>
            <p className="ds-user-email">{user?.email}</p>
          </div>
          <button
            className="ds-logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ds-main">
        {/* Topbar */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <button
              className="ds-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="ds-topbar-title-block">
              <h1 className="ds-page-title">{pageInfo.title}</h1>
              <p className="ds-breadcrumb">Flashy / {pageInfo.title}</p>
            </div>
          </div>
          <div className="ds-topbar-right">
            <button
              className="ds-theme-btn"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
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
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
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
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link
              to="/dashboard"
              className="ds-topbar-home-btn"
              title="Ir al inicio"
            >
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <AiUsagePulseBar />
            <div className="ds-topbar-avatar" title={user?.email}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="ds-content">{children}</main>
      </div>
      <GenerationQueueWidget />
    </div>
  );
};

const DashboardLayoutWithQueue: React.FC<DashboardLayoutProps> = (props) => (
  <GenerationQueueProvider>
    <DashboardLayout {...props} />
  </GenerationQueueProvider>
);

export default DashboardLayoutWithQueue;
