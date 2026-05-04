import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useGenerationQueue,
  QueueJob,
} from "../../contexts/GenerationQueueContext";
import "./GenerationQueueWidget.css";

const TOAST_AUTO_CLOSE_MS = 8000;

const MODULE_ICONS: Record<string, string> = {
  flashcards: "🃏",
  quiz: "📝",
  truefalse: "✔️",
  studyguide: "📖",
  examsim: "🎯",
};

const MODULE_LINKS: Record<string, string> = {
  flashcards: "/flashcards",
  quiz: "/quizzes",
  truefalse: "/truefalse",
  studyguide: "/study-guides",
  examsim: "/exam-simulations",
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="gq-progress-bar">
      <div
        className="gq-progress-fill"
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

function JobRow({
  job,
  onCompletedClick,
  onDismissFailed,
}: {
  job: QueueJob;
  onCompletedClick: (job: QueueJob) => void;
  onDismissFailed: (job: QueueJob) => void;
}) {
  const icon = MODULE_ICONS[job.moduleType] ?? "⚙️";
  const isClickable = job.status === "completed";
  return (
    <div
      className={`gq-job-row gq-job-${job.status} ${isClickable ? "gq-job-clickable" : ""}`}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      onClick={isClickable ? () => onCompletedClick(job) : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCompletedClick(job);
              }
            }
          : undefined
      }
      aria-label={isClickable ? `Abrir ${job.label}` : undefined}
    >
      <span className="gq-job-icon">{icon}</span>
      <div className="gq-job-info">
        <span className="gq-job-label">{job.label}</span>
        <span className="gq-job-stage">
          {job.status === "pending" && "En cola..."}
          {job.status === "running" && job.progress.stage}
          {job.status === "completed" && "Completado"}
          {job.status === "failed" && (job.error || "Error")}
        </span>
        {job.status === "running" && (
          <ProgressBar percent={job.progress.percent} />
        )}
      </div>
      <span className="gq-job-status-icon">
        {job.status === "pending" && (
          <Loader2 size={14} className="gq-spin gq-dim" />
        )}
        {job.status === "running" && (
          <Loader2 size={14} className="gq-spin gq-accent" />
        )}
        {job.status === "completed" && (
          <CheckCircle size={14} className="gq-ok" />
        )}
        {job.status === "failed" && (
          <AlertCircle size={14} className="gq-err" />
        )}
      </span>
      {job.status === "failed" && (
        <button
          type="button"
          className="gq-job-remove"
          title="Quitar error de la cola"
          aria-label="Quitar error de la cola"
          onClick={(e) => {
            e.stopPropagation();
            onDismissFailed(job);
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export const GenerationQueueWidget: React.FC = () => {
  const { jobs, toasts, dismissToast, dismissJob } = useGenerationQueue();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleCompletedJobClick = React.useCallback(
    (job: QueueJob) => {
      const link = MODULE_LINKS[job.moduleType] ?? "/";
      navigate(link);
    },
    [navigate],
  );

  const handleDismissFailedJob = React.useCallback(
    (job: QueueJob) => {
      dismissJob(job.localId);
    },
    [dismissJob],
  );

  // Active jobs (not yet claimed completed ones may linger briefly)
  const activeJobs = jobs.filter(
    (j) => j.status === "pending" || j.status === "running",
  );
  const recentJobs = jobs.filter(
    (j) => j.status === "completed" || j.status === "failed",
  );
  const visibleJobs = open ? jobs : activeJobs;

  // Auto-dismiss toasts after timeout
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      dismissToast(toasts[0].id);
    }, TOAST_AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  const hasActivity = jobs.length > 0 || toasts.length > 0;
  if (!hasActivity) return null;

  return (
    <div className="gq-root">
      {/* Toast notifications */}
      <div className="gq-toasts">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`gq-toast gq-toast-${toast.type}`}
            onClick={() => {
              dismissToast(toast.id);
              navigate(toast.link);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                dismissToast(toast.id);
                navigate(toast.link);
              }
            }}
          >
            <span className="gq-toast-msg">{toast.message}</span>
            <button
              className="gq-toast-close"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              aria-label="Cerrar"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Queue panel */}
      {jobs.length > 0 && (
        <div className="gq-panel">
          <button
            className="gq-panel-header"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="gq-panel-title">
              {activeJobs.length > 0 ? (
                <>
                  <Loader2 size={13} className="gq-spin gq-accent" />
                  {activeJobs.length} generando…
                </>
              ) : (
                <>
                  <CheckCircle size={13} className="gq-ok" />
                  Cola de generación
                </>
              )}
            </span>
            {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {open && (
            <div className="gq-panel-body">
              {visibleJobs.map((job) => (
                <JobRow
                  key={job.localId}
                  job={job}
                  onCompletedClick={handleCompletedJobClick}
                  onDismissFailed={handleDismissFailedJob}
                />
              ))}
              {!open && recentJobs.length > 0 && (
                <p className="gq-panel-hint">
                  {recentJobs.length} completado(s)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
