import { apiClient } from "@/shared/api/client";
import type { Transcript } from "@/entities/transcript/model/types";

export type CreateTranscriptionJobPayload = {
  media_asset_id: string;
  model_name: string | null;
  language: string | null;
};

export async function createTranscriptionJob(payload: CreateTranscriptionJobPayload) {
  const response = await apiClient.post("/transcriptions/jobs", payload);
  return response.data;
}

export async function getTranscripts(): Promise<Transcript[]> {
  const response = await apiClient.get<Transcript[]>("/transcripts");
  return response.data;
}

export async function getTranscript(transcriptId: string): Promise<Transcript> {
  const response = await apiClient.get<Transcript>(`/transcripts/${transcriptId}`);
  return response.data;
}
