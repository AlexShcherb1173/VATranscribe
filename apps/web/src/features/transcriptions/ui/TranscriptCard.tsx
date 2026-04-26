import type { Transcript } from "@/entities/transcript/model/types";
import { Card } from "@/shared/ui/Card";
import { formatDateTime } from "@/shared/lib/utils";

type TranscriptCardProps = {
  transcript: Transcript;
};

export function TranscriptCard({ transcript }: TranscriptCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <div className="text-lg font-semibold text-white">Transcript</div>
        <div className="mt-1 text-xs text-slate-500">{transcript.id}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Language" value={transcript.language} />
        <Field label="Model" value={transcript.model_name} />
        <Field label="Engine" value={transcript.engine} />
        <Field label="Job ID" value={transcript.job_id} />
        <Field label="Media asset ID" value={transcript.media_asset_id} />
        <Field label="Created" value={formatDateTime(transcript.created_at)} />
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wide text-slate-500">Full text</div>
        <div className="mt-2 max-h-[260px] overflow-auto rounded-xl border border-slate-800 bg-slate-950/70 p-4 whitespace-pre-wrap text-sm text-slate-200">
          {transcript.full_text || "—"}
        </div>
      </div>
    </Card>
  );
}

type FieldProps = {
  label: string;
  value: string;
};

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 break-all text-sm text-white">{value}</div>
    </div>
  );
}