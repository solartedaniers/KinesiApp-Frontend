import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { AccountService } from "@/lib/gen/kinesiapp/account/v1/account_pb";

import type { UploadTarget, User } from "../types";
import { toUploadTarget, type ImageType, IMAGE_TYPE } from "./uploads";
import { toUser } from "./mappers";
import { authedTransport } from "./transport";

/** Adaptador de kinesiapp.account.v1.AccountService: la cuenta de quien llama. */
class AccountGateway {
  constructor(private readonly client: Client<typeof AccountService>) {}

  async me(): Promise<User> {
    return toUser((await this.client.getMyAccount({})).account);
  }

  async updateName(fullName: string): Promise<User> {
    return toUser((await this.client.updateMyProfile({ fullName })).account);
  }

  async createAvatarUpload(type: ImageType, size: number): Promise<UploadTarget> {
    const response = await this.client.createAvatarUpload({ contentType: IMAGE_TYPE[type], contentLength: BigInt(size) });
    return toUploadTarget(response.uploadId, response.target);
  }

  async confirmAvatarUpload(uploadId: string): Promise<User> {
    return toUser((await this.client.confirmAvatarUpload({ uploadId })).account);
  }

  async deleteAvatar(): Promise<User> {
    return toUser((await this.client.deleteMyAvatar({})).account);
  }

  async grantVideoConsent(version: number): Promise<User> {
    return toUser((await this.client.grantVideoConsent({ version })).account);
  }
}

export function accountGateway(): AccountGateway {
  return new AccountGateway(createClient(AccountService, authedTransport()));
}
