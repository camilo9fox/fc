import React from "react";
import { Link } from "react-router-dom";
import "./MobilePages.css";
import Logo from "../logo/Logo";

const MobileLandingPage: React.FC = () => {
  return (
    <div className="mbl-page">
      {/* Header */}
      <header className="mbl-header">
        <div className="mbl-brand">
          <Logo />

          <span className="mbl-brand-name">FlashyLab</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mbl-hero">
        <div className="mbl-hero-glow" />
        <div className="mbl-pill">
          <span className="mbl-pill-dot" />
          Modelos de Groq · Generación con IA
        </div>
        <h1 className="mbl-hero-h1">
          Convierte tus notas
          <br />
          en <span className="mbl-hero-accent">dominio real</span>
        </h1>
        <p className="mbl-hero-sub">
          Genera flashcards, cuestionarios, guías y simulacros desde cualquier
          PDF o texto. O créalos tú mismo.
        </p>
        <div className="mbl-hero-ctas">
          <Link to="/signup" className="mbl-btn mbl-btn--primary">
            Crear cuenta gratis
          </Link>
          <Link to="/login" className="mbl-btn mbl-btn--ghost">
            Ya tengo cuenta
          </Link>
        </div>
        <p className="mbl-hero-proof">
          ✓ Sin tarjeta de crédito · ✓ Acceso inmediato
        </p>
      </section>

      {/* Tools grid */}
      <section className="mbl-tools">
        <p className="mbl-tools-label">6 herramientas · 2 enfoques</p>
        <div className="mbl-tools-grid">
          <div className="mbl-tool mbl-tool--purple">
            <span className="mbl-tool-icon">🃏</span>
            <span className="mbl-tool-label">Flashcards</span>
          </div>
          <div className="mbl-tool mbl-tool--rose">
            <span className="mbl-tool-icon">✏️</span>
            <span className="mbl-tool-label">Cuestionarios</span>
          </div>
          <div className="mbl-tool mbl-tool--teal">
            <span className="mbl-tool-icon">✔️</span>
            <span className="mbl-tool-label">Verdadero / Falso</span>
          </div>
          <div className="mbl-tool mbl-tool--amber">
            <span className="mbl-tool-icon">📖</span>
            <span className="mbl-tool-label">Guías de estudio</span>
          </div>
          <div className="mbl-tool mbl-tool--indigo">
            <span className="mbl-tool-icon">🎯</span>
            <span className="mbl-tool-label">Simulacro</span>
          </div>
          <div className="mbl-tool mbl-tool--green">
            <span className="mbl-tool-icon">📚</span>
            <span className="mbl-tool-label">Biblioteca</span>
          </div>
        </div>
      </section>

      {/* Dual approach */}
      <section className="mbl-dual">
        <div className="mbl-dual-card mbl-dual-card--ai">
          <span className="mbl-dual-icon">🤖</span>
          <div className="mbl-dual-body">
            <h3>Generación con IA</h3>
            <p>
              Sube un PDF o texto y los modelos de Groq crean el contenido por
              ti.
            </p>
          </div>
        </div>
        <div className="mbl-dual-card mbl-dual-card--manual">
          <span className="mbl-dual-icon">✍️</span>
          <div className="mbl-dual-body">
            <h3>Creación manual</h3>
            <p>Construye flashcards, cuestionarios y más desde cero, sin IA.</p>
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="mbl-steps">
        <div className="mbl-step">
          <div className="mbl-step-num">01</div>
          <div className="mbl-step-body">
            <h3>Sube tu material</h3>
            <p>PDF, texto o escribe directamente tus apuntes.</p>
          </div>
        </div>
        <div className="mbl-step">
          <div className="mbl-step-num">02</div>
          <div className="mbl-step-body">
            <h3>La IA genera</h3>
            <p>
              Los modelos de Groq extraen conceptos y crean tu contenido de
              estudio.
            </p>
          </div>
        </div>
        <div className="mbl-step">
          <div className="mbl-step-num">03</div>
          <div className="mbl-step-body">
            <h3>Estudia y domina</h3>
            <p>Repasa, sigue tu progreso y comparte con la comunidad.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mbl-cta">
        <h2>Empieza gratis hoy</h2>
        <p>
          Seis herramientas de estudio. PDFs de 600+ páginas. Creación con IA o
          manual.
        </p>
        <Link to="/signup" className="mbl-btn mbl-btn--primary mbl-btn--full">
          Crear cuenta gratis →
        </Link>
        <Link to="/login" className="mbl-btn mbl-btn--link">
          Ya tengo una cuenta
        </Link>
      </section>

      {/* Footer */}
      <footer className="mbl-footer">
        <p>© 2026 FlashyLab · Aprende más inteligente con IA</p>
      </footer>
    </div>
  );
};

export default MobileLandingPage;
