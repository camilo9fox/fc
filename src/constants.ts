// ─── File upload ──────────────────────────────────────────────────────────────
export const ALLOWED_UPLOAD_FORMATS = ".pdf,.txt";

// ─── Generation limits ────────────────────────────────────────────────────────
export const MAX_FLASHCARDS_GENERATED = 10;
export const MAX_QUIZ_QUESTIONS_GENERATED = 10;
export const MAX_TF_STATEMENTS_GENERATED = 10;

// ─── Study score thresholds ───────────────────────────────────────────────────
export const SCORE_EXCELLENT_PCT = 80; // >= 80 → trophy emoji / green ring
export const SCORE_GOOD_PCT = 70; // >= 70 → green ring
export const SCORE_OK_PCT = 50; // >= 50 → muscle emoji
export const SCORE_WARN_PCT = 40; // >= 40 → amber ring

export const SCORE_EMOJI_EXCELLENT = "🏆";
export const SCORE_EMOJI_OK = "💪";
export const SCORE_EMOJI_STUDY = "📚";

export const SCORE_COLOR_GREEN = "#10b981";
export const SCORE_COLOR_AMBER = "#f59e0b";
export const SCORE_COLOR_RED = "#ef4444";

// ─── 3D Ring carousel (StudySession) ─────────────────────────────────────────
export const RING_SLOTS = 7;
export const RING_RADIUS_PX = 400;
/** Angle (°) at which a side card starts fading out */
export const RING_FADE_ANGLE = 130;
/** Angle (°) at which a side card is fully hidden */
export const RING_HIDE_ANGLE = 135;
/** Scale damping factor for side cards (0–1) */
export const RING_SCALE_DAMPING = 0.28;
