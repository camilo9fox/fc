import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModuleType = "flashcards" | "quiz" | "truefalse" | "studyguide";

export interface QueueJob {
  localId: string;
  moduleType: ModuleType;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  backendJobId: string | null;
  progress: { stage: string; percent: number };
  error: string | null;
}

export interface QueueToast {
  id: string;
  type: "success" | "error";
  moduleType: ModuleType;
  message: string;
  link: string;
}

interface PendingResult {
  moduleType: ModuleType;
  result: any;
}

interface EnqueueParams {
  moduleType: ModuleType;
  label: string;
  /** Must return the backend job id */
  startFn: () => Promise<string>;
  /** Must return normalized job status */
  pollFn: (jobId: string) => Promise<{
    status: "queued" | "processing" | "completed" | "failed";
    progress: { stage: string; percent: number };
    result: any;
    error: string | null;
  }>;
}

interface GenerationQueueContextValue {
  enqueue: (params: EnqueueParams) => { success: boolean; reason?: string };
  claimResult: (moduleType: ModuleType) => any | null;
  isModuleQueued: (moduleType: ModuleType) => boolean;
  jobs: QueueJob[];
  toasts: QueueToast[];
  dismissToast: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GenerationQueueContext =
  createContext<GenerationQueueContextValue | null>(null);

export function useGenerationQueue(): GenerationQueueContextValue {
  const ctx = useContext(GenerationQueueContext);
  if (!ctx)
    throw new Error(
      "useGenerationQueue must be used inside GenerationQueueProvider",
    );
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<ModuleType, string> = {
  flashcards: "Flashcards",
  quiz: "Cuestionario",
  truefalse: "Verdadero/Falso",
  studyguide: "Guía de estudio",
};

const MODULE_LINKS: Record<ModuleType, string> = {
  flashcards: "/flashcards",
  quiz: "/quizzes",
  truefalse: "/truefalse",
  studyguide: "/study-guides",
};

const POLL_INTERVAL_MS = 2500;

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export const GenerationQueueProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [toasts, setToasts] = useState<QueueToast[]>([]);
  const [pendingResults, setPendingResults] = useState<
    Partial<Record<ModuleType, any>>
  >({});

  // Stable references so the polling loop can always read the latest state
  const jobsRef = useRef<QueueJob[]>([]);
  const startFnsRef = useRef<Map<string, () => Promise<string>>>(new Map());
  const pollFnsRef = useRef<
    Map<
      string,
      (jobId: string) => Promise<{
        status: "queued" | "processing" | "completed" | "failed";
        progress: { stage: string; percent: number };
        result: any;
        error: string | null;
      }>
    >
  >(new Map());
  const processingRef = useRef(false);

  // Keep jobsRef in sync
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const updateJob = useCallback((localId: string, patch: Partial<QueueJob>) => {
    setJobs((prev) =>
      prev.map((j) => (j.localId === localId ? { ...j, ...patch } : j)),
    );
  }, []);

  const addToast = useCallback((toast: Omit<QueueToast, "id">) => {
    const id = randomId();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Core processing loop ──────────────────────────────────────────────────

  const processNext = useCallback(async () => {
    if (processingRef.current) return;

    const pending = jobsRef.current.find((j) => j.status === "pending");
    if (!pending) return;

    processingRef.current = true;

    try {
      // Mark as running
      updateJob(pending.localId, { status: "running" });

      // Start the backend job
      let backendJobId: string;
      try {
        const startFn = startFnsRef.current.get(pending.localId);
        if (!startFn) throw new Error("startFn not found");
        backendJobId = await startFn();
        updateJob(pending.localId, { backendJobId });
      } catch (startErr: any) {
        updateJob(pending.localId, {
          status: "failed",
          error: startErr?.message || "Error al iniciar la generación.",
        });
        addToast({
          type: "error",
          moduleType: pending.moduleType,
          message: `Error al iniciar: ${pending.label}`,
          link: MODULE_LINKS[pending.moduleType],
        });
        processingRef.current = false;
        processNext();
        return;
      }

      // Poll until done
      const pollFn = pollFnsRef.current.get(pending.localId);
      if (!pollFn) throw new Error("pollFn not found");

      while (true) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        let polled: {
          status: "queued" | "processing" | "completed" | "failed";
          progress: { stage: string; percent: number };
          result: any;
          error: string | null;
        };

        try {
          polled = await pollFn(backendJobId);
        } catch {
          // Transient network error — keep polling
          continue;
        }

        updateJob(pending.localId, { progress: polled.progress });

        if (polled.status === "completed") {
          updateJob(pending.localId, { status: "completed" });
          // Store result for the target page to claim
          setPendingResults((prev) => ({
            ...prev,
            [pending.moduleType]: polled.result,
          }));
          addToast({
            type: "success",
            moduleType: pending.moduleType,
            message: `✅ ${pending.label} lista — toca para ver`,
            link: MODULE_LINKS[pending.moduleType],
          });
          break;
        }

        if (polled.status === "failed") {
          updateJob(pending.localId, {
            status: "failed",
            error: polled.error || "Error desconocido.",
          });
          addToast({
            type: "error",
            moduleType: pending.moduleType,
            message: `❌ ${pending.label} falló`,
            link: MODULE_LINKS[pending.moduleType],
          });
          break;
        }
      }
    } finally {
      // Clean up refs
      startFnsRef.current.delete(pending.localId);
      pollFnsRef.current.delete(pending.localId);
      processingRef.current = false;
      // Try to start the next job
      processNext();
    }
  }, [addToast, updateJob]);

  // Trigger processing whenever jobs change
  useEffect(() => {
    const hasPending = jobs.some((j) => j.status === "pending");
    const hasRunning = jobs.some((j) => j.status === "running");
    if (hasPending && !hasRunning && !processingRef.current) {
      processNext();
    }
  }, [jobs, processNext]);

  // ── Public API ────────────────────────────────────────────────────────────

  const isModuleQueued = useCallback(
    (moduleType: ModuleType) =>
      jobs.some(
        (j) =>
          j.moduleType === moduleType &&
          (j.status === "pending" || j.status === "running"),
      ),
    [jobs],
  );

  const enqueue = useCallback(
    ({ moduleType, label, startFn, pollFn }: EnqueueParams) => {
      if (isModuleQueued(moduleType)) {
        return {
          success: false,
          reason: `Ya hay una generación de ${MODULE_LABELS[moduleType]} en cola. Espera a que termine.`,
        };
      }

      const localId = randomId();
      const job: QueueJob = {
        localId,
        moduleType,
        label,
        status: "pending",
        backendJobId: null,
        progress: { stage: "En cola...", percent: 0 },
        error: null,
      };

      startFnsRef.current.set(localId, startFn);
      pollFnsRef.current.set(localId, pollFn);
      setJobs((prev) => [...prev, job]);

      return { success: true };
    },
    [isModuleQueued],
  );

  const claimResult = useCallback(
    (moduleType: ModuleType) => {
      const result = pendingResults[moduleType] ?? null;
      if (result !== null) {
        setPendingResults((prev) => {
          const next = { ...prev };
          delete next[moduleType];
          return next;
        });
        // Remove completed job from list to keep the queue clean
        setJobs((prev) =>
          prev.filter(
            (j) => !(j.moduleType === moduleType && j.status === "completed"),
          ),
        );
      }
      return result;
    },
    [pendingResults],
  );

  return (
    <GenerationQueueContext.Provider
      value={{
        enqueue,
        claimResult,
        isModuleQueued,
        jobs,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </GenerationQueueContext.Provider>
  );
};
