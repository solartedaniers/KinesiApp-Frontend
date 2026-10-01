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
