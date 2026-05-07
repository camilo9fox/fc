import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { examSimulationApi } from "../api/examSimulation";
import { statsApi, UserStats } from "../api/stats";
import { useAuth } from "../contexts/AuthContext";

const INTRO_SEEN_PREFIX = "Flashy:intro-seen";

const getIntroSeenKey = (userId: string) => `${INTRO_SEEN_PREFIX}:${userId}`;

export const markIntroSeenForUser = (userId?: string | null) => {
  if (!userId) return;
  localStorage.setItem(getIntroSeenKey(userId), "1");
};

const hasIntroBeenSeenForUser = (userId?: string | null) => {
  if (!userId) return false;
  return localStorage.getItem(getIntroSeenKey(userId)) === "1";
};

const hasCreatedContent = (stats: UserStats, examCount: number) => {
  const totals = stats?.totals;
  if (!totals) return examCount > 0;

  return (
    totals.categories > 0 ||
    totals.flashcards > 0 ||
    totals.quizzes > 0 ||
    totals.trueFalseSets > 0 ||
    totals.studyGuides > 0 ||
    examCount > 0
  );
};

export const useOnboardingIntroGate = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [introSeen, setIntroSeen] = useState(false);
  const [createdAnyContent, setCreatedAnyContent] = useState(true);

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!user?.id) {
        if (!active) return;
        setIntroSeen(false);
        setCreatedAnyContent(true);
        setIsChecking(false);
        return;
      }

      const localSeen = hasIntroBeenSeenForUser(user.id);
      let seen = localSeen;

      try {
        const onboardingRes = await authApi.getOnboardingProfile();
        const backendSeen = Boolean(onboardingRes.profile?.introSeen);
        seen = localSeen || backendSeen;

        // Keep backend in sync when local fallback already marked intro as seen.
        if (localSeen && !backendSeen) {
          authApi
            .updateOnboardingProfile({ introSeen: true })
            .catch(() => undefined);
        }
      } catch {
        seen = localSeen;
      }

      if (!active) return;
      setIntroSeen(seen);

      if (seen) {
        setCreatedAnyContent(true);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      try {
        const [stats, examRes] = await Promise.all([
          statsApi.getStats(),
          examSimulationApi.getAll({ limit: 1, offset: 0 }),
        ]);

        if (!active) return;
        const examCount = examRes?.simulations?.length ?? 0;
        setCreatedAnyContent(hasCreatedContent(stats, examCount));
      } catch {
        if (!active) return;
        // Si falla la verificación, no forzamos redirección para evitar bloqueo.
        setCreatedAnyContent(true);
      } finally {
        if (active) setIsChecking(false);
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const markIntroSeen = useCallback(() => {
    if (!user?.id) return;
    markIntroSeenForUser(user.id);
    authApi.updateOnboardingProfile({ introSeen: true }).catch(() => undefined);
    setIntroSeen(true);
  }, [user?.id]);

  const shouldShowIntro = useMemo(() => {
    return Boolean(user?.id && !introSeen && !createdAnyContent);
  }, [createdAnyContent, introSeen, user?.id]);

  return {
    isChecking,
    shouldShowIntro,
    markIntroSeen,
  };
};
