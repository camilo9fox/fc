import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Mail, UserRound, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const metadata = {
        firstName,
        lastName,
      };
      await signup(email, password, metadata);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-backdrop" />

      <div className="auth-layout auth-layout-signup">
        <aside className="auth-showcase" aria-hidden="true">
          <div className="auth-showcase-badge">
            <Sparkles size={14} />
            <span>StudyFlow</span>
          </div>

          <h1 className="auth-showcase-title">Crea tu espacio de estudio</h1>
          <p className="auth-showcase-text">
            Organiza temas, genera contenido con IA y construye una rutina que
            realmente se mantenga.
          </p>

          <div className="auth-showcase-pills">
            <span>Todo en un solo lugar</span>
            <span>Visual y ordenado</span>
            <span>Disenado para enfoque</span>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="auth-signup-title">
          <div className="auth-card-head">
            <p className="auth-kicker">Comienza hoy</p>
            <h2 id="auth-signup-title">Crear cuenta</h2>
            <p className="auth-subtitle">
              Te tomara menos de un minuto empezar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field-grid">
              <div className="auth-field">
                <label htmlFor="firstName">Nombre</label>
                <div className="auth-input-wrap">
                  <UserRound size={16} />
                  <input
                    type="text"
                    id="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="lastName">Apellido</label>
                <div className="auth-input-wrap">
                  <UserRound size={16} />
                  <input
                    type="text"
                    id="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
            </div>

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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Minimo 6 caracteres"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirmar contrasena</label>
              <div className="auth-input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Repite tu contrasena"
                />
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={isLoading}>
              <span>{isLoading ? "Creando cuenta..." : "Crear mi cuenta"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Signup;
