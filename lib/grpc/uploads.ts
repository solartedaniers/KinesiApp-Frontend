import "server-only";

import { timestampDate } from "@bufbuild/protobuf/wkt";

import { ImageContentType, type UploadTarget as UploadTargetMessage } from "@/lib/gen/kinesiapp/common/v1/storage_pb";

import { AVATAR_UPLOAD_TYPES } from "../avatar";
import type { UploadTarget } from "../types";

export type ImageType = (typeof AVATAR_UPLOAD_TYPES)[number];

export const IMAGE_TYPE: Record<ImageType, ImageContentType> = {
  "image/jpeg": ImageContentType.JPEG,
  "image/png": ImageContentType.PNG,
  "image/webp": ImageContentType.WEBP,
};

export function isImageType(value: string): value is ImageType {
  return value in IMAGE_TYPE;
}

export function toUploadTarget(uploadId: string, target: UploadTargetMessage | undefined): UploadTarget {
  if (!target) throw new Error("The backend did not return an upload target");
  return {
    upload_id: uploadId,
    url: target.url,
    headers: { ...target.headers },
    expires_at: target.expiresAt ? timestampDate(target.expiresAt).toISOString() : "",
  };
}
