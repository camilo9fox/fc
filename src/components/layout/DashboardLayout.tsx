import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
    label: "Herramientas",
    items: [
      {
        id: "dashboard",
        label: "Panel de estadísticas",
        path: "/dashboard",
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        ),
      },
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
    ],
  },
  {
    label: "Próximamente",
    items: [
      {
        id: "games",
        label: "Juegos de estudio",
        path: "/games",
        disabled: true,
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
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Panel de estadísticas",
    subtitle: "Resumen de tu actividad de estudio",
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
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageInfo = pageTitles[location.pathname] || {
    title: "Dashboard",
    subtitle: "StudyAI",
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
          <span className="ds-brand-name">StudyAI</span>
        </div>

        {/* Nav */}
        <nav className="ds-nav">
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
              <p className="ds-breadcrumb">StudyAI / {pageInfo.title}</p>
            </div>
          </div>
          <div className="ds-topbar-right">
            <Link
              to="/categories"
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
            <div className="ds-topbar-avatar" title={user?.email}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="ds-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
