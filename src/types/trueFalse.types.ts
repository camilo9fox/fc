import { TrueFalseSet, DraftTrueFalseQuestion } from "../api/trueFalse";

export interface DraftTFState {
  title: string;
  categoryId: string;
  description?: string;
  questions: DraftTrueFalseQuestion[];
}

export const setToDraft = (set: TrueFalseSet): DraftTFState => ({
  title: set.title,
  categoryId: set.category?.id || "",
  description: set.description ?? undefined,
  questions: (set.questions || []).map((q, i) => ({
    statement: q.statement,
    is_true: q.is_true,
    explanation: q.explanation ?? null,
    order_index: i,
  })),
});
