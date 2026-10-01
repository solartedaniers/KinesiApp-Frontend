// Endpoints del backend (relativos a API_BASE_URL), en un solo lugar.
export const API_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  verifyEmail: "/auth/verify-email",
  requestVerificationCode: "/auth/verification-code/request",
  requestPasswordReset: "/auth/password-recovery/request",
  verifyPasswordResetCode: "/auth/password-recovery/verify",
  confirmPasswordReset: "/auth/password-recovery/confirm",
  changePassword: "/auth/password/change",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",

  myAthleteProfile: "/athletes/me",
  coachAthletes: "/coach/athletes",
  teamAnalyses: "/jump-analyses/team",
  users: "/users",
  athletes: "/athletes",
  analysesByAthlete: (athleteId: number) => `/jump-analyses/by-athlete/${athleteId}`,
  analysis: (analysisId: number) => `/jump-analyses/${analysisId}`,
  analysisVideoAccess: (analysisId: number) => `/jump-analyses/${analysisId}/video-access`,
  analysisVideo: (analysisId: number) => `/jump-analyses/${analysisId}/video`,
} as const;
