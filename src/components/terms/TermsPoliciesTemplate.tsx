import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Logo from "../logo/Logo";
import "./Terms.css";

interface ITermsPolicies {
  title: string;
  description?: string;
  date: string;
  termsPoliciesList: ITermPoliceSection[];
}

interface ITermPoliceSection {
  id: string;
  title: string;
  content: string[];
}

const TermsPoliciesTemplate = ({
  title,
  description,
  date,
  termsPoliciesList,
}: ITermsPolicies) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const setSectionRef = useCallback((id: string, el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [termsPoliciesList]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);
    }
  };

  return (
    <div className="tp-shell">
      <div className="tp-topbar">
        <button
          className="tp-back-btn"
          onClick={() => window.history.back()}
          aria-label="Volver atrás"
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Volver</span>
        </button>
        <div className="tp-topbar-brand">
          <Logo size="extraSmall" />
          <span>Flashy</span>
        </div>
        <div className="tp-topbar-links">
          <Link to="/terms" className={title.includes("Términos") ? "tp-link-active" : ""}>
            Términos
          </Link>
          <Link to="/policies" className={title.includes("Privacidad") ? "tp-link-active" : ""}>
            Privacidad
          </Link>
        </div>
      </div>

      <div className="tp-layout">
        <aside className="tp-sidebar">
          <button
            className="tp-mobile-toc-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Cerrar índice" : "Índice de contenidos"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <nav className={`tp-toc ${menuOpen ? "tp-toc-open" : ""}`}>
            <span className="tp-toc-label">Contenido</span>
            {termsPoliciesList.map((section) => (
              <button
                key={section.id}
                className={`tp-toc-link ${activeSection === section.id ? "tp-toc-link-active" : ""}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="tp-main">
          <article className="tp-article">
            <header className="tp-article-header">
              <h1>{title}</h1>
              <time className="tp-article-date">Vigente desde: {date}</time>
              {description && <p className="tp-article-intro">{description}</p>}
            </header>

            <div className="tp-article-body">
              {termsPoliciesList.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => setSectionRef(section.id, el)}
                  className="tp-section"
                  aria-labelledby={`h-${section.id}`}
                >
                  <h2 id={`h-${section.id}`} className="tp-section-title">
                    {section.title}
                  </h2>
                  <ul className="tp-section-list">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <span className="tp-bullet" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <footer className="tp-article-footer">
              <p>
                Si tienes preguntas sobre este documento, contáctanos a través de nuestros
                canales de soporte en la aplicación.
              </p>
              <button
                className="tp-scroll-top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Volver arriba
              </button>
            </footer>
          </article>
        </main>
      </div>
    </div>
  );
};

export default TermsPoliciesTemplate;
