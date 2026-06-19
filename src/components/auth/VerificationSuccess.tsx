import React, { useEffect } from "react";
import { CheckCircle, ArrowRight, Sparkles, ShieldCheck, LogIn } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./VerificationSuccess.css";

const VerificationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hash = new URLSearchParams(window.location.hash.substring(1));

  const isValid =
    searchParams.get("type") === "signup" ||
    hash.get("type") === "signup";

  useEffect(() => {
    if (!isValid) {
      navigate("/login", { replace: true });
    }
  }, [isValid, navigate]);

  if (!isValid) return null;

  return (
    <div className="auth-shell">
      <div className="auth-backdrop" />
      <div className="auth-layout auth-layout-verify">
        <aside className="auth-showcase" aria-hidden="true">
          <div className="auth-showcase-badge">
            <Sparkles size={14} />
            <span>FlashyLab</span>
          </div>
          <h1 className="auth-showcase-title">
            ¡Verificada con
            <br />
            <span className="auth-highlight">éxito!</span>
          </h1>
          <p className="auth-showcase-text">
            Tu email fue verificado correctamente. Ahora tenés acceso completo
            a todas las herramientas de estudio con IA.
          </p>
          <div className="auth-showcase-pills">
            <span>Creá flashcards con IA</span>
            <span>Cuestionarios automáticos</span>
            <span>Guías de estudio</span>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="verify-success-title">
          <div className="auth-card-head">
            <p className="auth-kicker">Verificación</p>
            <h2 id="verify-success-title">Cuenta verificada</h2>
            <p className="auth-subtitle">Ahora podés iniciar sesión y empezar a estudiar.</p>
          </div>

          <div className="verify-success-icon-wrap">
            <div className="verify-success-ring">
              <CheckCircle size={48} className="verify-success-check" />
            </div>
          </div>

          <div className="verify-success-features">
            <div className="verify-success-feature">
              <ShieldCheck size={18} />
              <span>Cuenta protegida y verificada</span>
            </div>
            <div className="verify-success-feature">
              <Sparkles size={18} />
              <span>30 créditos de IA semanales</span>
            </div>
            <div className="verify-success-feature">
              <LogIn size={18} />
              <span>Listo para iniciar sesión</span>
            </div>
          </div>

          <button
            className="auth-btn-primary verify-success-btn"
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
            <ArrowRight size={18} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default VerificationSuccess;
