import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { UserAdminService } from "@/lib/gen/kinesiapp/admin/v1/user_admin_pb";

import type { AdminUser, UserRole } from "../types";
import { ROLE, toAdminUser } from "./mappers";
import { collectPages } from "./pages";
import { authedTransport } from "./transport";

export type NewUser = { email: string; password: string; fullName: string; role: UserRole };

/** Adaptador de kinesiapp.admin.v1.UserAdminService. */
class UserAdminGateway {
  constructor(private readonly client: Client<typeof UserAdminService>) {}

  async all(pageSize: number): Promise<AdminUser[]> {
    return collectPages(async (page) => {
      const response = await this.client.listUsers({ page: { pageSize, pageToken: page } });
      return { items: response.users.map(toAdminUser), next: response.page?.nextPageToken ?? "" };
    });
  }

  async create(user: NewUser): Promise<AdminUser> {
    const response = await this.client.createUser({ ...user, role: ROLE[user.role] });
    if (!response.user) throw new Error("The backend did not return the new user");
    return toAdminUser(response.user);
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
    await this.client.updateUserRole({ userId, role: ROLE[role] });
  }

  async updateStatus(userId: string, isActive: boolean): Promise<void> {
    await this.client.updateUserStatus({ userId, isActive });
  }
}

export function userAdminGateway(): UserAdminGateway {
  return new UserAdminGateway(createClient(UserAdminService, authedTransport()));
}
