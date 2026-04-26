import type { Job } from "@/entities/job/model/types";
import { formatDateTime } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";

type JobDetailsCardProps = {
  job: Job;
};

export function JobDetailsCard({ job }: JobDetailsCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">
            {job.title || job.id}
          </div>
          <div className="mt-1 text-xs text-slate-500">{job.id}</div>
        </div>
        <Badge status={job.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Type" value={job.type} />
        <Field label="Source type" value={job.source_type || "—"} />
        <Field label="Requested format" value={job.requested_format || "—"} />
        <Field label="File name" value={job.requested_file_name || "—"} />
        <Field label="MP4 mode" value={job.mp4_mode || "—"} />
        <Field label="Transcription model" value={job.transcription_model || "—"} />
        <Field label="Language" value={job.transcription_language || "—"} />
        <Field label="Created" value={formatDateTime(job.created_at)} />
        <Field label="Started" value={formatDateTime(job.started_at)} />
        <Field label="Finished" value={formatDateTime(job.finished_at)} />
      </div>

      <div className="mt-5 space-y-3">
        <LongField label="Input URL" value={job.input_url || "—"} />
                <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Output media asset</div>
          <div className="mt-1 break-all text-sm text-slate-200">
            {job.output_media_asset_id || "—"}
          </div>
          {job.output_media_asset_id ? (
            <div className="mt-2 text-xs text-cyan-300">
              Output file linked on next backend media-assets stage
            </div>
          ) : null}
        </div>
        <LongField
          label="Transcription media asset"
          value={job.transcription_media_asset_id || "—"}
        />
        <LongField label="Error" value={job.error_message || "—"} />
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
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  );
}

function LongField({ label, value }: FieldProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 break-all text-sm text-slate-200">{value}</div>
    </div>
  );
}