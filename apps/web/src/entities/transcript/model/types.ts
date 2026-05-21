export type TranscriptSegment = {
  id: string;
  transcript_id: string;
  start_sec: number;
  end_sec: number;
  text: string;
  speaker_label: string | null;
  confidence: string | null;
  order_index: number;
};

export type TranscriptMediaAsset = {
  id: string;
  kind: string;
  original_name: string;
  stored_name: string;
  mime_type?: string | null;
  extension?: string | null;
  size_bytes: number;
  duration_sec?: number | null;
  path: string;
  checksum_sha256?: string | null;
  created_at?: string | null;
  download_url?: string | null;
};

export type ExportArtifact = {
  id: string;
  transcript_id: string;
  format: string;
  path: string;
  size_bytes: number;
  created_at: string;
  download_url?: string | null;
};

export type Transcript = {
  id: string;
  job_id: string;
  media_asset_id: string;
  media_asset?: TranscriptMediaAsset | null;
  source_file_name?: string | null;
  display_name?: string | null;
  language: string;
  model_name: string;
  engine: string;
  full_text: string;
  created_at: string;
  segments?: TranscriptSegment[];
  exports?: ExportArtifact[];
};
