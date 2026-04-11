import { useState, useRef } from "react";
import { flashCardsApi, GenerateFlashCardResponse } from "../api";
import { FlashCardData } from "../interfaces/interfaces";

export const useFlashCard = () => {
  const flashCardRef = useRef<HTMLDivElement>(null);
  const [flashCardData, setFlashCardData] = useState<FlashCardData>({
    question: "",
    answer: "",
    options: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  const handleGenerateFlashCard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: GenerateFlashCardResponse = await flashCardsApi.generateFlashCard(
        selectedFile ?? undefined,
        inputText.trim() || undefined,
      );
      setFlashCardData(data);
    } catch (error: any) {
      console.error("Error generating flashcard:", error);
      setError(error.response?.data?.error || "Error al generar la flashcard");
    } finally {
      setIsLoading(false);
    }
  };

  const flipCard = () => {
    if (flashCardRef.current) {
      flashCardRef.current.classList.add("flipped");
      console.log("Card flipped");
    }
  };

  const resetCard = () => {
    if (flashCardRef.current) {
      flashCardRef.current.classList.remove("flipped");
    }
  };

  return {
    flashCardData,
    selectedFile,
    inputText,
    flipCard,
    resetCard,
    flashCardRef,
    handleFileChange,
    handleTextChange,
    handleGenerateFlashCard,
    isLoading,
    error,
  };
};
