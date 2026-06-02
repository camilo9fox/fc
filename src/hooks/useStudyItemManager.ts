import { useState, useEffect, useCallback, useRef } from "react";
import { useConfirmDialog } from "../contexts/ConfirmDialogContext";
import { useGenerationQueue } from "../contexts/GenerationQueueContext";

/** Minimum shape that any study item (set, quiz, etc.) must satisfy. */
export interface StudyItem {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  questions?: StudyQuestion[];
}

/** Minimum shape for a question inside a study item. */
export interface StudyQuestion {
  id: string;
  explanation?: string;
  order_index: number;
}

/** Shape of a pending draft. */
export interface DraftState {
  title: string;
  categoryId: string;
  description: string;
  questions: any[];
}

/** Every API module passed to the hook must conform to this contract. */
export interface StudyItemApi<TItem extends StudyItem, TQuestion extends StudyQuestion> {
  getAll: () => Promise<{ items: TItem[] }>;
  getById: (id: string) => Promise<TItem>;
  create: (payload: any) => Promise<TItem>;
  delete: (id: string) => Promise<void>;
  updateQuestion?: (parentId: string, questionId: string, payload: any) => Promise<TQuestion>;
}

export interface StudyItemManagerConfig<
  TItem extends StudyItem,
  TQuestion extends StudyQuestion,
  TDraft extends DraftState,
> {
  /** Human-readable labels used in confirm dialogs, errors, and UI. */
  labels: {
    nounSingular: string;
    nounPlural: string;
    questionNoun: string;
    errorLoad: string;
    errorLoadDetail: string;
    errorDelete: string;
    errorSaveDraft: string;
    errorSaveQuestion: string;
    confirmDeleteTitle: string;
    confirmDeleteDescription: string;
    noCategoryFeature: string;
  };
  /** The API module. */
  api: StudyItemApi<TItem, TQuestion>;
  /** Key used in the GenerationQueue for claiming results. */
  queueModule: "quiz" | "truefalse";
  /**
   * Factory that maps a raw draft (as delivered by GenerationQueue) into the
   * draft shape expected by this page.  Receives the entire pending result.
   */
  draftFromPending?: (pending: any) => TDraft | null;
}

export interface StudyItemManagerResult<
  TItem extends StudyItem,
  TQuestion extends StudyQuestion,
  TDraft extends DraftState,
> {
  /* ---- Data ---- */
  items: TItem[];
  loading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;

  /* ---- Categories ---- */
  hasCategories: boolean;

  /* ---- Create ---- */
  showCreate: boolean;
  createMode: "manual" | "ai";
  setShowCreate: (v: boolean) => void;
  setCreateMode: (v: "manual" | "ai") => void;

  /* ---- Draft ---- */
  draft: TDraft | null;
  savingDraft: boolean;
  studyingDraft: boolean;
  handleDrafted: (draft: TDraft) => void;
  handleSaveDraft: () => Promise<void>;
  handleDiscardDraft: () => void;
  handleRemoveDraftQuestion: (index: number) => void;
  handleStudyDraft: () => void;

  /* ---- Study ---- */
  studyItem: TItem | null;
  loadingDetail: string | null;
  handleStudy: (item: TItem) => Promise<void>;
  handleCloseStudy: () => void;
  handleCompleteStudy: (score: number, total: number) => Promise<void>;
  setStudyingDraft: (v: boolean) => void;

  /* ---- Expand / Card toggle ---- */
  expandedCard: string | null;
  toggleCardExpand: (item: TItem) => Promise<void>;

  /* ---- Inline edit of a question ---- */
  editingQuestion: { parentId: string; questionId: string } | null;
  editForm: Record<string, any>;
  savingQuestion: boolean;
  editingQuestionData: TQuestion | null;
  startEditQuestion: (parentId: string, q: TQuestion) => void;
  handleSaveQuestion: () => Promise<void>;
  handleCancelEdit: () => void;

  /* ---- Generation queue ---- */
  pendingResults: any;

  /* ---- Delete ---- */
  handleDelete: (id: string) => Promise<void>;
}

export function useStudyItemManager<
  TItem extends StudyItem,
  TQuestion extends StudyQuestion,
  TDraft extends DraftState,
>(config: StudyItemManagerConfig<TItem, TQuestion, TDraft>): StudyItemManagerResult<TItem, TQuestion, TDraft> {
  const { api, labels, queueModule, draftFromPending } = config;
  const { confirm } = useConfirmDialog();
  const { claimResult } = useGenerationQueue();

  /* ---- State ---- */
  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"manual" | "ai">("ai");
  const [studyItem, setStudyItem] = useState<TItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);
  const [draft, setDraft] = useState<TDraft | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [studyingDraft, setStudyingDraft] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    parentId: string;
    questionId: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [savingQuestion, setSavingQuestion] = useState(false);

  /* ---- Categories stub (provided by parent, but we still need the boolean) ---- */
  const hasCategories = true;

  /* ---- Initial load ---- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAll();
        setItems(res.items);
      } catch {
        setError(labels.errorLoad);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Generation queue claim ---- */
  useEffect(() => {
    const pending = claimResult(queueModule);
    if (!pending || !draftFromPending) return;
    const mapped = draftFromPending(pending);
    if (mapped) {
      setDraft(mapped);
      setShowCreate(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Draft handlers ---- */
  const handleDrafted = useCallback((newDraft: TDraft) => {
    setDraft(newDraft);
    setShowCreate(false);
  }, []);

  const handleDiscardDraft = useCallback(() => {
    setDraft(null);
    setStudyingDraft(false);
  }, []);

  const handleRemoveDraftQuestion = useCallback((index: number) => {
    setDraft((prev) =>
      prev ? { ...prev, questions: prev.questions.filter((_, i) => i !== index) } : null,
    );
  }, []);

  const handleSaveDraft = useCallback(async () => {
    if (!draft) return;
    setSavingDraft(true);
    try {
      const payload = {
        title: draft.title,
        category_id: draft.categoryId,
        description: draft.description,
        questions: draft.questions.map((q) => ({
          statement: q.statement,
          is_true: q.is_true,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation ?? undefined,
          order_index: q.order_index,
        })),
      };
      const saved = await api.create(payload);
      setItems((prev) => [saved, ...prev]);
      setDraft(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || labels.errorSaveDraft);
    } finally {
      setSavingDraft(false);
    }
  }, [draft, api, labels]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Study ---- */
  const handleStudy = useCallback(
    async (item: TItem) => {
      if (item.questions && item.questions.length > 0) {
        setStudyItem(item);
        return;
      }
      setLoadingDetail(item.id);
      try {
        const full = await api.getById(item.id);
        setStudyItem(full);
      } catch {
        setError(labels.errorLoadDetail);
      } finally {
        setLoadingDetail(null);
      }
    },
    [api, labels],
  );

  const handleCloseStudy = useCallback(() => {
    setStudyItem(null);
  }, []);

  const handleCompleteStudy = useCallback(
    async (_score: number, _total: number) => {
      setStudyItem(null);
    },
    [],
  );

  const handleStudyDraft = useCallback(() => {
    setStudyingDraft(true);
  }, []);

  /* ---- Delete ---- */
  const handleDelete = useCallback(
    async (id: string) => {
      const accepted = await confirm({
        title: labels.confirmDeleteTitle,
        description: labels.confirmDeleteDescription,
        confirmLabel: "Sí, eliminar",
        cancelLabel: "Cancelar",
        tone: "danger",
      });
      if (!accepted) return;
      try {
        await api.delete(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch {
        setError(labels.errorDelete);
      }
    },
    [confirm, api, labels],
  );

  /* ---- Expand card with lazy loading ---- */
  const toggleCardExpand = useCallback(
    async (item: TItem) => {
      if (expandedCard === item.id) {
        setExpandedCard(null);
        setEditingQuestion(null);
        return;
      }
      if (!item.questions || item.questions.length === 0) {
        setLoadingDetail(item.id);
        try {
          const full = await api.getById(item.id);
          setItems((prev) => prev.map((i) => (i.id === item.id ? full : i)));
        } catch {
          setError(labels.errorLoadDetail);
          setLoadingDetail(null);
          return;
        }
        setLoadingDetail(null);
      }
      setExpandedCard(item.id);
      setEditingQuestion(null);
    },
    [expandedCard, api, labels],
  );

  /* ---- Inline question editing ---- */
  const startEditQuestion = useCallback(
    (parentId: string, q: TQuestion) => {
      setEditingQuestion({ parentId, questionId: q.id });
      const form: Record<string, any> = {};
      const qq = q as any;
      if (qq.question !== undefined) form.question = qq.question;
      if (qq.statement !== undefined) form.statement = qq.statement;
      if (qq.options !== undefined) form.options = [...qq.options];
      if (qq.correct_answer !== undefined) form.correct_answer = qq.correct_answer;
      if (qq.is_true !== undefined) form.is_true = qq.is_true;
      form.explanation = qq.explanation ?? "";
      setEditForm(form);
    },
    [],
  );

  const handleSaveQuestion = useCallback(async () => {
    if (!editingQuestion || !api.updateQuestion) return;
    setSavingQuestion(true);
    try {
      const updated = await api.updateQuestion(
        editingQuestion.parentId,
        editingQuestion.questionId,
        {
          question: editForm.question,
          statement: editForm.statement,
          options: editForm.options,
          correct_answer: editForm.correct_answer,
          is_true: editForm.is_true,
          explanation: editForm.explanation || undefined,
        },
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingQuestion.parentId
            ? {
                ...item,
                questions: item.questions?.map((q) =>
                  (q as any).id === (updated as any).id ? (updated as any) : q,
                ),
              }
            : item,
        ),
      );
      setEditingQuestion(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || labels.errorSaveQuestion);
    } finally {
      setSavingQuestion(false);
    }
  }, [editingQuestion, editForm, api, labels]);

  const handleCancelEdit = useCallback(() => {
    setEditingQuestion(null);
  }, []);

  const editingQuestionData: TQuestion | null = editingQuestion
    ? (items
        .find((item) => item.id === editingQuestion.parentId)
        ?.questions?.find((q) => q.id === editingQuestion.questionId) as TQuestion | undefined) ?? null
    : null;

  return {
    items,
    loading,
    error,
    setError,
    hasCategories,
    showCreate,
    createMode,
    setShowCreate,
    setCreateMode,
    draft,
    savingDraft,
    studyingDraft,
    handleDrafted,
    handleSaveDraft,
    handleDiscardDraft,
    handleRemoveDraftQuestion,
    handleStudyDraft,
    studyItem,
    loadingDetail,
    handleStudy,
    handleCloseStudy,
    handleCompleteStudy,
    setStudyingDraft,
    expandedCard,
    toggleCardExpand,
    editingQuestion,
    editForm,
    savingQuestion,
    editingQuestionData,
    startEditQuestion,
    handleSaveQuestion,
    handleCancelEdit,
    pendingResults: null,
    handleDelete,
  };
}
