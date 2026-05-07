import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Coins,
  HelpCircle,
  Layers,
  Search,
  Settings,
} from "lucide-react";
import "./FaqPage.css";

// ── Types ──────────────────────────────────────────────────────────────────

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  entries: FaqEntry[];
}

// ── Data ───────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    icon: <HelpCircle size={15} />,
    entries: [
      {
        question: "¿Qué es Flashy?",
        answer:
          "Flashy es una plataforma de estudio inteligente que usa inteligencia artificial para generar flashcards, cuestionarios, guías de estudio y más a partir de tus propios materiales.",
      },
      {
        question: "¿Es gratuito?",
        answer:
          "Puedes usar Flashy de forma gratuita con un plan de créditos mensuales. Las funciones de generación IA consumen créditos; las funciones básicas como repasar tarjetas creadas manualmente no los consumen.",
      },
      {
        question: "¿En qué dispositivos funciona?",
        answer:
          "Flashy funciona en cualquier navegador moderno. También puedes instalarlo como aplicación en tu móvil (PWA) desde el botón que aparece en la barra inferior.",
      },
      {
        question: "¿Mis datos están seguros?",
        answer:
          "Sí. Todo tu contenido se almacena de forma segura en la nube y solo tú tienes acceso. Nunca compartimos tu información con terceros.",
      },
    ],
  },
  {
    id: "content",
    label: "Contenido",
    icon: <BookOpen size={15} />,
    entries: [
      {
        question: "¿Qué tipos de archivos puedo subir?",
        answer:
          "Puedes subir archivos PDF y documentos de texto. El sistema extrae el contenido y lo usa para generar material de estudio automáticamente.",
      },
      {
        question: "¿Cómo creo flashcards con IA?",
        answer:
          "Ve a Flashcards, selecciona una categoría y elige la opción de generar con IA. Sube un archivo o pega texto y la IA creará tarjetas de pregunta-respuesta en segundos.",
      },
      {
        question: "¿Qué es la simulación de examen?",
        answer:
          "La simulación de examen combina preguntas de múltiple opción, verdadero/falso y respuesta corta en un formato de tiempo limitado, similar a una evaluación real.",
      },
      {
        question: "¿Qué es el repaso espaciado?",
        answer:
          "El repaso espaciado es una técnica que programa tus repasos justo antes de que olvides un concepto. Flashy lo aplica automáticamente en la sección de Flashcards para maximizar la retención a largo plazo.",
      },
      {
        question: "¿Puedo crear contenido manualmente sin IA?",
        answer:
          "Sí. En todas las secciones puedes crear flashcards, preguntas y guías de forma manual, sin consumir créditos.",
      },
    ],
  },
  {
    id: "credits",
    label: "Créditos IA",
    icon: <Coins size={15} />,
    entries: [
      {
        question: "¿Qué son los créditos?",
        answer:
          "Los créditos son la unidad que mide el uso de funciones de inteligencia artificial. Cada vez que generas contenido con IA se consume una cantidad según la complejidad de la tarea.",
      },
      {
        question: "¿Cómo obtengo más créditos?",
        answer:
          "Los créditos se recargan cada mes según tu plan. Puedes ver tu saldo y uso histórico en la sección de Perfil.",
      },
      {
        question: "¿Qué pasa si me quedo sin créditos?",
        answer:
          "Podrás seguir usando Flashy para repasar contenido existente, jugar los modos de juego y crear tarjetas manualmente. Solo las funciones de generación IA quedarán en pausa hasta la recarga mensual.",
      },
      {
        question: "¿Cuántos créditos consume cada función?",
        answer:
          "El coste varía según la función: generar flashcards cuesta entre 5 y 15 créditos, los cuestionarios entre 8 y 20, y las guías de estudio entre 10 y 30 dependiendo de la longitud del material.",
      },
    ],
  },
  {
    id: "account",
    label: "Cuenta y configuración",
    icon: <Settings size={15} />,
    entries: [
      {
        question: "¿Cómo cambio mi contraseña?",
        answer:
          "Ve a Perfil desde el menú lateral y en la sección Seguridad podrás cambiar tu contraseña. Te enviaremos un correo de confirmación.",
      },
      {
        question: "¿Puedo exportar mis datos?",
        answer:
          "La exportación de datos estará disponible próximamente. Mientras tanto, todo tu contenido queda guardado en la nube y accesible desde cualquier dispositivo.",
      },
      {
        question: "¿Cómo elimino mi cuenta?",
        answer:
          "En la sección de Perfil encontrarás la opción de eliminar cuenta. Esta acción es irreversible y borrará todo tu contenido y créditos acumulados.",
      },
      {
        question: "¿Puedo usar Flashy sin conexión?",
        answer:
          "Al instalarlo como PWA tendrás acceso básico al contenido ya cargado. Las funciones de generación IA y sincronización requieren conexión a internet.",
      },
    ],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────

interface FaqItemProps {
  entry: FaqEntry;
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ entry, isOpen, onToggle }) => (
  <div className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
    <button
      className="faq-item-trigger"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span className="faq-item-question">{entry.question}</span>
      <ChevronDown size={15} className="faq-item-chevron" aria-hidden="true" />
    </button>
    {isOpen && (
      <div className="faq-item-answer" role="region">
        <p>{entry.answer}</p>
      </div>
    )}
  </div>
);

interface FaqCategoryPanelProps {
  category: FaqCategory;
  openId: string | null;
  onToggle: (id: string) => void;
}

const FaqCategoryPanel: React.FC<FaqCategoryPanelProps> = ({
  category,
  openId,
  onToggle,
}) => (
  <section className="faq-category">
    <h2 className="faq-category-title">
      <span className="faq-category-icon" aria-hidden="true">
        {category.icon}
      </span>
      {category.label}
    </h2>
    <div className="faq-items">
      {category.entries.map((entry) => {
        const id = `${category.id}:${entry.question}`;
        return (
          <FaqItem
            key={id}
            entry={entry}
            isOpen={openId === id}
            onToggle={() => onToggle(id)}
          />
        );
      })}
    </div>
  </section>
);

// ── Page ───────────────────────────────────────────────────────────────────

const FaqPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    entries: cat.entries.filter(
      (e) =>
        e.question.toLowerCase().includes(query) ||
        e.answer.toLowerCase().includes(query),
    ),
  })).filter((cat) => cat.entries.length > 0);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq-page">
      <header className="faq-header">
        <div className="faq-header-icon" aria-hidden="true">
          <HelpCircle size={26} />
        </div>
        <div>
          <h1 className="faq-title">Preguntas frecuentes</h1>
          <p className="faq-subtitle">
            Todo lo que necesitas saber sobre Flashy.
          </p>
        </div>
      </header>

      <div className="faq-search-wrap">
        <Search size={14} className="faq-search-icon" aria-hidden="true" />
        <input
          className="faq-search-input"
          type="search"
          placeholder="Buscar pregunta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar en preguntas frecuentes"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="faq-empty" role="status">
          <Layers size={30} aria-hidden="true" />
          <p>Sin resultados para &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="faq-body">
          {filteredCategories.map((cat) => (
            <FaqCategoryPanel
              key={cat.id}
              category={cat}
              openId={openId}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqPage;
