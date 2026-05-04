// API client and modules
export { default as apiClient } from "./client";
export { authApi } from "./auth";
export { flashCardsApi } from "./flashcards";
export { examSimulationApi } from "./examSimulation";

// Types
export type { LoginRequest, SignupRequest, AuthResponse, User } from "./auth";

export type {
  FlashCard,
  CreateManualFlashCardRequest,
  FlashCardsResponse,
  GenerateFlashCardResponse,
} from "./flashcards";
