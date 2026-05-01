import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-backdrop" />

      <div className="auth-layout auth-layout-login">
        <aside className="auth-showcase" aria-hidden="true">
          <div className="auth-showcase-badge">
            <Sparkles size={14} />
            <span>StudyFlow</span>
          </div>

          <h1 className="auth-showcase-title">Vuelve a tu ritmo de estudio</h1>
          <p className="auth-showcase-text">
            Tus flashcards, quizzes y guias listas para continuar donde te
            quedaste.
          </p>

          <div className="auth-showcase-pills">
            <span>Seguimiento diario</span>
            <span>Repaso inteligente</span>
            <span>Generacion con IA</span>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="auth-login-title">
          <div className="auth-card-head">
            <p className="auth-kicker">Bienvenido</p>
            <h2 id="auth-login-title">Iniciar Sesion</h2>
            <p className="auth-subtitle">
              Entra para continuar tu progreso y seguir estudiando.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="email">Correo electronico</label>
              <div className="auth-input-wrap">
                <Mail size={16} />
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Contrasena</label>
              <div className="auth-input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Ingresa tu contrasena"
                />
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={isLoading}>
              <span>
                {isLoading ? "Iniciando sesion..." : "Entrar a mi cuenta"}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta? <Link to="/signup">Registrate</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
