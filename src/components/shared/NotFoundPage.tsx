import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="nf-page">
      <div className="nf-card">
        <div className="nf-code" aria-hidden="true">
          404
        </div>
        <h1 className="nf-title">Página no encontrada</h1>
        <p className="nf-sub">
          La ruta <code className="nf-path">{location.pathname}</code> no existe
          en esta aplicación.
        </p>
        <div className="nf-actions">
          <button className="nf-btn-primary" onClick={() => navigate("/")}>
            Ir al inicio
          </button>
          <button className="nf-btn-secondary" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
