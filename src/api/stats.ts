import apiClient from "./client";
import { isAxiosError } from "axios";

export interface StatTotals {
  categories: number;
  flashcards: number;
  quizzes: number;
  trueFalseSets: number;
  studyGuides: number;
}

export interface CategoryBreakdownItem {
  id: string;
  title: string;
  flashcards: number;
  quizzes: number;
  trueFalseSets: number;
  studyGuides: number;
  total: number;
  avgScore: number | null;
}

export interface RecentAttempt {
  type: "quiz" | "true_false";
  score: number;
  total: number;
  completedAt: string;
  categoryTitle: string | null;
}

export interface AttemptStats {
  totalAttempts: number;
  totalFlashcardSessions: number;
  avgScore: number;
  currentStreak: number;
  recentAttempts: RecentAttempt[];
  avgScoreByCategory: Record<string, number>;
}

export interface UserStats {
  totals: StatTotals;
  categoryBreakdown: CategoryBreakdownItem[];
  mostActive: { id: string; title: string } | null;
  attemptStats: AttemptStats;
}

export interface AiUsageCosts {
  flashcards: number;
  quizzes: number;
  truefalse: number;
  studyguides?: number;
}

export interface AiUsageStatus {
  enabled: boolean;
  userId?: string;
  periodStart: string;
  periodEnd: string;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  burstUsed: number;
  burstLimit: number;
  burstWindowSeconds: number;
  burstWindowResetAt: string;
  lastRequestAt?: string | null;
  updatedAt?: string | null;
  costs: AiUsageCosts;
}

export interface AiQuotaErrorDetails {
  reason: "daily_limit" | "burst_limit" | string;
  retryAfterSeconds?: number;
  burstWindowResetAt?: string;
  creditsRemaining?: number;
  dailyLimit?: number;
  creditsUsed?: number;
  burstLimit?: number;
  burstUsed?: number;
  periodEnd?: string;
}

const QUOTA_ERROR_CODES = new Set([
  "daily_limit",
  "burst_limit",
  "quota_exceeded",
]);

export const parseAiQuotaError = (
  error: unknown,
): AiQuotaErrorDetails | null => {
  if (!isAxiosError(error)) return null;

  const status = error.response?.status;
  const data = error.response?.data as
    | {
        code?: string;
        details?: AiQuotaErrorDetails;
      }
    | undefined;

  const reason = data?.code || data?.details?.reason;
  const isQuota =
    (status === 429 && !!reason && QUOTA_ERROR_CODES.has(reason)) ||
    reason === "daily_limit" ||
    reason === "burst_limit";

  if (!isQuota) return null;

  const retryHeader = Number(error.response?.headers?.["retry-after"]);

  return {
    reason: (reason || data?.details?.reason || "quota_exceeded") as string,
    retryAfterSeconds: Number.isFinite(retryHeader)
      ? retryHeader
      : data?.details?.retryAfterSeconds,
    burstWindowResetAt: data?.details?.burstWindowResetAt,
    creditsRemaining: data?.details?.creditsRemaining,
    dailyLimit: data?.details?.dailyLimit,
    creditsUsed: data?.details?.creditsUsed,
    burstLimit: data?.details?.burstLimit,
    burstUsed: data?.details?.burstUsed,
    periodEnd: data?.details?.periodEnd,
  };
};

export const formatSeconds = (seconds?: number): string => {
  const value = Math.max(0, Math.floor(seconds || 0));
  if (!value) return "0s";

  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const formatAiQuotaMessage = (details: AiQuotaErrorDetails): string => {
  if (details.reason === "daily_limit") {
    const remaining = Math.max(0, Number(details.creditsRemaining || 0));
    return `Te quedaste sin créditos IA por hoy. Créditos restantes: ${remaining}.`;
  }

  if (details.reason === "burst_limit") {
    return `Has alcanzado el límite temporal. Intenta de nuevo en ${formatSeconds(details.retryAfterSeconds)}.`;
  }

  return "Límite de uso IA alcanzado. Intenta de nuevo más tarde.";
};

export const statsApi = {
  getStats: (): Promise<UserStats> =>
    apiClient.get("/stats").then((r) => r.data),
  getAiUsage: (): Promise<AiUsageStatus> =>
    apiClient.get("/stats/ai-usage").then((r) => r.data),
};
