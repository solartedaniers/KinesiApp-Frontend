import type { KneeTarget } from "./design/signals.ts";

// Modelos de dominio del cliente web. Los gateways de lib/grpc los arman desde los mensajes del contrato:
// la UI nunca ve tipos de Protobuf. Los ids son string porque el contrato los entrega con jstype JS_STRING.

export const USER_ROLES = ["athlete", "coach", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// El registro público no ofrece admin
export const SIGNUP_ROLES = ["athlete", "coach"] as const satisfies readonly UserRole[];
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export type TokenPair = {
  access_token: string;
  refresh_token: string;
};

/** La cuenta de la sesión (AccountService.GetMyAccount). */
export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  avatar_url: string | null;
  video_consent_version: number | null;
};

/** Una cuenta vista por el admin (UserAdminService), con su estado. */
export type AdminUser = User & { is_active: boolean; is_verified: boolean };

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

/** `user_id` es null en deportistas gestionados por un coach (sin cuenta). `birth_date` va como AAAA-MM-DD. */
export type AthleteProfile = {
  id: string;
  user_id: string | null;
  coach_id: string | null;
  coach_name: string | null;
  display_name: string;
  display_avatar: string | null;
  is_managed: boolean;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  birth_date: string;
};

export const ANALYSIS_STATUSES = ["pending", "processed", "failed"] as const;
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];
export const MOVEMENT_TYPES = ["jump", "squat"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];
export const RISK_LEVELS = ["low", "moderate", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
export const JOINTS = ["knee_flexion", "trunk_inclination"] as const;
export type Joint = (typeof JOINTS)[number];

export type JointAngleMeasurement = {
  /** Índice dentro de la serie: el contrato no da id por muestra y React necesita una clave estable. */
  id: number;
  joint_name: Joint;
  angle_degrees: number;
  frame_timestamp_ms: number;
};

/** `logo_url` es una URL firmada de vida corta; null si el equipo usa su emblema con iniciales. */
export type Team = { id: string; name: string; owner_id: string; athlete_ids: string[]; created_at: string; logo_url: string | null };

export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; content: string; created_at: string };

/** Lo que muestran los listados. `risk_score` está en [0, 1] y solo existe en PROCESSED. */
export type AnalysisSummary = {
  id: string;
  athlete_id: string;
  movement_type: MovementType;
  status: AnalysisStatus;
  recorded_at: string;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  dominant_risk_pattern: string | null;
  /** Motivo en minúsculas (clave de errors en i18n); solo en FAILED. */
  failure_reason: string | null;
  /** Mediana de los picos de flexión por repetición; solo en PROCESSED y si la IA midió la rodilla. */
  knee_median_peak_degrees: number | null;
  /** Rango sin riesgo con que la IA puntuó este análisis; null si el modelo no mira la rodilla. */
  knee_target: KneeTarget | null;
};

export type RepetitionScore = { code: string; score: number | null; measured_degrees: number | null };
export type Repetition = {
  start_ms: number;
  end_ms: number;
  pattern_scores: RepetitionScore[];
  signal_scores: RepetitionScore[];
};
/** Una señal con la rampa que la puntúa: el riesgo empieza en `onset_degrees` y satura en `saturation_degrees`. */
export type RiskSignal = {
  code: string;
  joint: Joint | null;
  direction: "higher_is_riskier" | "lower_is_riskier" | null;
  onset_degrees: number;
  saturation_degrees: number;
  measured: { median: number; min: number; max: number } | null;
  score_median: number | null;
};
export type RiskPattern = { code: string; score: number | null; repetitions_triggered: number; signals: RiskSignal[] };
export type RiskAssessment = {
  risk_score: number;
  risk_level: RiskLevel | null;
  dominant_pattern: string | null;
  patterns: RiskPattern[];
  repetitions: Repetition[];
};

/** El análisis completo, con las series de ángulos y el detalle de riesgo cuando existe. */
export type JumpAnalysis = AnalysisSummary & {
  angle_measurements: JointAngleMeasurement[];
  risk_assessment: RiskAssessment | null;
};

export const ANALYSIS_STAGES = ["queued", "downloading_video", "extracting_pose", "detecting_repetitions", "scoring_risk"] as const;
export type AnalysisStage = (typeof ANALYSIS_STAGES)[number];
export type AnalysisProgress = { stage: AnalysisStage; frames_processed: number; frames_total: number };

/** URL firmada de vida corta (lectura) o de subida directa al bucket. */
export type SignedUrl = { url: string; expires_at: string };
export type UploadTarget = { upload_id: string; url: string; headers: Record<string, string>; expires_at: string };

/** Desde qué risk_score empieza cada nivel; los decide el backend (RISK_LEVEL_*). */
export type RiskCuts = { moderate: number; high: number };

/** Reglas que el backend aplica y el cliente valida antes de enviar (SystemService.GetClientPolicy). */
export type ClientPolicy = {
  video_consent_version: number;
  video_max_duration_seconds: number;
  video_max_size_bytes: number;
  max_avatar_size_bytes: number;
  password_min_length: number;
  password_max_length: number;
  athlete_min_age_years: number;
  athlete_max_age_years: number;
  chat_message_max_chars: number;
  min_height_cm: number;
  max_height_cm: number;
  min_weight_kg: number;
  max_weight_kg: number;
  risk_scale: RiskCuts;
};

export type AiState = "warming_up" | "ready";
