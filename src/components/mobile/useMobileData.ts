import { useEffect, useState } from "react";
import { flashCardsApi } from "../../api/flashcards";
import { quizApi } from "../../api/quiz";
import { trueFalseApi } from "../../api/trueFalse";
import { studyGuideApi } from "../../api/studyGuides";
import { examSimulationApi } from "../../api/examSimulation";
import { libraryApi, PublicCategory } from "../../api/library";

export type MobileResourceSummary = {
  flashcards: number;
  quizzes: number;
  trueFalse: number;
  guides: number;
  exams: number;
};

export type MobileHomeStats = MobileResourceSummary & {
  due: number;
};

const EMPTY_SUMMARY: MobileResourceSummary = {
  flashcards: 0,
  quizzes: 0,
  trueFalse: 0,
  guides: 0,
  exams: 0,
};

const countOwnResources = async (
  limit = 200,
): Promise<MobileResourceSummary> => {
  const [flashcards, quizzes, trueFalse, guides, exams] = await Promise.all([
    flashCardsApi.getFlashCards({ limit }).catch(() => ({ flashcards: [] })),
    quizApi.getAll({ limit }).catch(() => ({ quizzes: [] })),
    trueFalseApi.getAll({ limit }).catch(() => ({ sets: [] })),
    studyGuideApi.getAll({ limit }).catch(() => ({ guides: [] })),
    examSimulationApi.getAll({ limit }).catch(() => ({ simulations: [] })),
  ]);

  return {
    flashcards: flashcards.flashcards?.length ?? 0,
    quizzes: quizzes.quizzes?.length ?? 0,
    trueFalse: trueFalse.sets?.length ?? 0,
    guides: guides.guides?.length ?? 0,
    exams: exams.simulations?.length ?? 0,
  };
};

export const useMobileHomeStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MobileHomeStats>({
    due: 0,
    ...EMPTY_SUMMARY,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [review, summary] = await Promise.all([
          flashCardsApi.getReviewStats().catch(() => ({ due: 0 })),
          countOwnResources(),
        ]);

        if (!mounted) return;
        setStats({
          due: review.due ?? 0,
          ...summary,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { loading, stats };
};

export const useMobilePrivateLibrarySummary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MobileResourceSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const next = await countOwnResources();
        if (!mounted) return;
        setSummary(next);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { loading, summary };
};

export const useMobilePublicLibrary = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await libraryApi.getCategories({ limit: 8, offset: 0 });
        if (!mounted) return;
        setCategories(data.categories || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { loading, categories };
};
