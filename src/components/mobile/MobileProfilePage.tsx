import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { MobileHero, MobileProfileShortcut, MobileSection } from "./MobileUi";
import "./MobilePages.css";

const MobileProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "US";

  return (
    <div className="mb-page">
      <MobileHero
        eyebrow="Perfil"
        title="Tu cuenta movil"
        description="Configura tu cuenta, revisa tu actividad y ajusta tu experiencia."
        variant="profile"
      />

      <section className="mb-profile-card">
        <div className="mb-profile-avatar">{initials}</div>
        <div className="mb-profile-info">
          <h3>{user?.email || "Usuario"}</h3>
          <p>Gestiona tus preferencias y seguridad desde aquí.</p>
        </div>
      </section>

      <MobileSection title="Atajos de cuenta">
        <div className="mb-list">
          <MobileProfileShortcut to="/profile" label="Editar perfil" />
          <MobileProfileShortcut
            to="/historial"
            label="Historial de actividad"
          />
          <MobileProfileShortcut to="/m/home" label="Panel de progreso" />
        </div>
      </MobileSection>

      <MobileSection title="Soporte">
        <div className="mb-list">
          <MobileProfileShortcut to="/faq" label="Preguntas frecuentes" />
        </div>
      </MobileSection>

      <MobileSection title="Apoyar">
        <div className="mb-list">
          <a
            href="https://www.buymeacoffee.com/flashy"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-bmc-link"
            style={{ textDecoration: "none" }}
          >
            <span className="mb-bmc-icon">☕</span>
            <span className="mb-bmc-label">Buy Me a Coffee</span>
            <span className="mb-list-chevron">›</span>
          </a>
        </div>
      </MobileSection>

      <button
        className="mb-logout-btn"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default MobileProfilePage;
