import { useState, useCallback, useEffect, useRef } from "react";
import { askGroqAI } from "../api/groqApi";
import { FlashCardData } from "../interfaces/interfaces";

export const useFlashCard = () => {
  // State and logic for flash card can be implemented here
  const flashCardRef = useRef<HTMLDivElement>(null);
  const [flashCardData, setFlashCardData] = useState<FlashCardData>({
    question: "",
    answer: "",
    options: [],
  });

  const hasFetched = useRef(false);

  const getFlashCardData = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const response = await askGroqAI(
        "Genera una pregunta, respuesta, y 3 opciones (que seran las alternativas a elegir) para una tarjeta de estudio sobre el tema: Asignatura Biologia, funciones de las células..",
        "Responde de forma breve, concisa, clara y detallada.",
        '{question: "Tu pregunta aquí", answer: "Tu respuesta aquí", options: ["Opción 1", "Opción 2", "Opción 3"]}',
      );
      console.log({ response });
      const data = JSON.parse(response!);
      setFlashCardData(data);
    } catch (error) {
      console.error("Error fetching flash card data:", error);
    }
  };

  const flipCard = () => {
    if (flashCardRef.current) {
      flashCardRef.current.classList.add("flipped");
      console.log("Card flipped");
    }
  };

  useEffect(() => {
    getFlashCardData();
  }, []);

  return {
    flashCardData,
    flipCard,
    flashCardRef,
  };
};
