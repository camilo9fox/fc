import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* ───── Navbar ───── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-brand-icon">
            <svg
              width="18"
              height="18"
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
          <span className="landing-brand-name">StudyAI</span>
        </div>
        <div className="landing-nav-links">
          {user ? (
            <Link to="/flashcards" className="landing-btn primary">
              Ir al dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-btn ghost">
                Iniciar sesión
              </Link>
              <Link to="/signup" className="landing-btn primary">
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <span className="badge-dot" />
            Impulsado por Llama 3.1 · Generación en segundos
          </div>
          <h1>
            Estudia más inteligente,
            <br />
            <span className="hero-gradient-text">no más difícil</span>
          </h1>
          <p className="hero-subtitle">
            Convierte cualquier texto o documento en flashcards interactivas con
            IA. Organiza tu conocimiento, estudia a tu ritmo y domina cualquier
            tema.
          </p>
          <div className="hero-cta-row">
            <Link to="/signup" className="landing-btn primary large">
              Crear cuenta gratis
            </Link>
            <Link to="/login" className="landing-btn ghost large">
              Ya tengo cuenta →
            </Link>
          </div>
          <div className="hero-proof">
            <span>✓ Sin tarjeta de crédito</span>
            <span>✓ Genera en segundos</span>
            <span>✓ Organización inteligente</span>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="hero-card-stack">
            <div className="hero-card card-bg-3">
              <div className="hero-card-top">
                <span className="hero-card-cat">Historia</span>
              </div>
              <div className="hero-card-q">
                ¿Cuál fue la causa principal de la Primera Guerra Mundial?
              </div>
            </div>
            <div className="hero-card card-bg-2">
              <div className="hero-card-top">
                <span className="hero-card-cat">Química</span>
              </div>
              <div className="hero-card-q">¿Qué es la tabla periódica?</div>
              <div className="hero-card-a">
                Organización sistemática de los elementos químicos por número
                atómico...
              </div>
            </div>
            <div className="hero-card card-bg-1">
              <div className="hero-card-top">
                <span className="hero-card-cat">Biología · 24 tarjetas</span>
                <span className="hero-card-ai-badge">IA</span>
              </div>
              <div className="hero-card-q">¿Cuál es la función del ADN?</div>
              <div className="hero-card-a">
                Almacenar y transmitir la información genética de los
                organismos.
              </div>
              <div className="hero-card-options">
                <span className="hero-option correct">
                  ✓ Almacenar información genética
                </span>
                <span className="hero-option">Producir energía celular</span>
                <span className="hero-option">Regular la temperatura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Stats strip ───── */}
      <div className="landing-stats-strip">
        <div className="stats-strip-item">
          <span className="stats-number">⚡</span>
          <span>Genera flashcards en segundos</span>
        </div>
        <div className="stats-strip-divider" />
        <div className="stats-strip-item">
          <span className="stats-number">📄</span>
          <span>PDFs de hasta 600+ páginas</span>
        </div>
        <div className="stats-strip-divider" />
        <div className="stats-strip-item">
          <span className="stats-number">🎯</span>
          <span>Contenido conceptual, no metadatos</span>
        </div>
        <div className="stats-strip-divider" />
        <div className="stats-strip-item">
          <span className="stats-number">🔒</span>
          <span>Datos seguros con Supabase</span>
        </div>
      </div>

      {/* ───── Features ───── */}
      <section className="landing-features">
        <div className="landing-section-header">
          <p className="landing-kicker">Características</p>
          <h2>Todo lo que necesitas para estudiar</h2>
          <p>
            Diseñado para estudiantes que quieren resultados reales en menos
            tiempo.
          </p>
        </div>
        <div className="landing-features-grid">
          <div className="feature-card featured">
            <div className="feature-icon-wrap purple">
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
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>Generación con IA</h3>
            <p>
              Sube un PDF o pega texto y nuestra IA extrae los conceptos clave
              para crear flashcards de opción múltiple en segundos.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap pink">
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
            </div>
            <h3>Panel de estudio 3D</h3>
            <p>
              Voltea tus tarjetas, responde opciones múltiples y navega con
              teclado en un panel inmersivo diseñado para repasar.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap teal">
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
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Organización por categorías</h3>
            <p>
              Clasifica tus tarjetas por materia o tema. Encuentra todo rápido y
              estudia categoría por categoría.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap orange">
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3>Creación manual</h3>
            <p>
              ¿Prefieres hacerlo tú? Crea tarjetas a mano con pregunta,
              respuesta y opciones de distracción personalizadas.
            </p>
          </div>
          <div className="feature-card coming-soon-card">
            <div className="feature-icon-wrap gray">
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
            </div>
            <h3>Cuestionarios</h3>
            <p>
              Pon a prueba tu conocimiento con cuestionarios adaptativos basados
              en tus flashcards.
            </p>
            <span className="coming-soon-badge">Próximamente</span>
          </div>
          <div className="feature-card coming-soon-card">
            <div className="feature-icon-wrap gray">
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
                <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59 27.2 27.2 0 0 0 .006 9.83A2.18 2.18 0 0 0 4.8 21h0a2.18 2.18 0 0 0 2.07-1.496L7.5 17h9l.63 2.504A2.18 2.18 0 0 0 19.2 21h0a2.18 2.18 0 0 0 2.072-2.58 27.2 27.2 0 0 0 .006-9.83A4 4 0 0 0 17.32 5z" />
                <line x1="6" y1="11" x2="10" y2="11" />
                <line x1="8" y1="9" x2="8" y2="13" />
                <line x1="15" y1="12" x2="15.01" y2="12" />
                <line x1="18" y1="10" x2="18.01" y2="10" />
              </svg>
            </div>
            <h3>Juegos de estudio</h3>
            <p>
              Aprende jugando con modos gamificados que hacen el estudio más
              entretenido y efectivo.
            </p>
            <span className="coming-soon-badge">Próximamente</span>
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section className="landing-how">
        <div className="landing-section-header">
          <p className="landing-kicker">¿Cómo funciona?</p>
          <h2>En 3 simples pasos</h2>
          <p>
            Sin configuración, sin fricción. Empieza a estudiar en menos de un
            minuto.
          </p>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number-wrap">
              <span className="step-number">01</span>
            </div>
            <h3>Sube tu material</h3>
            <p>
              Carga un PDF, pega texto o escribe directamente tus notas de clase
              o apuntes.
            </p>
          </div>
          <div className="steps-arrow">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <div className="landing-step">
            <div className="step-number-wrap">
              <span className="step-number">02</span>
            </div>
            <h3>La IA genera</h3>
            <p>
              El modelo extrae conceptos clave y crea flashcards de opción
              múltiple automáticamente.
            </p>
          </div>
          <div className="steps-arrow">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <div className="landing-step">
            <div className="step-number-wrap">
              <span className="step-number">03</span>
            </div>
            <h3>Estudia y domina</h3>
            <p>
              Usa el panel de estudio interactivo para repasar y consolidar tu
              conocimiento.
            </p>
          </div>
        </div>
      </section>

      {/* ───── CTA bottom ───── */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <div className="cta-glow" />
          <p className="landing-kicker light">Empieza hoy</p>
          <h2>¿Listo para estudiar de forma más inteligente?</h2>
          <p>
            Únete y genera tus primeras flashcards en menos de un minuto.
            Gratis.
          </p>
          <Link to="/signup" className="landing-btn primary large">
            Crear cuenta gratis →
          </Link>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-brand-icon small">
              <svg
                width="14"
                height="14"
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
            <span className="landing-brand-name">StudyAI</span>
          </div>
          <p>© 2026 StudyAI · Aprende más inteligente con IA</p>
          <div className="footer-links">
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/signup">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
