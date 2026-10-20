import "server-only";

import type { Timestamp } from "@bufbuild/protobuf/wkt";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import type { Account } from "@/lib/gen/kinesiapp/account/v1/account_pb";
import type { User as AdminUserMessage } from "@/lib/gen/kinesiapp/admin/v1/user_admin_pb";
import type { Analysis, AnalysisSummary as AnalysisSummaryMessage } from "@/lib/gen/kinesiapp/analysis/v1/analysis_pb";
import { type AthleteProfile as AthleteMessage, Gender as GenderEnum } from "@/lib/gen/kinesiapp/athlete/v1/athlete_pb";
import type { Session } from "@/lib/gen/kinesiapp/auth/v1/auth_pb";
import type { ChatMessage as ChatMessageMessage } from "@/lib/gen/kinesiapp/chat/v1/chat_pb";
import { AiState as AiStateEnum } from "@/lib/gen/kinesiapp/common/v1/ai_state_pb";
import { ChatRole as ChatRoleEnum } from "@/lib/gen/kinesiapp/common/v1/chat_pb";
import type { CalendarDate } from "@/lib/gen/kinesiapp/common/v1/date_pb";
import { ErrorReason } from "@/lib/gen/kinesiapp/common/v1/errors_pb";
import { UserRole as UserRoleEnum } from "@/lib/gen/kinesiapp/common/v1/identity_pb";
import {
  type AnalysisProgress as ProgressMessage,
  AnalysisStage as StageEnum,
  AnalysisStatus as StatusEnum,
  JointAngle,
  MovementType as MovementEnum,
  type RepetitionScore as RepetitionScoreMessage,
  type RiskAssessment as RiskAssessmentMessage,
  RiskLevel as RiskLevelEnum,
} from "@/lib/gen/kinesiapp/common/v1/movement_pb";
import type { SignedUrl as SignedUrlMessage } from "@/lib/gen/kinesiapp/common/v1/storage_pb";
import type { Team as TeamMessage } from "@/lib/gen/kinesiapp/team/v1/team_pb";

import type {
  AdminUser,
  AiState,
  AnalysisProgress,
  AnalysisStage,
  AnalysisStatus,
  AnalysisSummary,
  AthleteProfile,
  ChatMessage,
  Gender,
  Joint,
  JumpAnalysis,
  MovementType,
  RepetitionScore,
  RiskAssessment,
  RiskLevel,
  SignedUrl,
  Team,
  TokenPair,
  User,
  UserRole,
} from "../types";

// Traducciones entre los enums del contrato y los valores del dominio. Las uso en los dos sentidos.
export const ROLE = { athlete: UserRoleEnum.ATHLETE, coach: UserRoleEnum.COACH, admin: UserRoleEnum.ADMIN } as const;
export const MOVEMENT = { jump: MovementEnum.JUMP, squat: MovementEnum.SQUAT } as const;
export const GENDER = { male: GenderEnum.MALE, female: GenderEnum.FEMALE, other: GenderEnum.OTHER } as const;

const STATUS: Record<StatusEnum, AnalysisStatus | null> = {
  [StatusEnum.UNSPECIFIED]: null,
  [StatusEnum.PENDING]: "pending",
  [StatusEnum.PROCESSED]: "processed",
  [StatusEnum.FAILED]: "failed",
};
const RISK: Record<RiskLevelEnum, RiskLevel | null> = {
  [RiskLevelEnum.UNSPECIFIED]: null,
  [RiskLevelEnum.LOW]: "low",
  [RiskLevelEnum.MODERATE]: "moderate",
  [RiskLevelEnum.HIGH]: "high",
};
const JOINT: Record<JointAngle, Joint | null> = {
  [JointAngle.UNSPECIFIED]: null,
  [JointAngle.KNEE_FLEXION]: "knee_flexion",
  [JointAngle.TRUNK_INCLINATION]: "trunk_inclination",
};
const STAGE: Record<StageEnum, AnalysisStage> = {
  [StageEnum.UNSPECIFIED]: "queued",
  [StageEnum.QUEUED]: "queued",
  [StageEnum.DOWNLOADING_VIDEO]: "downloading_video",
  [StageEnum.EXTRACTING_POSE]: "extracting_pose",
  [StageEnum.DETECTING_REPETITIONS]: "detecting_repetitions",
  [StageEnum.SCORING_RISK]: "scoring_risk",
};

function inverse<K extends string, V extends number>(table: Record<K, V>, value: V): K | null {
  return (Object.keys(table) as K[]).find((key) => table[key] === value) ?? null;
}

/** Un valor de enum que el contrato agregue después no debe romper la pantalla: lo trato como contrato roto. */
function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Unexpected ${what} from the backend`);
  return value;
}

function iso(timestamp: Timestamp | undefined): string {
  return timestamp ? timestampDate(timestamp).toISOString() : "";
}

function calendarDate(date: CalendarDate | undefined): string {
  if (!date) return "";
  const pad = (value: number, size: number) => String(value).padStart(size, "0");
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

export function toCalendarDate(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

export function toSignedUrl(message: SignedUrlMessage): SignedUrl {
  return { url: message.url, expires_at: iso(message.expiresAt) };
}

export function toTokenPair(session: Session | undefined): TokenPair {
  if (!session) throw new Error("The backend did not return a session");
  return { access_token: session.accessToken, refresh_token: session.refreshToken };
}

export function toRole(role: UserRoleEnum): UserRole {
  return required(inverse(ROLE, role), "role");
}

export function toUser(account: Account | undefined): User {
  if (!account) throw new Error("The backend did not return an account");
  return {
    id: account.id,
    email: account.email,
    full_name: account.fullName,
    role: toRole(account.role),
    created_at: iso(account.createdAt),
    avatar_url: account.avatar?.url ?? null,
    video_consent_version: account.videoConsentVersion ?? null,
  };
}

export function toAdminUser(user: AdminUserMessage): AdminUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: toRole(user.role),
    created_at: iso(user.createdAt),
    avatar_url: user.avatar?.url ?? null,
    video_consent_version: null,
    is_active: user.isActive,
    is_verified: user.isVerified,
  };
}

export function toAthlete(athlete: AthleteMessage | undefined): AthleteProfile {
  if (!athlete) throw new Error("The backend did not return an athlete profile");
  const biometrics = athlete.biometrics;
  return {
    id: athlete.id,
    user_id: athlete.userId ?? null,
    coach_id: athlete.coachId ?? null,
    coach_name: athlete.coachName ?? null,
    display_name: athlete.displayName,
    display_avatar: athlete.avatar?.url ?? null,
    is_managed: athlete.isManaged,
    gender: required<Gender>(inverse(GENDER, biometrics?.gender ?? GenderEnum.UNSPECIFIED), "gender"),
    height_cm: biometrics?.heightCm ?? 0,
    weight_kg: biometrics?.weightKg ?? 0,
    birth_date: calendarDate(biometrics?.birthDate),
  };
}

export function toTeam(team: TeamMessage | undefined): Team {
  if (!team) throw new Error("The backend did not return a team");
  return { id: team.id, name: team.name, owner_id: team.ownerId, athlete_ids: team.athleteIds, created_at: iso(team.createdAt) };
}

function reasonCode(reason: ErrorReason): string | null {
  return reason === ErrorReason.UNSPECIFIED ? null : (ErrorReason[reason] ?? "GENERIC");
}

export function toAnalysisSummary(summary: AnalysisSummaryMessage | undefined): AnalysisSummary {
  if (!summary) throw new Error("The backend did not return an analysis");
  return {
    id: summary.id,
    athlete_id: summary.athleteId,
    movement_type: required<MovementType>(inverse(MOVEMENT, summary.movementType), "movement type"),
    status: required(STATUS[summary.status], "analysis status"),
    recorded_at: iso(summary.recordedAt),
    risk_score: summary.riskScore ?? null,
    risk_level: RISK[summary.riskLevel],
    dominant_risk_pattern: summary.dominantRiskPattern ?? null,
    failure_reason: reasonCode(summary.failureReason),
  };
}

function toRepetitionScore(score: RepetitionScoreMessage): RepetitionScore {
  return { code: score.code, score: score.score ?? null, measured_degrees: score.measuredDegrees ?? null };
}

function toRiskAssessment(assessment: RiskAssessmentMessage): RiskAssessment {
  return {
    risk_score: assessment.riskScore,
    risk_level: RISK[assessment.riskLevel],
    dominant_pattern: assessment.dominantPattern ?? null,
    patterns: assessment.patterns.map((pattern) => ({
      code: pattern.code,
      score: pattern.score ?? null,
      repetitions_triggered: pattern.repetitionsTriggered,
    })),
    repetitions: assessment.repetitions.map((repetition) => ({
      start_ms: repetition.startMs,
      end_ms: repetition.endMs,
      pattern_scores: repetition.patternScores.map(toRepetitionScore),
      signal_scores: repetition.signalScores.map(toRepetitionScore),
    })),
  };
}

export function toAnalysis(analysis: Analysis | undefined): JumpAnalysis {
  if (!analysis) throw new Error("The backend did not return an analysis");
  const measurements = analysis.angleSamples.flatMap((sample, index) => {
    const joint = JOINT[sample.joint];
    // Descarto las articulaciones que este cliente todavía no sabe dibujar
    return joint
      ? [{ id: index, joint_name: joint, angle_degrees: sample.angleDegrees, frame_timestamp_ms: sample.frameTimestampMs }]
      : [];
  });
  return {
    ...toAnalysisSummary(analysis.summary),
    angle_measurements: measurements,
    risk_assessment: analysis.riskAssessment ? toRiskAssessment(analysis.riskAssessment) : null,
  };
}

export function toProgress(progress: ProgressMessage): AnalysisProgress {
  return { stage: STAGE[progress.stage], frames_processed: progress.framesProcessed, frames_total: progress.framesTotal };
}

export function toChatMessage(message: ChatMessageMessage | undefined): ChatMessage {
  if (!message) throw new Error("The backend did not return a chat message");
  return {
    id: message.id,
    role: message.role === ChatRoleEnum.USER ? "user" : "assistant",
    content: message.content,
    created_at: iso(message.createdAt),
  };
}

export function toAiState(state: AiStateEnum): AiState {
  return state === AiStateEnum.READY ? "ready" : "warming_up";
}
