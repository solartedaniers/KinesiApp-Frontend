import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { AuthService } from "@/lib/gen/kinesiapp/auth/v1/auth_pb";

import type { SignupRole, TokenPair } from "../types";
import { ROLE, toTokenPair } from "./mappers";
import { authedTransport, grpcTransport } from "./transport";

export type Registration = {
  email: string;
  password: string;
  fullName: string;
  role: SignupRole;
  acceptedVideoConsentVersion: number;
};

/** Adaptador de kinesiapp.auth.v1.AuthService. Todo es público salvo el cambio de contraseña. */
export class AuthGateway {
  constructor(
    private readonly anonymous: Client<typeof AuthService>,
    private readonly authenticated: Client<typeof AuthService>,
  ) {}

  async register(registration: Registration): Promise<void> {
    await this.anonymous.register({
      email: registration.email,
      password: registration.password,
      fullName: registration.fullName,
      role: ROLE[registration.role],
      acceptedVideoConsentVersion: registration.acceptedVideoConsentVersion,
    });
  }

  async requestVerificationCode(email: string): Promise<void> {
    await this.anonymous.requestVerificationCode({ email });
  }

  async verifyEmail(email: string, code: string): Promise<TokenPair> {
    return toTokenPair((await this.anonymous.verifyEmail({ email, code })).session);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    return toTokenPair((await this.anonymous.login({ email, password })).session);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    return toTokenPair((await this.anonymous.refreshSession({ refreshToken })).session);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.anonymous.logout({ refreshToken });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.anonymous.requestPasswordReset({ email });
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    await this.anonymous.verifyPasswordResetCode({ email, code });
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    await this.anonymous.confirmPasswordReset({ email, code, newPassword });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<TokenPair> {
    return toTokenPair((await this.authenticated.changePassword({ currentPassword, newPassword })).session);
  }
}

export function authGateway(): AuthGateway {
  return new AuthGateway(createClient(AuthService, grpcTransport()), createClient(AuthService, authedTransport()));
}
