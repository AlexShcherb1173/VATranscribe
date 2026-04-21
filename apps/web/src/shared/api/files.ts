import { apiClient } from "@/shared/api/client";
import type { MediaFile } from "@/entities/media-file/model/types";

export async function getMediaFiles(): Promise<MediaFile[]> {
  const response = await apiClient.get<MediaFile[]>("/media-assets");
  return response.data;
}