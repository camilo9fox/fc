import { useState } from "react";
import { flashCardsApi, GenerateFlashCardResponse } from "../api";
import { FlashCardData } from "../interfaces/interfaces";

export const useFlashCard = () => {
  const [flashCardData, setFlashCardData] = useState<FlashCardData>({
    question: "",
    answer: "",
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
      const data: GenerateFlashCardResponse =
        await flashCardsApi.generateFlashCard(
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

  return {
    flashCardData,
    selectedFile,
    inputText,
    handleFileChange,
    handleTextChange,
    handleGenerateFlashCard,
    isLoading,
    error,
  };
};
