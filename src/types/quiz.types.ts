import { Quiz, DraftQuizQuestion } from "../api/quiz";

export interface DraftQuizState {
  title: string;
  categoryId: string;
  description?: string;
  questions: DraftQuizQuestion[];
}

export const quizToDraft = (quiz: Quiz): DraftQuizState => ({
  title: quiz.title,
  categoryId: quiz.category?.id || "",
  description: quiz.description ?? undefined,
  questions: (quiz.questions || []).map((q, i) => ({
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation ?? null,
    order_index: i,
  })),
});
