import type { Job } from "@/entities/job/model/types";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatDateTime } from "@/shared/lib/utils";

type JobTableProps = {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
};

export function JobTable({ jobs, selectedJobId, onSelectJob }: JobTableProps) {
  if (!jobs.length) {
    return (
      <EmptyState
        title="No jobs found"
        description="Try changing filters or create a new download/transcription job."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-900/90">
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Finished</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;

              return (
                <tr
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className={[
                    "cursor-pointer border-b border-slate-800/80 align-top text-slate-200 last:border-b-0",
                    isSelected ? "bg-cyan-500/10" : "hover:bg-slate-900/70",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">
                      {job.title || job.id}
                    </div>
                    <div className="mt-1 max-w-[420px] truncate text-xs text-slate-400">
                      {job.input_url || job.transcription_media_asset_id || "—"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">{job.id}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{job.type}</td>
                  <td className="px-4 py-3">
                    <Badge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    {job.requested_format || "—"}
                    {job.mp4_mode ? (
                      <div className="mt-1 text-xs text-slate-400">{job.mp4_mode}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatDateTime(job.created_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatDateTime(job.finished_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}