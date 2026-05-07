import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  CalendarDays,
  Check,
  CheckSquare,
  Clock,
  Clock3,
  Coins,
  Eye,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  Leaf,
  Library,
  Moon,
  RefreshCw,
  Rocket,
  School,
  Shuffle,
  Sparkles,
  Sun,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authApi, OnboardingProfile } from "../../api";
import { markIntroSeenForUser } from "../../hooks/useOnboardingIntroGate";
import "./IntroModulePage.css";

type IntroModuleInfo = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
};

type GoalOption = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

type TimeOption = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

type FormatOption = {
  id: "flashcards" | "quizzes" | "mixed";
  label: string;
  description: string;
  icon: React.ReactNode;
};

type StudyLevelOption = {
  id: "school" | "university" | "professional";
  label: string;
  description: string;
  icon: React.ReactNode;
};

type WeeklyDaysOption = {
  id: 3 | 5 | 7;
  label: string;
  description: string;
  icon: React.ReactNode;
};

type SessionOption = {
  id: "morning" | "afternoon" | "night" | "flexible";
  label: string;
  description: string;
  icon: React.ReactNode;
};

type ChallengeOption = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const modules: IntroModuleInfo[] = [
  {
    title: "Temas de estudio",
    description: "Crea y organiza tu biblioteca por materias o unidades.",
    path: "/categories",
    icon: <BookMarked size={18} />,
  },
  {
    title: "Flashcards",
    description: "Tarjetas rápidas para memorizar conceptos clave.",
    path: "/flashcards",
    icon: <Layers size={18} />,
  },
  {
    title: "Cuestionarios",
    description: "Preguntas de opción múltiple para evaluar comprensión.",
    path: "/quizzes",
    icon: <FileText size={18} />,
  },
  {
    title: "Verdadero/Falso",
    description: "Práctica breve para reforzar ideas fundamentales.",
    path: "/truefalse",
    icon: <CheckSquare size={18} />,
  },
  {
    title: "Guías de estudio",
    description: "Resúmenes estructurados y explicativos con IA.",
    path: "/study-guides",
    icon: <Library size={18} />,
  },
  {
    title: "Simulación de examen",
    description: "Entrena en un formato mixto similar a evaluación real.",
    path: "/exam-simulations",
    icon: <Target size={18} />,
  },
];

const goalOptions: GoalOption[] = [
  {
    id: "exams",
    label: "Preparar exámenes",
    description: "Repasar con simulaciones y práctica guiada.",
    icon: <Target size={20} />,
  },
  {
    id: "memorize",
    label: "Memorizar conceptos",
    description: "Usar repaso espaciado para retención a largo plazo.",
    icon: <Brain size={20} />,
  },
  {
    id: "fast-practice",
    label: "Practicar rápido",
    description: "Sesiones cortas diarias para avanzar constante.",
    icon: <Zap size={20} />,
  },
  {
    id: "deep-understanding",
    label: "Comprender en profundidad",
    description: "Estudiar con guías y autoevaluaciones por tema.",
    icon: <BookOpen size={20} />,
  },
];

const timeOptions: TimeOption[] = [
  {
    id: "10-15",
    label: "10–15 min",
    description: "Micro sesiones todos los días.",
    icon: <Zap size={20} />,
  },
  {
    id: "20-30",
    label: "20–30 min",
    description: "Balance ideal entre práctica y teoría.",
    icon: <Timer size={20} />,
  },
  {
    id: "45+",
    label: "45+ min",
    description: "Bloques profundos para temas complejos.",
    icon: <Flame size={20} />,
  },
];

const formatOptions: FormatOption[] = [
  {
    id: "flashcards",
    label: "Flashcards primero",
    description: "Ideal para memoria y repaso continuo.",
    icon: <Layers size={20} />,
  },
  {
    id: "quizzes",
    label: "Cuestionarios primero",
    description: "Perfecto para practicar estilo examen.",
    icon: <FileText size={20} />,
  },
  {
    id: "mixed",
    label: "Mixto",
    description: "Combinación de tarjetas, quizzes y guías.",
    icon: <Shuffle size={20} />,
  },
];

const studyLevelOptions: StudyLevelOption[] = [
  {
    id: "school",
    label: "Escolar",
    description: "Secundaria o bachillerato.",
    icon: <School size={20} />,
  },
  {
    id: "university",
    label: "Universidad",
    description: "Cursos con mayor volumen y profundidad.",
    icon: <GraduationCap size={20} />,
  },
  {
    id: "professional",
    label: "Profesional",
    description: "Certificaciones o actualización laboral.",
    icon: <Briefcase size={20} />,
  },
];

const weeklyDaysOptions: WeeklyDaysOption[] = [
  {
    id: 3,
    label: "3 días",
    description: "Ritmo ligero y sostenible.",
    icon: <Leaf size={20} />,
  },
  {
    id: 5,
    label: "5 días",
    description: "Progreso constante semanal.",
    icon: <TrendingUp size={20} />,
  },
  {
    id: 7,
    label: "7 días",
    description: "Máxima intensidad.",
    icon: <Flame size={20} />,
  },
];

const sessionOptions: SessionOption[] = [
  {
    id: "morning",
    label: "Mañana",
    description: "Sesiones frescas para comenzar el día.",
    icon: <Sun size={20} />,
  },
  {
    id: "afternoon",
    label: "Tarde",
    description: "Bloque de enfoque después de clases o trabajo.",
    icon: <Clock size={20} />,
  },
  {
    id: "night",
    label: "Noche",
    description: "Repaso profundo al cerrar el día.",
    icon: <Moon size={20} />,
  },
  {
    id: "flexible",
    label: "Flexible",
    description: "Se adapta a tu disponibilidad diaria.",
    icon: <RefreshCw size={20} />,
  },
];

const challengeOptions: ChallengeOption[] = [
  {
    id: "retention",
    label: "Retener información",
    description: "Olvido rápido de conceptos vistos antes.",
    icon: <RefreshCw size={20} />,
  },
  {
    id: "focus",
    label: "Mantener concentración",
    description: "Me distraigo o me cuesta sostener sesiones.",
    icon: <Eye size={20} />,
  },
  {
    id: "time-management",
    label: "Organizar tiempo",
    description: "No logro mantener una rutina semanal.",
    icon: <Calendar size={20} />,
  },
  {
    id: "exam-anxiety",
    label: "Ansiedad en exámenes",
    description: "Bajo rendimiento en evaluaciones reales.",
    icon: <AlertCircle size={20} />,
  },
  {
    id: "none",
    label: "Ninguno por ahora",
    description: "Quiero iniciar sin foco específico.",
    icon: <Sparkles size={20} />,
  },
];

const DAILY_TIME_TO_MINUTES: Record<"10-15" | "20-30" | "45+", number> = {
  "10-15": 15,
  "20-30": 25,
  "45+": 50,
};

const sessionLabelMap: Record<
  "morning" | "afternoon" | "night" | "flexible",
  string
> = {
  morning: "mañana",
  afternoon: "tarde",
  night: "noche",
  flexible: "bloques flexibles",
};

const challengeLabelMap = challengeOptions.reduce<Record<string, string>>(
  (acc, challenge) => {
    acc[challenge.id] = challenge.label;
    return acc;
  },
  {},
);

const stepTitles = [
  "Bienvenida",
  "Objetivos",
  "Contexto",
  "Hábitos",
  "Bloqueos",
  "Plan",
];

const creditCosts = [
  "Flashcards: 1 crédito",
  "Cuestionarios: 1 crédito",
  "Verdadero/Falso: 1 crédito",
  "Guías de estudio: 2 créditos",
  "Simulación de examen: 2 créditos",
];

const getRecommendedStartPath = (
  goals: string[],
  preferredFormat: "flashcards" | "quizzes" | "mixed",
  challenges: string[],
  daysToExam: number | null,
) => {
  if (goals.includes("exams") && daysToExam !== null && daysToExam <= 30) {
    return "/exam-simulations";
  }
  if (challenges.includes("retention")) return "/flashcards";
  if (challenges.includes("exam-anxiety")) return "/truefalse";
  if (goals.includes("exams")) return "/exam-simulations";
  if (preferredFormat === "flashcards") return "/flashcards";
  if (preferredFormat === "quizzes") return "/quizzes";
  if (goals.includes("deep-understanding")) return "/study-guides";
  return "/categories";
};

const getEstimatedWeeklyCredits = (
  preferredFormat: "flashcards" | "quizzes" | "mixed",
  weeklyGoalDays: 3 | 5 | 7,
  goals: string[],
  challenges: string[],
) => {
  const generationBlocks =
    weeklyGoalDays >= 7 ? 5 : weeklyGoalDays >= 5 ? 4 : 3;
  const baseCostPerBlock = preferredFormat === "mixed" ? 2 : 1;
  const examExtra = goals.includes("exams") ? 2 : 0;
  const retentionExtra = challenges.includes("retention") ? 1 : 0;
  return generationBlocks * baseCostPerBlock + examExtra + retentionExtra;
};

const toDaysUntil = (examDate?: string | null) => {
  if (!examDate) return null;
  const now = new Date();
  const target = new Date(examDate);
  const diffMs = target.getTime() - now.getTime();
  if (Number.isNaN(diffMs)) return null;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const IntroModulePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [dailyTime, setDailyTime] = useState<"10-15" | "20-30" | "45+">(
    "20-30",
  );
  const [preferredFormat, setPreferredFormat] = useState<
    "flashcards" | "quizzes" | "mixed"
  >("mixed");
  const [studyLevel, setStudyLevel] = useState<
    "school" | "university" | "professional"
  >("university");
  const [weeklyGoalDays, setWeeklyGoalDays] = useState<3 | 5 | 7>(5);
  const [sessionPreference, setSessionPreference] = useState<
    "morning" | "afternoon" | "night" | "flexible"
  >("flexible");
  const [challengeAreas, setChallengeAreas] = useState<string[]>([
    "time-management",
  ]);
  const [examDate, setExamDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = stepTitles.length;

  const daysToExam = useMemo(() => toDaysUntil(examDate || null), [examDate]);

  const recommendedPath = useMemo(
    () =>
      getRecommendedStartPath(
        selectedGoals,
        preferredFormat,
        challengeAreas,
        daysToExam,
      ),
    [challengeAreas, daysToExam, preferredFormat, selectedGoals],
  );

  const weeklyMinutes = useMemo(
    () => DAILY_TIME_TO_MINUTES[dailyTime] * weeklyGoalDays,
    [dailyTime, weeklyGoalDays],
  );

  const estimatedWeeklyCredits = useMemo(
    () =>
      getEstimatedWeeklyCredits(
        preferredFormat,
        weeklyGoalDays,
        selectedGoals,
        challengeAreas,
      ),
    [challengeAreas, preferredFormat, selectedGoals, weeklyGoalDays],
  );

  const recommendedModule =
    modules.find((module) => module.path === recommendedPath) || modules[0];

  const firstWeekChecklist = useMemo(() => {
    const actions = [
      "Crear 1 tema principal y 1 subtema para organizar tu estudio.",
      `Reservar ${weeklyGoalDays} sesiones en tu semana (${sessionLabelMap[sessionPreference]}).`,
      "Completar al menos una sesión de repaso SM-2 en la semana.",
    ];

    if (preferredFormat === "flashcards") {
      actions.push("Generar 15-20 flashcards del tema principal.");
    } else if (preferredFormat === "quizzes") {
      actions.push("Generar 1 cuestionario de práctica y resolverlo completo.");
    } else {
      actions.push("Combinar 10 flashcards + 1 quiz corto para empezar mixto.");
    }

    if (selectedGoals.includes("exams")) {
      actions.push(
        "Realizar 1 simulación de examen para medir tu punto de partida.",
      );
    }

    if (challengeAreas.includes("retention")) {
      actions.push(
        "Activar una sesión corta extra de repaso para reforzar memoria.",
      );
    }

    return actions.slice(0, 5);
  }, [
    challengeAreas,
    preferredFormat,
    selectedGoals,
    sessionPreference,
    weeklyGoalDays,
  ]);

  const todayIso = new Date().toISOString().slice(0, 10);

  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  useEffect(() => {
    let active = true;

    const hydrateOnboardingProfile = async () => {
      if (!user?.id) return;

      try {
        const { profile } = await authApi.getOnboardingProfile();
        if (!active || !profile) return;

        if (Array.isArray(profile.goals)) {
          setSelectedGoals(
            profile.goals.filter(
              (goal): goal is string =>
                typeof goal === "string" && goal.trim().length > 0,
            ),
          );
        }

        if (
          profile.dailyTime &&
          ["10-15", "20-30", "45+"].includes(profile.dailyTime)
        ) {
          setDailyTime(profile.dailyTime as "10-15" | "20-30" | "45+");
        }

        if (
          profile.preferredFormat &&
          ["flashcards", "quizzes", "mixed"].includes(profile.preferredFormat)
        ) {
          setPreferredFormat(
            profile.preferredFormat as "flashcards" | "quizzes" | "mixed",
          );
        }

        if (
          profile.studyLevel &&
          ["school", "university", "professional"].includes(profile.studyLevel)
        ) {
          setStudyLevel(
            profile.studyLevel as "school" | "university" | "professional",
          );
        }

        if (
          profile.weeklyGoalDays &&
          [3, 5, 7].includes(profile.weeklyGoalDays)
        ) {
          setWeeklyGoalDays(profile.weeklyGoalDays as 3 | 5 | 7);
        }

        if (
          profile.sessionPreference &&
          ["morning", "afternoon", "night", "flexible"].includes(
            profile.sessionPreference,
          )
        ) {
          setSessionPreference(
            profile.sessionPreference as
              | "morning"
              | "afternoon"
              | "night"
              | "flexible",
          );
        }

        if (Array.isArray(profile.challengeAreas)) {
          const sanitizedChallenges = profile.challengeAreas.filter(
            (challenge): challenge is string =>
              typeof challenge === "string" && challenge.trim().length > 0,
          );
          if (sanitizedChallenges.length > 0) {
            setChallengeAreas(sanitizedChallenges);
          }
        }

        if (typeof profile.examDate === "string") {
          setExamDate(profile.examDate.slice(0, 10));
        }
      } catch {
        // If loading profile fails, keep defaults and local fallback behavior.
      }
    };

    hydrateOnboardingProfile();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId],
    );
  };

  const toggleChallenge = (challengeId: string) => {
    setChallengeAreas((prev) => {
      if (challengeId === "none") {
        return ["none"];
      }

      const withoutNone = prev.filter((item) => item !== "none");
      const exists = withoutNone.includes(challengeId);
      if (exists) {
        const next = withoutNone.filter((item) => item !== challengeId);
        return next.length > 0 ? next : ["none"];
      }

      return [...withoutNone, challengeId];
    });
  };

  const canGoNext = (() => {
    if (stepIndex === 1) return selectedGoals.length > 0;
    if (stepIndex === 4) return challengeAreas.length > 0;
    return true;
  })();

  const handleBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (stepIndex === totalSteps - 1) return;
    setStepIndex((prev) => prev + 1);
  };

  const persistProfile = async (overrides: Partial<OnboardingProfile> = {}) => {
    if (!user?.id) return;

    const payload: Partial<OnboardingProfile> = {
      goals: selectedGoals,
      dailyTime,
      preferredFormat,
      studyLevel,
      weeklyGoalDays,
      sessionPreference,
      challengeAreas,
      examDate: examDate || null,
      recommendedPath,
      ...overrides,
    };

    localStorage.setItem(
      `studyai:onboarding-profile:${user.id}`,
      JSON.stringify(payload),
    );

    await authApi.updateOnboardingProfile(payload);
  };

  const completeOnboarding = async (path: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await persistProfile({
        introSeen: true,
        skipped: false,
        completedAt: new Date().toISOString(),
      });
    } catch {
      // Keep the onboarding flow usable even if profile persistence fails.
    } finally {
      markIntroSeenForUser(user?.id);
      setIsSubmitting(false);
      navigate(path);
    }
  };

  const skipOnboarding = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await persistProfile({
        introSeen: true,
        skipped: true,
        completedAt: new Date().toISOString(),
      });
    } catch {
      // Keep the onboarding flow usable even if profile persistence fails.
    } finally {
      markIntroSeenForUser(user?.id);
      setIsSubmitting(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className="intro-onb-page">
      <section className="intro-onb-shell">
        {/* Top bar */}
        <header className="intro-onb-head">
          <span className="intro-onb-kicker">StudyAI</span>
          <button
            className="intro-onb-skip"
            onClick={() => void skipOnboarding()}
            disabled={isSubmitting}
          >
            Saltar configuración
          </button>
        </header>

        {/* Progress track */}
        <div className="intro-onb-track" aria-hidden="true">
          {stepTitles.map((title, index) => (
            <div
              key={title}
              className={`intro-onb-track-step ${index === stepIndex ? "active" : ""} ${index < stepIndex ? "done" : ""}`}
            >
              <div className="intro-onb-track-dot">
                {index < stepIndex ? (
                  <Check size={10} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="intro-onb-track-label">{title}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="intro-onb-progress" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Step content */}
        <div className={`intro-step-content intro-step-${stepIndex}`}>
          {/* Step 0: Bienvenida */}
          {stepIndex === 0 && (
            <section className="intro-step-card">
              <div className="intro-welcome-hero">
                <div className="intro-welcome-icon">
                  <Rocket size={52} />
                </div>
                <div className="intro-step-badge intro-badge-welcome">
                  Bienvenida
                </div>
              </div>
              <h2>
                Tu espacio de estudio
                <br />
                <span className="intro-h2-accent">inteligente</span>
              </h2>
              <p className="intro-step-desc">
                En unos pasos rápidos personalizamos tu experiencia completa.
                Obtendrás una ruta recomendada y un plan de los primeros 7 días.
              </p>
              <ul className="intro-benefits-list">
                <li>
                  <span className="intro-benefit-icon">
                    <Target size={15} />
                  </span>
                  Ruta recomendada según tus objetivos reales.
                </li>
                <li>
                  <span className="intro-benefit-icon">
                    <CalendarDays size={15} />
                  </span>
                  Plan semanal con carga de estudio sostenible.
                </li>
                <li>
                  <span className="intro-benefit-icon">
                    <Check size={15} />
                  </span>
                  Checklist de acciones para tus primeros 7 días.
                </li>
              </ul>
            </section>
          )}

          {/* Step 1: Objetivos */}
          {stepIndex === 1 && (
            <section className="intro-step-card">
              <div className="intro-step-header">
                <div className="intro-step-icon intro-step-icon-goals">
                  <Target size={18} />
                </div>
                <div>
                  <div className="intro-step-badge intro-badge-goals">
                    Paso 2 · Objetivos
                  </div>
                  <h2>
                    ¿Qué quieres <span className="intro-h2-accent">lograr</span>
                    ?
                  </h2>
                </div>
              </div>
              <p className="intro-step-desc">
                Elige uno o más objetivos para personalizar tu ruta.
              </p>
              <div className="intro-option-grid">
                {goalOptions.map((goal) => {
                  const selected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      className={`intro-option-card ${selected ? "selected" : ""}`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <span className="intro-option-icon">{goal.icon}</span>
                      <div className="intro-option-body">
                        <strong>{goal.label}</strong>
                        <p>{goal.description}</p>
                      </div>
                      <span className="intro-option-check">
                        {selected ? <Check size={12} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 2: Contexto */}
          {stepIndex === 2 && (
            <section className="intro-step-card">
              <div className="intro-step-header">
                <div className="intro-step-icon intro-step-icon-context">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="intro-step-badge intro-badge-context">
                    Paso 3 · Contexto
                  </div>
                  <h2>
                    ¿Cuál es tu <span className="intro-h2-accent">nivel</span>?
                  </h2>
                </div>
              </div>
              <p className="intro-step-desc">
                Ajustamos la profundidad y urgencia de tu ruta.
              </p>

              <div className="intro-choice-group">
                <h3>Nivel actual</h3>
                <div className="intro-option-grid intro-option-grid-3">
                  {studyLevelOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`intro-option-card intro-option-card-sm ${studyLevel === option.id ? "selected" : ""}`}
                      onClick={() => setStudyLevel(option.id)}
                    >
                      <span className="intro-option-icon">{option.icon}</span>
                      <div className="intro-option-body">
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedGoals.includes("exams") && (
                <div className="intro-input-wrap">
                  <label
                    className="intro-input-label"
                    htmlFor="intro-exam-date"
                  >
                    <CalendarDays size={14} /> Fecha estimada de examen
                  </label>
                  <input
                    id="intro-exam-date"
                    className="intro-input-date"
                    type="date"
                    min={todayIso}
                    value={examDate}
                    onChange={(event) => setExamDate(event.target.value)}
                  />
                  <p className="intro-input-help">
                    {daysToExam === null
                      ? "Opcional · ayuda a priorizar tu ruta."
                      : daysToExam <= 0
                        ? "Fecha muy cercana — activaremos foco intensivo."
                        : `Te quedan ~${daysToExam} días para prepararte.`}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Step 3: Hábitos */}
          {stepIndex === 3 && (
            <section className="intro-step-card">
              <div className="intro-step-header">
                <div className="intro-step-icon intro-step-icon-habits">
                  <Clock3 size={18} />
                </div>
                <div>
                  <div className="intro-step-badge intro-badge-habits">
                    Paso 4 · Hábitos
                  </div>
                  <h2>
                    Define tu <span className="intro-h2-accent">ritmo</span>
                  </h2>
                </div>
              </div>
              <p className="intro-step-desc">
                Sesiones realistas que puedas mantener en el tiempo.
              </p>

              <div className="intro-choice-group">
                <h3>
                  <Clock3 size={12} /> Tiempo diario
                </h3>
                <div className="intro-option-grid intro-option-grid-3">
                  {timeOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`intro-option-card intro-option-card-sm ${dailyTime === option.id ? "selected" : ""}`}
                      onClick={() =>
                        setDailyTime(option.id as "10-15" | "20-30" | "45+")
                      }
                    >
                      <span className="intro-option-icon">{option.icon}</span>
                      <div className="intro-option-body">
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="intro-choice-group">
                <h3>
                  <CalendarDays size={12} /> Días por semana
                </h3>
                <div className="intro-option-grid intro-option-grid-3">
                  {weeklyDaysOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`intro-option-card intro-option-card-sm ${weeklyGoalDays === option.id ? "selected" : ""}`}
                      onClick={() => setWeeklyGoalDays(option.id)}
                    >
                      <span className="intro-option-icon">{option.icon}</span>
                      <div className="intro-option-body">
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="intro-choice-group">
                <h3>
                  <Clock size={12} /> Franja preferida
                </h3>
                <div className="intro-option-grid intro-option-grid-2">
                  {sessionOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`intro-option-card intro-option-card-sm ${sessionPreference === option.id ? "selected" : ""}`}
                      onClick={() => setSessionPreference(option.id)}
                    >
                      <span className="intro-option-icon">{option.icon}</span>
                      <div className="intro-option-body">
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="intro-choice-group">
                <h3>
                  <Shuffle size={12} /> Formato preferido
                </h3>
                <div className="intro-option-grid intro-option-grid-3">
                  {formatOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`intro-option-card intro-option-card-sm ${preferredFormat === option.id ? "selected" : ""}`}
                      onClick={() => setPreferredFormat(option.id)}
                    >
                      <span className="intro-option-icon">{option.icon}</span>
                      <div className="intro-option-body">
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 4: Bloqueos */}
          {stepIndex === 4 && (
            <section className="intro-step-card">
              <div className="intro-step-header">
                <div className="intro-step-icon intro-step-icon-challenges">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <div className="intro-step-badge intro-badge-challenges">
                    Paso 5 · Bloqueos
                  </div>
                  <h2>
                    ¿Qué te <span className="intro-h2-accent">frena</span> hoy?
                  </h2>
                </div>
              </div>
              <p className="intro-step-desc">
                Identificar tus bloqueos nos permite diseñar la estrategia más
                útil desde el inicio.
              </p>
              <div className="intro-option-grid">
                {challengeOptions.map((challenge) => {
                  const selected = challengeAreas.includes(challenge.id);
                  return (
                    <button
                      key={challenge.id}
                      className={`intro-option-card ${selected ? "selected" : ""}`}
                      onClick={() => toggleChallenge(challenge.id)}
                    >
                      <span className="intro-option-icon">
                        {challenge.icon}
                      </span>
                      <div className="intro-option-body">
                        <strong>{challenge.label}</strong>
                        <p>{challenge.description}</p>
                      </div>
                      <span className="intro-option-check">
                        {selected ? <Check size={12} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 5: Plan */}
          {stepIndex === 5 && (
            <section className="intro-step-card intro-step-card-plan">
              <div className="intro-plan-hero">
                <div className="intro-welcome-icon intro-welcome-icon-plan">
                  <Sparkles size={44} />
                </div>
                <div className="intro-step-badge intro-badge-ready">
                  Tu plan está listo
                </div>
                <h2>
                  Todo configurado,
                  <br />
                  <span className="intro-h2-accent">¡comencemos!</span>
                </h2>
              </div>

              {/* Module recommendation */}
              <div className="intro-recommended-card">
                <div className="intro-recommended-label">
                  <Rocket size={11} /> Módulo recomendado para ti
                </div>
                <div className="intro-recommended-body">
                  <span className="intro-recommended-icon">
                    {recommendedModule.icon}
                  </span>
                  <div>
                    <strong>{recommendedModule.title}</strong>
                    <p>{recommendedModule.description}</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="intro-stats-row">
                <div className="intro-stat-chip">
                  <span className="intro-stat-icon">
                    <CalendarDays size={16} />
                  </span>
                  <div>
                    <strong>{weeklyGoalDays}×/semana</strong>
                    <span>{dailyTime} min</span>
                  </div>
                </div>
                <div className="intro-stat-chip">
                  <span className="intro-stat-icon">
                    <Clock size={16} />
                  </span>
                  <div>
                    <strong>{weeklyMinutes} min</strong>
                    <span>total semanal</span>
                  </div>
                </div>
                <div className="intro-stat-chip">
                  <span className="intro-stat-icon">
                    <Coins size={16} />
                  </span>
                  <div>
                    <strong>~{estimatedWeeklyCredits} créd.</strong>
                    <span>por semana</span>
                  </div>
                </div>
              </div>

              {/* Summary grid */}
              <div className="intro-summary-grid">
                <article>
                  <strong>Objetivos</strong>
                  <p>
                    {selectedGoals.length > 0
                      ? selectedGoals
                          .map(
                            (goalId) =>
                              goalOptions.find((goal) => goal.id === goalId)
                                ?.label,
                          )
                          .filter(Boolean)
                          .join(" · ")
                      : "Aún no definidos"}
                  </p>
                </article>
                <article>
                  <strong>Formato</strong>
                  <p>
                    {formatOptions.find(
                      (option) => option.id === preferredFormat,
                    )?.label || "Mixto"}
                  </p>
                </article>
                <article>
                  <strong>Franja</strong>
                  <p>{sessionLabelMap[sessionPreference]}</p>
                </article>
                <article>
                  <strong>Nivel</strong>
                  <p>
                    {studyLevelOptions.find(
                      (option) => option.id === studyLevel,
                    )?.label || "Universidad"}
                  </p>
                </article>
                <article>
                  <strong>Bloqueos</strong>
                  <p>
                    {challengeAreas
                      .map((c) => challengeLabelMap[c] || c)
                      .join(" · ")}
                  </p>
                </article>
                <article>
                  <strong>Examen</strong>
                  <p>
                    {daysToExam === null
                      ? "Sin fecha definida"
                      : `${daysToExam} día${daysToExam === 1 ? "" : "s"} restantes`}
                  </p>
                </article>
              </div>

              {/* Checklist */}
              <div className="intro-checklist-card">
                <h3>
                  <Check size={13} /> Checklist primeros 7 días
                </h3>
                <ul>
                  {firstWeekChecklist.map((item) => (
                    <li key={item}>
                      <span className="intro-checklist-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Credits + modules strip */}
              <div className="intro-credits-box">
                <h3>
                  <Coins size={14} /> Sistema de créditos IA
                </h3>
                <div className="intro-credits-pills">
                  {creditCosts.map((cost) => (
                    <span key={cost} className="intro-credit-pill">
                      {cost}
                    </span>
                  ))}
                </div>
              </div>

              <div className="intro-modules-strip">
                {modules.map((module) => (
                  <span key={module.path} className="intro-module-pill">
                    {module.icon}
                    {module.title}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="intro-onb-footer">
          <button
            className="intro-btn intro-btn-ghost"
            onClick={handleBack}
            disabled={stepIndex === 0 || isSubmitting}
          >
            Atrás
          </button>

          {stepIndex < totalSteps - 1 ? (
            <button
              className="intro-btn intro-btn-primary"
              onClick={handleNext}
              disabled={!canGoNext || isSubmitting}
            >
              Continuar
              <ArrowRight size={15} />
            </button>
          ) : (
            <div className="intro-final-actions">
              <button
                className="intro-btn intro-btn-ghost"
                onClick={() => void completeOnboarding("/dashboard")}
                disabled={isSubmitting}
              >
                Ir al inicio
              </button>
              <button
                className="intro-btn intro-btn-primary"
                onClick={() => void completeOnboarding(recommendedPath)}
                disabled={isSubmitting}
              >
                Comenzar mi plan
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </footer>
      </section>
    </div>
  );
};
export default IntroModulePage;
