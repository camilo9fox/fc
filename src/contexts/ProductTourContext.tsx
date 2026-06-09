import React, { createContext, useContext, useState, useCallback } from "react";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  path?: string;
}

export const TOUR_STEPS_DESKTOP: TourStep[] = [
  { targetId: "nav-categories", title: "Organiza tu estudio", description: "Crea Temas de estudio para agrupar flashcards, cuestionarios y más. Es el primer paso para mantener todo ordenado." },
  { targetId: "nav-flashcards", title: "Flashcards con IA", description: "Sube un PDF, pega texto o escribe. La IA genera tarjetas pregunta-respuesta en segundos." },
  { targetId: "nav-quizzes", title: "Cuestionarios", description: "Genera preguntas de opción múltiple desde tu material. Cada pregunta incluye 4 alternativas y explicación." },
  { targetId: "nav-truefalse", title: "Verdadero o Falso", description: "Afirmaciones que ponen a prueba tu comprensión. La IA explica cada respuesta." },
  { targetId: "nav-study-guides", title: "Guías de Estudio", description: "Consolida temas en una guía estructurada con resumen, conceptos y preguntas de repaso." },
  { targetId: "nav-exam-simulations", title: "Simulaciones de Examen", description: "Combina V/F, opción múltiple y desarrollo en formato cronometrado. La IA califica tus respuestas." },
  { targetId: "nav-repaso", title: "Repaso Espaciado SM-2", description: "El algoritmo programa tus repasos justo antes de que olvides. Califica cada tarjeta y optimiza tu memoria." },
  { targetId: "nav-games", title: "Aprende jugando", description: "Modo Supervivencia, Memoria, Contrarreloj y Escritura. Refuerza lo aprendido mientras te diviertes." },
  { targetId: "nav-biblioteca", title: "Explora la Biblioteca", description: "Descubre temas públicos creados por la comunidad. Copia cualquier tema a tu biblioteca personal." },
];

export const TOUR_STEPS_MOBILE: TourStep[] = [
  { targetId: "nav-mobile-home", title: "Panel de progreso", description: "Aquí ves tu actividad diaria, tarjetas pendientes y acceso rápido a tus recursos. Es tu punto de partida cada día.", path: "/m/home" },
  { targetId: "nav-mobile-create", title: "Crea contenido", description: "Elige qué quieres crear: flashcards, cuestionarios, guías o simulaciones. Todo desde un solo lugar.", path: "/m/create" },
  { targetId: "nav-mobile-library", title: "Tu biblioteca", description: "Gestiona tus recursos privados o explora temas públicos de la comunidad. Copia lo que te sirva.", path: "/m/library" },
  { targetId: "nav-mobile-games", title: "Aprende jugando", description: "Modo Supervivencia, Memoria, Contrarreloj y Escritura. Refuerza lo aprendido mientras te diviertes.", path: "/games" },
  { targetId: "nav-mobile-profile", title: "Tu perfil", description: "Edita tu cuenta, revisa tu historial, repite el tutorial o cierra sesión.", path: "/m/profile" },
];

interface ProductTourContextValue {
  isRunning: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (isMobile?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const ProductTourContext = createContext<ProductTourContextValue>({
  isRunning: false,
  currentStep: 0,
  steps: TOUR_STEPS_DESKTOP,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
});

const TOUR_DONE_KEY = "Flashy:product-tour-done";

export const isProductTourDone = (): boolean => {
  return localStorage.getItem(TOUR_DONE_KEY) === "1";
};

const markTourDone = () => {
  localStorage.setItem(TOUR_DONE_KEY, "1");
};

export const ProductTourProvider: React.FC<{ children: React.ReactNode; autoStart?: boolean }> = ({ children, autoStart = false }) => {
  const [isRunning, setIsRunning] = useState(autoStart && !isProductTourDone());
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>(TOUR_STEPS_DESKTOP);

  const startTour = useCallback((isMobile?: boolean) => {
    setSteps(isMobile ? TOUR_STEPS_MOBILE : TOUR_STEPS_DESKTOP);
    setCurrentStep(0);
    setIsRunning(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      if (s + 1 >= steps.length) {
        markTourDone();
        setIsRunning(false);
        return 0;
      }
      return s + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const skipTour = useCallback(() => {
    markTourDone();
    setIsRunning(false);
    setCurrentStep(0);
  }, []);

  return (
    <ProductTourContext.Provider value={{ isRunning, currentStep, steps, startTour, nextStep, prevStep, skipTour }}>
      {children}
    </ProductTourContext.Provider>
  );
};

export const useProductTour = () => useContext(ProductTourContext);
