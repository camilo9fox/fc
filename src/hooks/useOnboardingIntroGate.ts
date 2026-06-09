import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
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

export const useOnboardingIntroGate = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [introSeen, setIntroSeen] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!user?.id) {
        if (active) {
          setIntroSeen(false);
          setIsChecking(false);
        }
        return;
      }

      const localSeen = hasIntroBeenSeenForUser(user.id);
      let seen = localSeen;

      try {
        const onboardingRes = await authApi.getOnboardingProfile();
        const backendSeen = Boolean(onboardingRes.profile?.introSeen);
        seen = localSeen || backendSeen;

        if (localSeen && !backendSeen) {
          authApi
            .updateOnboardingProfile({ introSeen: true })
            .catch(() => undefined);
        }
      } catch {
        seen = localSeen;
      }

      if (active) {
        setIntroSeen(seen);
        setIsChecking(false);
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
    return Boolean(user?.id && !introSeen);
  }, [introSeen, user?.id]);

  return {
    isChecking,
    shouldShowIntro,
    markIntroSeen,
  };
};
