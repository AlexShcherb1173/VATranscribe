import { useI18n } from "@/shared/i18n";
import { formatDate } from "@/shared/lib/format";
import { Card } from "@/shared/ui/Card";

type JobLog = {
  id: string;
  level?: string | null;
  message?: string | null;
  created_at?: string | null;
};

type JobLogsPanelProps = {
  logs: JobLog[];
};

function translateLogMessage(message: string | null | undefined, t: ReturnType<typeof useI18n>["t"]) {
  const raw = message || "—";

  if (raw.startsWith("Download job created")) {
    return raw.replace("Download job created", t.jobs.logDownloadCreated);
  }

  if (raw.startsWith("Requested format:")) {
    return raw.replace("Requested format:", `${t.jobs.logRequestedFormat}:`);
  }

  if (raw.startsWith("Download job enqueued")) {
    return raw.replace("Download job enqueued", t.jobs.logDownloadEnqueued);
  }

  return raw;
}

export function JobLogsPanel({ logs }: JobLogsPanelProps) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="text-sm font-semibold text-white">
          Логи
        </div>
      </div>

      <div className="space-y-3 p-5">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-cyan-300">
                {log.level || "INFO"}
              </span>

              <span className="text-slate-500">
                {log.created_at ? formatDate(log.created_at) : "—"}
              </span>
            </div>

            <div className="text-sm text-slate-200">
              {translateLogMessage(log.message, t)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
