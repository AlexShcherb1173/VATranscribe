export type JobStatus =
  | "pending"
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled";

export type JobType =
  | "download"
  | "transcribe"
  | "combined"
  | "export";

export type Job = {
  id: string;
  type: JobType;
  status: JobStatus;
  source_type: string | null;
  title: string | null;
  input_url: string | null;
  requested_format: string | null;
  requested_file_name: string | null;
  mp4_mode: string | null;
  output_media_asset_id: string | null;
  selected_video_format_id: string | null;
  selected_audio_format_id: string | null;
  transcription_media_asset_id: string | null;
  download_audio: boolean;
  download_video: boolean;
  transcription_model: string | null;
  transcription_language: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type JobLog = {
  id: string;
  job_id: string;
  level: string;
  message: string;
  created_at: string;
};