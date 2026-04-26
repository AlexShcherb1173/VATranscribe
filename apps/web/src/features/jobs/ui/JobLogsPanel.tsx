import type { JobLog } from "@/entities/job/model/types";
import { formatDateTime } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type JobLogsPanelProps = {
  logs: JobLog[];
};

function levelStyle(level: string): string {
  switch (level.toUpperCase()) {
    case "ERROR":
      return "text-rose-300";
    case "WARNING":
      return "text-amber-300";
    default:
      return "text-cyan-300";
  }
}

export function JobLogsPanel({ logs }: JobLogsPanelProps) {
  if (!logs.length) {
    return (
      <EmptyState
        title="No logs yet"
        description="Logs will appear when the job starts producing execution events."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-medium text-white">Live logs</h3>
      </div>
      <div className="max-h-[480px] overflow-auto p-4">
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className={levelStyle(log.level)}>{log.level}</span>
                <span className="text-slate-500">{formatDateTime(log.created_at)}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-200">
                {log.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}