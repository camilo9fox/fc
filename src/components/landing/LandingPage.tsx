import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./LandingPage.css";
import Logo from "../logo/Logo";

/* tiny intersection-observer hook for scroll animations */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* animated counter */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const duration = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const featuresRef = useInView();
  const howRef = useInView();
  const toolsRef = useInView();
  const statsRef = useInView();
  const ctaRef = useInView();

  return (
    <div className="lp">
      {/* NAVBAR */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-brand">
            {/* <svg
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
              </svg> */}
            <Logo />

            <span className="lp-brand-name">Flashy</span>
          </div>
          <div className="lp-nav-actions">
            {user ? (
              <Link to="/flashcards" className="lp-btn lp-btn--primary">
                Ir al dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="lp-btn lp-btn--ghost">
                  Iniciar sesión
                </Link>
                <Link to="/signup" className="lp-btn lp-btn--primary">
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-glow lp-hero-glow--1" />
        <div className="lp-hero-glow lp-hero-glow--2" />
        <div className="lp-hero-glow lp-hero-glow--3" />

        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <div className="lp-pill lp-pill--animated">
              <span className="lp-pill-dot" />
              Modelos de Groq · Generación con IA
            </div>

            <h1 className="lp-hero-h1">
              Convierte tus notas
              <br />
              en <span className="lp-gradient-text">dominio real</span>
            </h1>

            <p className="lp-hero-sub">
              Crea con IA o a mano — tú decides. Flashy te deja generar
              flashcards, cuestionarios, guías de estudio y simulacros de examen
              desde cualquier PDF o texto, o construirlos desde cero sin
              depender de la IA.
            </p>

            <div className="lp-hero-ctas">
              <Link to="/signup" className="lp-btn lp-btn--primary lp-btn--lg">
                Crear cuenta gratis
              </Link>
              <Link to="/login" className="lp-btn lp-btn--outline lp-btn--lg">
                Ya tengo cuenta
              </Link>
            </div>

            <div className="lp-hero-proof">
              <span>✓ Sin tarjeta de crédito</span>
              <span>✓ Generación con IA o manual</span>
              <span>✓ PDFs de 600+ páginas</span>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-preview">
              <div className="lp-preview-card lp-preview-card--back" />
              <div className="lp-preview-card lp-preview-card--mid" />
              <div className="lp-preview-card lp-preview-card--front">
                <div className="lp-pcard-header">
                  <span className="lp-pcard-cat">Biología · 24 tarjetas</span>
                  <span className="lp-pcard-ai">IA</span>
                </div>
                <p className="lp-pcard-q">
                  ¿Cuál es la función principal del ADN?
                </p>
                <p className="lp-pcard-a">
                  Almacenar y transmitir la información genética de los
                  organismos.
                </p>
                <div className="lp-pcard-options">
                  <div className="lp-pcard-opt lp-pcard-opt--correct">
                    ✓ Almacenar información genética
                  </div>
                  <div className="lp-pcard-opt">Producir energía celular</div>
                  <div className="lp-pcard-opt">Regular la temperatura</div>
                </div>
              </div>
              <div className="lp-preview-badge lp-preview-badge--top">
                <span className="lp-badge-icon">⚡</span>
                <span>Generado con IA</span>
              </div>
              <div className="lp-preview-badge lp-preview-badge--bottom">
                <span className="lp-badge-dot lp-badge-dot--green" />
                <span>Modo estudio activo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="lp-statsbar" ref={statsRef.ref}>
        <div
          className={`lp-statsbar-inner${statsRef.visible ? " lp-anim-fadein" : ""}`}
        >
          <div className="lp-stat">
            <span className="lp-stat-num">
              <Counter to={6} suffix="+" />
            </span>
            <span className="lp-stat-label">Herramientas de estudio</span>
          </div>
          <div className="lp-statsbar-div" />
          <div className="lp-stat">
            <span className="lp-stat-num">
              <Counter to={600} suffix="+" />
            </span>
            <span className="lp-stat-label">Páginas de PDF soportadas</span>
          </div>
          <div className="lp-statsbar-div" />
          <div className="lp-stat">
            <span className="lp-stat-num">OCR</span>
            <span className="lp-stat-label">Para PDFs escaneados</span>
          </div>
          <div className="lp-statsbar-div" />
          <div className="lp-stat">
            <span className="lp-stat-num">100%</span>
            <span className="lp-stat-label">Conceptual, no metadatos</span>
          </div>
        </div>
      </div>

      {/* ALL TOOLS */}
      <section className="lp-tools" ref={toolsRef.ref}>
        <div
          className={`lp-section-head${toolsRef.visible ? " lp-anim-fadein" : ""}`}
        >
          <p className="lp-kicker">Todo en un solo lugar</p>
          <h2>
            Seis herramientas.
            <br />
            Un solo flujo de estudio.
          </h2>
          <p>
            Genera contenido con IA o créalo tú mismo — ambos enfoques conviven
            en todas las herramientas.
          </p>
        </div>

        <div
          className={`lp-tools-grid${toolsRef.visible ? " lp-anim-fadein lp-anim-delay-1" : ""}`}
        >
          <div className="lp-tool lp-tool--featured">
            <div className="lp-tool-icon lp-tool-icon--purple">
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
            <div className="lp-tool-body">
              <h3>Flashcards con IA</h3>
              <p>
                Sube un PDF o pega texto y la IA genera tarjetas de opción
                múltiple. O créalas tú mismo con pregunta, respuesta y opciones
                de distracción personalizadas — sin IA, sin límites.
              </p>
              <div className="lp-tool-tags">
                <span>Generación con IA</span>
                <span>Creación manual</span>
                <span>Opción múltiple</span>
                <span>Panel 3D</span>
              </div>
            </div>
            <div className="lp-tool-featured-badge">Principal</div>
          </div>

          <div className="lp-tool">
            <div className="lp-tool-icon lp-tool-icon--rose">
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
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="lp-tool-body">
              <h3>Cuestionarios</h3>
              <p>
                Pon a prueba tu comprensión con cuestionarios generados
                automáticamente a partir de tu material, con retroalimentación
                inmediata.
              </p>
              <div className="lp-tool-tags">
                <span>Auto-generado</span>
                <span>Retroalimentación</span>
              </div>
            </div>
          </div>

          <div className="lp-tool">
            <div className="lp-tool-icon lp-tool-icon--teal">
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
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="lp-tool-body">
              <h3>Sets de Verdadero / Falso</h3>
              <p>
                Refuerza afirmaciones clave con ejercicios de V/F generados por
                IA, ideales para repasar rápido antes de un examen.
              </p>
              <div className="lp-tool-tags">
                <span>Repaso rápido</span>
                <span>Afirmaciones clave</span>
              </div>
            </div>
          </div>

          <div className="lp-tool">
            <div className="lp-tool-icon lp-tool-icon--amber">
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
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="lp-tool-body">
              <h3>Guías de Estudio</h3>
              <p>
                Genera resúmenes estructurados con los puntos más importantes de
                tu documento para orientarte antes de estudiar el material
                completo.
              </p>
              <div className="lp-tool-tags">
                <span>Resumen</span>
                <span>Puntos clave</span>
                <span>Markdown</span>
              </div>
            </div>
          </div>

          <div className="lp-tool">
            <div className="lp-tool-icon lp-tool-icon--indigo">
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
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div className="lp-tool-body">
              <h3>Simulacro de Examen</h3>
              <p>
                Simula un examen con preguntas de tus materiales y tiempo
                controlado. Obtén un análisis detallado de tu desempeño al
                terminar.
              </p>
              <div className="lp-tool-tags">
                <span>Tiempo controlado</span>
                <span>Análisis</span>
                <span>Multi-tema</span>
              </div>
            </div>
          </div>

          <div className="lp-tool">
            <div className="lp-tool-icon lp-tool-icon--green">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="lp-tool-body">
              <h3>Biblioteca Pública</h3>
              <p>
                Explora y usa materiales de estudio creados por otros usuarios.
                Clona categorías enteras con un clic y adáptalas a tus
                necesidades.
              </p>
              <div className="lp-tool-tags">
                <span>Comunidad</span>
                <span>Clonar</span>
                <span>Compartir</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-how" ref={howRef.ref}>
        <div
          className={`lp-section-head${howRef.visible ? " lp-anim-fadein" : ""}`}
        >
          <p className="lp-kicker lp-kicker--light">¿Cómo funciona?</p>
          <h2 className="lp-how-h2">
            De tu documento
            <br />a dominar el tema
          </h2>
          <p className="lp-how-sub">
            Sin configuración, sin fricción. Empieza en menos de un minuto.
          </p>
        </div>

        <div
          className={`lp-steps${howRef.visible ? " lp-anim-fadein lp-anim-delay-1" : ""}`}
        >
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <div className="lp-step-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>Sube tu material</h3>
            <p>
              Carga un PDF de hasta 600+ páginas, pega texto o escribe tus
              apuntes directamente.
            </p>
          </div>

          <div className="lp-step-arrow">→</div>

          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <div className="lp-step-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>La IA genera</h3>
            <p>
              Los modelos de Groq extraen los conceptos clave y crean
              flashcards, cuestionarios, guías y más a partir de tu contenido.
            </p>
          </div>

          <div className="lp-step-arrow">→</div>

          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <div className="lp-step-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Estudia y domina</h3>
            <p>
              Repasa con las herramientas que prefieras y sigue tu progreso.
              Comparte tus materiales con la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* WHY FLASHY */}
      <section className="lp-features" ref={featuresRef.ref}>
        <div
          className={`lp-section-head${featuresRef.visible ? " lp-anim-fadein" : ""}`}
        >
          <p className="lp-kicker">¿Por qué Flashy?</p>
          <h2>Diseñado para resultados reales</h2>
          <p>
            No solo genera tarjetas — construye un sistema de aprendizaje
            completo alrededor de tu material.
          </p>
        </div>

        <div
          className={`lp-features-grid${featuresRef.visible ? " lp-anim-fadein lp-anim-delay-1" : ""}`}
        >
          <div className="lp-feat">
            <div className="lp-feat-icon">
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h4>PDF de hasta 600+ páginas</h4>
            <p>
              OCR integrado para PDFs escaneados. Convierte libros, apuntes y
              materiales de clase completos.
            </p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon">
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h4>IA o manual — tú decides</h4>
            <p>
              Genera contenido automáticamente desde un PDF o escríbelo tú
              mismo. Ambos enfoques están disponibles en flashcards,
              cuestionarios, V/F y guías.
            </p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon">
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
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h4>Organización por categorías</h4>
            <p>
              Agrupa todas tus herramientas por materia y publica tus categorías
              para compartirlas con la comunidad.
            </p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon">
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h4>Análisis de desempeño</h4>
            <p>
              Estadísticas de intentos en simulacros y cuestionarios para saber
              exactamente qué repasar.
            </p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon">
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h4>Datos seguros</h4>
            <p>
              Almacenamiento seguro con Supabase. Control total sobre qué
              compartes y qué mantienes privado.
            </p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h4>Contenido conceptual</h4>
            <p>
              La IA extrae conceptos reales, no encabezados ni metadatos. Cada
              tarjeta tiene valor de estudio genuino.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta" ref={ctaRef.ref}>
        <div
          className={`lp-cta-card${ctaRef.visible ? " lp-anim-fadein" : ""}`}
        >
          <div className="lp-cta-glow" />
          <p className="lp-kicker lp-kicker--light">Empieza hoy</p>
          <h2>¿Listo para estudiar de forma más inteligente?</h2>
          <p>
            Crea tu cuenta, sube tu primer documento y genera flashcards,
            cuestionarios y guías. Gratis.
          </p>
          <div className="lp-cta-btns">
            <Link to="/signup" className="lp-btn lp-btn--white lp-btn--lg">
              Crear cuenta gratis →
            </Link>
          </div>
          <div className="lp-cta-proof">
            <span>✓ Sin tarjeta de crédito</span>
            <span>✓ Acceso inmediato</span>
            <span>✓ 6 herramientas incluidas</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-brand lp-brand--small">
            <div className="lp-brand-icon lp-brand-icon--sm">
              <svg
                width="13"
                height="13"
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
            <span className="lp-brand-name">Flashy</span>
          </div>
          <p className="lp-footer-copy">
            © 2026 Flashy · Aprende más inteligente con IA
          </p>
          <div className="lp-footer-links">
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/signup">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
