import { apiClient } from "@/shared/api/client";
import type {
  CreateDownloadJobRequest,
  CreatedJobResponse,
  DownloadAnalyzeRequest,
  DownloadAnalyzeResponse,
} from "@/features/downloads/model/types";

export async function analyzeDownloadUrl(
  payload: DownloadAnalyzeRequest,
): Promise<DownloadAnalyzeResponse> {
  const response = await apiClient.post<DownloadAnalyzeResponse>(
    "/downloads/analyze",
    payload,
  );
  return response.data;
}

export async function createDownloadJob(
  payload: CreateDownloadJobRequest,
): Promise<CreatedJobResponse> {
  const response = await apiClient.post<CreatedJobResponse>(
    "/downloads/jobs",
    payload,
  );
  return response.data;
}