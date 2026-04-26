import type { UserQuota } from "@/entities/quota/model/types";

type PlanCardProps = {
  quota: UserQuota;
};

function formatBytesCompact(value: number): string {
  if (!value) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function PlanCard({ quota }: PlanCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-400">Current plan</div>
          <div className="mt-1 text-xl font-semibold text-white">Starter</div>
        </div>

        <div className="rounded-full border border-cyan-800 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Active
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Storage limit
          </div>
          <div className="mt-2 text-sm font-medium text-white">
            {formatBytesCompact(quota.storage_bytes_limit)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Transcription time
          </div>
          <div className="mt-2 text-sm font-medium text-white">
            {quota.transcription_seconds_limit.toLocaleString()} sec
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Job limit
          </div>
          <div className="mt-2 text-sm font-medium text-white">
            {quota.jobs_count_limit.toLocaleString()} jobs
          </div>
        </div>
      </div>
    </div>
  );
}