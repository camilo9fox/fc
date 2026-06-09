import React, { createContext, useContext, useState, useCallback } from "react";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
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

interface ProductTourContextValue {
  isRunning: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const ProductTourContext = createContext<ProductTourContextValue>({
  isRunning: false,
  currentStep: 0,
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

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsRunning(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      if (s + 1 >= TOUR_STEPS.length) {
        markTourDone();
        setIsRunning(false);
        return 0;
      }
      return s + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const skipTour = useCallback(() => {
    markTourDone();
    setIsRunning(false);
    setCurrentStep(0);
  }, []);

  return (
    <ProductTourContext.Provider value={{ isRunning, currentStep, startTour, nextStep, prevStep, skipTour }}>
      {children}
    </ProductTourContext.Provider>
  );
};

export const useProductTour = () => useContext(ProductTourContext);
