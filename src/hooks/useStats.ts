import { useState, useEffect, useCallback } from "react";
import { statsApi, UserStats } from "../api/stats";

interface UseStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useStats(): UseStatsResult {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsApi.getStats();
      setStats(data);
    } catch {
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
