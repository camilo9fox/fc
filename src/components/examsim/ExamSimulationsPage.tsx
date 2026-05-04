import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  FilePenLine,
  Hourglass,
  ListChecks,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import NoCategoryBanner from "../layout/NoCategoryBanner";
import {
  DraftExamSimulation,
  ExamSimulation,
  ExamSimulationSubmissionResult,
  examSimulationApi,
} from "../../api/examSimulation";
import { useGenerationQueue } from "../../contexts/GenerationQueueContext";
import { AiUsageStatus, statsApi } from "../../api/stats";
import { ALLOWED_UPLOAD_FORMATS } from "../../constants";
import "./ExamSimulationsPage.css";

const MAX_TF = 20;
const MAX_QUIZ = 20;
const MAX_DEV = 10;

type SubmissionHistoryItem = {
  id: string;
  simulationId: string;
  simulationTitle: string;
  score: number;
  earnedPoints: number;
  totalPoints: number;
  submittedAt: string;
};

const formatCountdown = (totalSeconds: number) => {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getQuestionKey = (
  id: string | undefined,
  index: number,
  prefix: string,
) => {
  return id ? String(id) : `${prefix}-${index}`;
};

const ExamSimulationsPage: React.FC = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { enqueue, isModuleQueued, claimResult } = useGenerationQueue();

  const [simulations, setSimulations] = useState<ExamSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showGenerator, setShowGenerator] = useState(false);
  const [queued, setQueued] = useState(false);
  const [draft, setDraft] = useState<DraftExamSimulation | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [trueFalseCount, setTrueFalseCount] = useState(5);
  const [quizCount, setQuizCount] = useState(5);
  const [developmentCount, setDevelopmentCount] = useState(3);
  const [file, setFile] = useState<File | null>(null);
  const [supportText, setSupportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usage, setUsage] = useState<AiUsageStatus | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const [activeSimulation, setActiveSimulation] =
    useState<ExamSimulation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamSimulationSubmissionResult | null>(
    null,
  );
  const [submissionHistory, setSubmissionHistory] = useState<
    SubmissionHistoryItem[]
  >([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  const [tfAnswers, setTfAnswers] = useState<Record<string, boolean>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [devAnswers, setDevAnswers] = useState<Record<string, string>>({});

  const hasCategories = categoriesLoading || categories.length > 0;
  const actionCost = usage?.costs?.examsimulation ?? 2;

  const answeredTfCount = useMemo(
    () => Object.keys(tfAnswers).length,
    [tfAnswers],
  );
  const answeredMcCount = useMemo(
    () => Object.keys(mcAnswers).length,
    [mcAnswers],
  );
  const answeredDevCount = useMemo(
    () =>
      Object.values(devAnswers).filter(
        (answer) => String(answer).trim().length > 0,
      ).length,
    [devAnswers],
  );
  const isDraftRunner = activeSimulation?.id === "draft";
  const isExpired = timeLeftSeconds !== null && timeLeftSeconds <= 0;

  useEffect(() => {
    const pending = claimResult("examsim");
    if (pending) {
      const normalizedDraft = {
        ...(pending as DraftExamSimulation),
        trueFalseQuestions:
          (pending as DraftExamSimulation).trueFalseQuestions || [],
        multipleChoiceQuestions:
          (pending as DraftExamSimulation).multipleChoiceQuestions || [],
        developmentQuestions:
          (pending as DraftExamSimulation).developmentQuestions || [],
      };
      setDraft(normalizedDraft);
      setShowGenerator(false);
      setQueued(false);
    }
  }, [claimResult]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await examSimulationApi.getAll();
        setSimulations(response.simulations);
      } catch {
        setError("No se pudieron cargar las simulaciones de examen.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadUsage = async () => {
      setLoadingUsage(true);
      try {
        const data = await statsApi.getAiUsage();
        setUsage(data);
      } catch {
        setUsage(null);
      } finally {
        setLoadingUsage(false);
      }
    };

    loadUsage();
  }, []);

  useEffect(() => {
    if (!activeSimulation) {
      setTimeLeftSeconds(null);
      return;
    }

    setTimeLeftSeconds(Math.max(0, activeSimulation.duration_minutes * 60));
  }, [activeSimulation]);

  useEffect(() => {
    if (
      !activeSimulation ||
      result ||
      timeLeftSeconds === null ||
      timeLeftSeconds <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeSimulation, result, timeLeftSeconds]);

  const handleStartGenerator = () => {
    setError(null);
    setShowGenerator(true);
    setQueued(false);
  };

  const handleQueueGeneration = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) return setError("El titulo es obligatorio.");
    if (!categoryId) return setError("Debes seleccionar una categoria.");

    if (
      usage?.enabled &&
      Number.isFinite(usage.creditsRemaining) &&
      usage.creditsRemaining < actionCost
    ) {
      return setError(
        "No tienes creditos IA suficientes para generar esta simulacion.",
      );
    }

    const capturedTitle = title.trim();
    const capturedDescription = description.trim();
    const capturedCategoryId = categoryId;
    const capturedDuration = durationMinutes;
    const capturedTf = trueFalseCount;
    const capturedQuiz = quizCount;
    const capturedDev = developmentCount;
    const capturedFile = file;
    const capturedSupportText = supportText.trim();

    const queueResult = enqueue({
      moduleType: "examsim",
      label: `Simulacion · ${capturedTitle}`,
      startFn: async () => {
        const formData = new FormData();
        formData.append("title", capturedTitle);
        formData.append("description", capturedDescription);
        formData.append("categoryId", capturedCategoryId);
        formData.append("durationMinutes", String(capturedDuration));
        formData.append("trueFalseCount", String(capturedTf));
        formData.append("quizCount", String(capturedQuiz));
        formData.append("developmentCount", String(capturedDev));
        if (capturedSupportText) formData.append("text", capturedSupportText);
        if (capturedFile) formData.append("file", capturedFile);

        const job = await examSimulationApi.startGenerateJob(formData);
        return job.id;
      },
      pollFn: async (jobId: string) => {
        const job = await examSimulationApi.getGenerationJob(jobId);
        return {
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
        };
      },
    });

    if (!queueResult.success) {
      setError(
        queueResult.reason || "No se pudo agregar la simulacion a la cola.",
      );
      return;
    }

    setQueued(true);
    window.setTimeout(() => setShowGenerator(false), 1500);
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    setSavingDraft(true);
    setError(null);

    try {
      const saved = await examSimulationApi.create({
        title: draft.title,
        description: draft.description || undefined,
        category_id: draft.categoryId,
        duration_minutes: draft.durationMinutes,
        true_false_questions: draft.trueFalseQuestions.map(
          (question, index) => ({
            statement: question.statement,
            is_true: question.is_true,
            explanation: question.explanation || null,
            order_index: index,
          }),
        ),
        multiple_choice_questions: draft.multipleChoiceQuestions.map(
          (question, index) => ({
            question: question.question,
            options: question.options,
            correct_answer: question.correct_answer,
            explanation: question.explanation || null,
            order_index: index,
          }),
        ),
        development_questions: draft.developmentQuestions.map(
          (question, index) => ({
            prompt: question.prompt,
            reference_answer: question.reference_answer || null,
            evaluation_criteria: question.evaluation_criteria || null,
            max_points: question.max_points,
            order_index: index,
          }),
        ),
      });

      setSimulations((prev) => [saved, ...prev]);
      setDraft(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "No se pudo guardar la simulacion generada.",
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta simulacion de examen?")) return;

    try {
      await examSimulationApi.delete(id);
      setSimulations((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("No se pudo eliminar la simulacion.");
    }
  };

  const handleOpenSimulation = async (simulation: ExamSimulation) => {
    setError(null);
    setResult(null);
    setTfAnswers({});
    setMcAnswers({});
    setDevAnswers({});

    try {
      const detailed = await examSimulationApi.getById(simulation.id);
      setActiveSimulation(detailed);
    } catch {
      setError("No se pudo cargar el detalle de la simulacion.");
    }
  };

  const handleSubmitSimulation = async () => {
    if (!activeSimulation) return;
    if (isDraftRunner) {
      setError("Guarda la simulacion antes de enviarla para calificacion.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const trueFalseAnswers = Object.entries(tfAnswers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        }),
      );

      const developmentAnswers = Object.entries(devAnswers)
        .filter(([, answer]) => String(answer).trim().length > 0)
        .map(([questionId, answer]) => ({ questionId, answer }));

      const multipleChoiceAnswers = Object.entries(mcAnswers).map(
        ([questionId, answer]) => ({ questionId, answer }),
      );

      const submission = await examSimulationApi.submit(activeSimulation.id, {
        trueFalseAnswers,
        multipleChoiceAnswers,
        developmentAnswers,
      });

      setResult(submission);
      setSubmissionHistory((prev) => [
        {
          id: submission.attemptId,
          simulationId: submission.simulationId,
          simulationTitle: activeSimulation.title,
          score: submission.score,
          earnedPoints: submission.earnedPoints,
          totalPoints: submission.totalPoints,
          submittedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "No se pudo enviar la simulacion.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (activeSimulation) {
    const trueFalseQuestions = activeSimulation.trueFalseQuestions || [];
    const multipleChoiceQuestions =
      activeSimulation.multipleChoiceQuestions || [];
    const developmentQuestions = activeSimulation.developmentQuestions || [];

    return (
      <div className="es-page es-page-runner">
        <div className="es-runner-head">
          <button
            className="es-btn-ghost"
            onClick={() => {
              setActiveSimulation(null);
              setResult(null);
            }}
          >
            ← Volver a simulaciones
          </button>
          <span className="es-duration-pill">
            <Hourglass size={14} /> {activeSimulation.duration_minutes} min
          </span>
          <span className={`es-timer-pill ${isExpired ? "is-expired" : ""}`}>
            <Hourglass size={14} />
            {formatCountdown(
              timeLeftSeconds ?? activeSimulation.duration_minutes * 60,
            )}
          </span>
        </div>

        <header className="es-hero es-hero-runner">
          <h1>{activeSimulation.title}</h1>
          {activeSimulation.description && (
            <p>{activeSimulation.description}</p>
          )}
          <div className="es-runner-stats">
            <span>
              <ClipboardCheck size={14} /> V/F: {trueFalseQuestions.length}
            </span>
            <span>
              <ListChecks size={14} /> Alternativas:{" "}
              {multipleChoiceQuestions.length}
            </span>
            <span>
              <FilePenLine size={14} /> Desarrollo:{" "}
              {developmentQuestions.length}
            </span>
            <span>
              <BookCheck size={14} /> Respondidas:{" "}
              {answeredTfCount + answeredMcCount + answeredDevCount}
            </span>
          </div>
        </header>

        {result && (
          <section className="es-result-card">
            <h2>Resultado final</h2>
            <p className="es-result-score">{result.score.toFixed(2)}%</p>
            <p>
              Puntaje: {result.earnedPoints.toFixed(2)} /{" "}
              {result.totalPoints.toFixed(2)}
            </p>
          </section>
        )}

        <section className="es-section">
          <h3>Bloque Verdadero/Falso</h3>
          <div className="es-question-list">
            {trueFalseQuestions.map((question, index) => {
              const questionKey = getQuestionKey(question.id, index, "tf");
              const selected = tfAnswers[questionKey];
              const tfFeedback = result?.trueFalse.find(
                (item) => item.questionId === String(question.id),
              );
              return (
                <article key={questionKey} className="es-question-card">
                  <p className="es-question-title">
                    {index + 1}. {question.statement}
                  </p>
                  <div className="es-choice-row">
                    <button
                      type="button"
                      className={`es-choice-btn ${selected === true ? "is-active" : ""}`}
                      disabled={Boolean(result) || isExpired}
                      onClick={() =>
                        setTfAnswers((prev) => ({
                          ...prev,
                          [questionKey]: true,
                        }))
                      }
                    >
                      Verdadero
                    </button>
                    <button
                      type="button"
                      className={`es-choice-btn ${selected === false ? "is-active" : ""}`}
                      disabled={Boolean(result) || isExpired}
                      onClick={() =>
                        setTfAnswers((prev) => ({
                          ...prev,
                          [questionKey]: false,
                        }))
                      }
                    >
                      Falso
                    </button>
                  </div>
                  {tfFeedback && (
                    <p
                      className={`es-feedback ${tfFeedback.correct ? "is-ok" : "is-bad"}`}
                    >
                      {tfFeedback.correct
                        ? "Correcta"
                        : `Incorrecta. Respuesta esperada: ${tfFeedback.expected ? "Verdadero" : "Falso"}`}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="es-section">
          <h3>Bloque Alternativas</h3>
          <div className="es-question-list">
            {multipleChoiceQuestions.map((question, index) => {
              const questionKey = getQuestionKey(question.id, index, "mc");
              const selected = mcAnswers[questionKey];
              const mcFeedback = result?.multipleChoice.find(
                (item) => item.questionId === String(question.id),
              );

              return (
                <article key={questionKey} className="es-question-card">
                  <p className="es-question-title">
                    {index + 1}. {question.question}
                  </p>
                  <div className="es-choice-row is-mc">
                    {(question.options || []).map((option, optionIndex) => (
                      <button
                        key={`${questionKey}-${optionIndex}`}
                        type="button"
                        className={`es-choice-btn ${selected === option ? "is-active" : ""}`}
                        disabled={Boolean(result) || isExpired}
                        onClick={() =>
                          setMcAnswers((prev) => ({
                            ...prev,
                            [questionKey]: option,
                          }))
                        }
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </button>
                    ))}
                  </div>
                  {mcFeedback && (
                    <p
                      className={`es-feedback ${mcFeedback.correct ? "is-ok" : "is-bad"}`}
                    >
                      {mcFeedback.correct
                        ? "Correcta"
                        : `Incorrecta. Respuesta esperada: ${mcFeedback.expected}`}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="es-section">
          <h3>Bloque Desarrollo</h3>
          <div className="es-question-list">
            {developmentQuestions.map((question, index) => {
              const questionKey = getQuestionKey(question.id, index, "dev");
              const devFeedback = result?.development.find(
                (item) => item.questionId === String(question.id),
              );

              return (
                <article key={questionKey} className="es-question-card">
                  <p className="es-question-title">
                    {index + 1}. {question.prompt}
                  </p>
                  {question.max_points && (
                    <span className="es-points-tag">
                      {question.max_points} pts
                    </span>
                  )}
                  <textarea
                    className="es-answer-textarea"
                    value={devAnswers[questionKey] || ""}
                    onChange={(event) =>
                      setDevAnswers((prev) => ({
                        ...prev,
                        [questionKey]: event.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="Escribe tu respuesta de desarrollo aqui..."
                    disabled={Boolean(result) || isExpired}
                  />
                  {devFeedback && (
                    <p className="es-feedback is-neutral">
                      Puntaje: {devFeedback.points.toFixed(2)} /{" "}
                      {devFeedback.maxPoints.toFixed(2)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {isExpired && !result && (
          <p className="es-warning">
            Tiempo agotado. Ya no puedes editar respuestas, solo enviar.
          </p>
        )}

        {error && <p className="es-error">{error}</p>}

        <div className="es-actions-sticky">
          <button
            className="es-btn-primary"
            onClick={handleSubmitSimulation}
            disabled={submitting || Boolean(result) || isDraftRunner}
          >
            {submitting
              ? "Enviando..."
              : isDraftRunner
                ? "Guarda para enviar"
                : result
                  ? "Simulacion enviada"
                  : "Enviar simulacion"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="es-page">
      <header className="es-hero">
        <div className="es-hero-icon">
          <BrainCircuit size={20} />
        </div>
        <div>
          <h1>Simulacion de Examen</h1>
          <p>
            Arma una prueba usando V/F y alternativas ya creadas en la
            categoria, y genera solo desarrollo con IA.
          </p>
        </div>
        <button
          className="es-btn-primary"
          onClick={handleStartGenerator}
          disabled={!hasCategories}
        >
          <Sparkles size={15} /> Nueva simulacion IA
        </button>
      </header>

      {!hasCategories && <NoCategoryBanner feature="simulaciones de examen" />}
      {error && <p className="es-error">{error}</p>}

      {submissionHistory.length > 0 && (
        <section className="es-history">
          <div className="es-history-head">
            <h2>Historial reciente</h2>
            <span>{submissionHistory.length} intento(s)</span>
          </div>
          <div className="es-history-list">
            {submissionHistory.slice(0, 6).map((entry) => (
              <article key={entry.id} className="es-history-item">
                <div>
                  <h4>{entry.simulationTitle}</h4>
                  <p>{new Date(entry.submittedAt).toLocaleString()}</p>
                </div>
                <div className="es-history-score">
                  <strong>{entry.score.toFixed(2)}%</strong>
                  <span>
                    {entry.earnedPoints.toFixed(2)} /{" "}
                    {entry.totalPoints.toFixed(2)} pts
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {showGenerator && (
        <form className="es-generator" onSubmit={handleQueueGeneration}>
          <div className="es-generator-head">
            <h2>Generar simulacion desde tu categoria</h2>
            <button
              type="button"
              className="es-close-btn"
              onClick={() => setShowGenerator(false)}
            >
              <X size={15} />
            </button>
          </div>

          <p className="es-generator-note">
            Tomaremos preguntas existentes de V/F y Cuestionarios de la
            categoria seleccionada. La IA solo crea las preguntas de desarrollo.
            Si subes un PDF/TXT, se usara para enriquecer ese bloque.
          </p>

          <div className="es-usage-box" aria-live="polite">
            {loadingUsage ? (
              <span>Cargando creditos IA...</span>
            ) : usage?.enabled ? (
              <>
                <strong>
                  Creditos IA: {usage.creditsRemaining}/{usage.creditsLimit}
                </strong>
                <span>
                  Costo por simulacion: {actionCost} credito
                  {actionCost === 1 ? "" : "s"}.
                </span>
              </>
            ) : (
              <span>Creditos IA no disponibles por ahora.</span>
            )}
          </div>

          <div className="es-generator-grid">
            <label>
              Titulo
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label>
              Categoria
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">Selecciona una categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Duracion (minutos)
              <input
                type="number"
                min={10}
                max={300}
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(
                    Math.min(
                      300,
                      Math.max(10, parseInt(event.target.value) || 45),
                    ),
                  )
                }
              />
            </label>

            <label>
              Preguntas V/F ({1}-{MAX_TF})
              <input
                type="number"
                min={1}
                max={MAX_TF}
                value={trueFalseCount}
                onChange={(event) =>
                  setTrueFalseCount(
                    Math.min(
                      MAX_TF,
                      Math.max(1, parseInt(event.target.value) || 6),
                    ),
                  )
                }
              />
            </label>

            <label>
              Preguntas alternativas ({1}-{MAX_QUIZ})
              <input
                type="number"
                min={1}
                max={MAX_QUIZ}
                value={quizCount}
                onChange={(event) =>
                  setQuizCount(
                    Math.min(
                      MAX_QUIZ,
                      Math.max(1, parseInt(event.target.value) || 5),
                    ),
                  )
                }
              />
            </label>

            <label>
              Preguntas desarrollo ({1}-{MAX_DEV})
              <input
                type="number"
                min={1}
                max={MAX_DEV}
                value={developmentCount}
                onChange={(event) =>
                  setDevelopmentCount(
                    Math.min(
                      MAX_DEV,
                      Math.max(1, parseInt(event.target.value) || 3),
                    ),
                  )
                }
              />
            </label>
          </div>

          <label className="es-full-row">
            Descripcion (opcional)
            <textarea
              value={description}
              rows={2}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="es-full-row">
            Texto de apoyo para desarrollo (opcional)
            <textarea
              value={supportText}
              rows={3}
              onChange={(event) => setSupportText(event.target.value)}
              placeholder="Ejemplo: enfoques clave, bibliografia breve, temas prioritarios..."
            />
          </label>

          <div className="es-file-row">
            <button
              type="button"
              className="es-btn-ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? file.name : "Adjuntar PDF/TXT opcional"}
            </button>
            {file && (
              <button
                type="button"
                className="es-btn-text"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Quitar
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_UPLOAD_FORMATS}
              style={{ display: "none" }}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          {queued && (
            <p className="es-queued-msg">
              Simulacion en cola. Te avisaremos al finalizar.
            </p>
          )}

          <div className="es-generator-actions">
            <button
              type="button"
              className="es-btn-ghost"
              onClick={() => setShowGenerator(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="es-btn-primary"
              disabled={queued || isModuleQueued("examsim")}
            >
              {queued || isModuleQueued("examsim")
                ? "En cola..."
                : "Generar simulacion"}
            </button>
          </div>
        </form>
      )}

      {draft && (
        <section className="es-draft-panel">
          <div className="es-draft-head">
            <div>
              <p className="es-draft-kicker">Borrador generado</p>
              <h2>{draft.title}</h2>
              <span>
                V/F: {draft.trueFalseQuestions.length} · Alternativas:{" "}
                {draft.multipleChoiceQuestions.length} · Desarrollo:{" "}
                {draft.developmentQuestions.length}
              </span>
            </div>
            <div className="es-draft-actions">
              <button className="es-btn-ghost" onClick={() => setDraft(null)}>
                Descartar
              </button>
              <button
                className="es-btn-ghost"
                onClick={() => {
                  setActiveSimulation({
                    id: "draft",
                    user_id: "",
                    category_id: draft.categoryId,
                    title: draft.title,
                    description: draft.description || null,
                    duration_minutes: draft.durationMinutes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    trueFalseQuestions: draft.trueFalseQuestions,
                    multipleChoiceQuestions: draft.multipleChoiceQuestions,
                    developmentQuestions: draft.developmentQuestions,
                  });
                  setResult(null);
                  setTfAnswers({});
                  setMcAnswers({});
                  setDevAnswers({});
                }}
              >
                Resolver borrador
              </button>
              <button
                className="es-btn-primary"
                onClick={handleSaveDraft}
                disabled={savingDraft}
              >
                {savingDraft ? "Guardando..." : "Guardar simulacion"}
              </button>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div className="es-loading">Cargando simulaciones...</div>
      ) : simulations.length === 0 ? (
        <div className="es-empty">
          <CheckCircle2 size={30} />
          <h3>No hay simulaciones guardadas</h3>
          <p>Genera tu primera simulacion y practica como en un examen real.</p>
        </div>
      ) : (
        <section className="es-grid">
          {simulations.map((simulation) => (
            <article key={simulation.id} className="es-card">
              <div className="es-card-head">
                <span className="es-category-pill">
                  {simulation.category?.title || "Sin categoria"}
                </span>
                <button
                  className="es-delete-btn"
                  onClick={() => handleDelete(simulation.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3>{simulation.title}</h3>
              <p>{simulation.description || "Simulacion sin descripcion."}</p>

              <div className="es-card-metrics">
                <span>
                  V/F:{" "}
                  {simulation.trueFalseCount ??
                    simulation.trueFalseQuestions?.length ??
                    0}
                </span>
                <span>
                  Alternativas:{" "}
                  {simulation.multipleChoiceCount ??
                    simulation.multipleChoiceQuestions?.length ??
                    0}
                </span>
                <span>
                  Desarrollo:{" "}
                  {simulation.developmentCount ??
                    simulation.developmentQuestions?.length ??
                    0}
                </span>
                <span>{simulation.duration_minutes} min</span>
              </div>

              <button
                className="es-btn-primary es-btn-block"
                onClick={() => handleOpenSimulation(simulation)}
              >
                Resolver simulacion
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default ExamSimulationsPage;
