// Contratos de la API (backend/app/schemas) que usa el cliente web.

export const USER_ROLES = ["athlete", "coach", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// El registro público no ofrece admin (PublicSignupRole en el backend)
export const SIGNUP_ROLES = ["athlete", "coach"] as const satisfies readonly UserRole[];
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  avatar_data_url: string | null;
};

export type Gender = "male" | "female" | "other";

/** AthleteProfileRead. `user_id` es null en deportistas gestionados por un coach (sin cuenta). */
export type AthleteProfile = {
  id: number;
  user_id: number | null;
  coach_id: number | null;
  display_name: string;
  display_avatar: string | null;
  is_managed: boolean;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  birth_date: string;
};

export type AnalysisStatus = "pending" | "processed" | "failed";
export type MovementType = "jump" | "squat";

export type JointAngleMeasurement = {
  id: number;
  joint_name: string;
  angle_degrees: number;
  frame_timestamp_ms: number;
};

/** JumpAnalysisRead. `risk_score` está en [0, 1] y es null hasta que el análisis termina. */
export type JumpAnalysis = {
  id: number;
  athlete_id: number;
  movement_type: MovementType;
  status: AnalysisStatus;
  risk_score: number | null;
  recorded_at: string;
  angle_measurements: JointAngleMeasurement[];
};
