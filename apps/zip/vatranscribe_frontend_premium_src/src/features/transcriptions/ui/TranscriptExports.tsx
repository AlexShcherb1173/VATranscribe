import type { ExportArtifact } from "@/entities/transcript/model/types";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type TranscriptExportsProps = {
  exportsList: ExportArtifact[];
};

function formatBytes(value: number): string {
  if (!value || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getDownloadHref(item: ExportArtifact): string {
  if (item.download_url && item.download_url.trim().length > 0) {
    return `http://localhost:8000${item.download_url}`;
  }

  if (item.path && item.path.trim().length > 0) {
    const normalized = item.path.replace(/\\/g, "/");
    return `http://localhost:8000/${normalized}`;
  }

  return "#";
}

function getButtonLabel(format: string): string {
  const normalized = format.toLowerCase();

  if (normalized === "txt") return "TXT";
  if (normalized === "srt") return "SRT";
  if (normalized === "vtt") return "VTT";
  if (normalized === "json") return "JSON";

  return "Download";
}

export function TranscriptExports({ exportsList }: TranscriptExportsProps) {
  if (!exportsList.length) {
    return (
      <EmptyState
        title="No exports yet"
        description="Export artifacts will appear here after transcription finishes."
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-medium text-white">Export artifacts</div>
          <div className="text-xs text-slate-500">
            Download generated transcript files
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 px-3 py-1 text-xs text-slate-400">
          {exportsList.length} item(s)
        </div>
      </div>

      <div className="space-y-3">
        {exportsList.map((item) => {
          const href = getDownloadHref(item);
          const disabled = href === "#";

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-cyan-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    {item.format}
                  </span>

                  <span className="text-xs text-slate-500">
                    {formatBytes(item.size_bytes)}
                  </span>
                </div>

                <div className="truncate text-sm font-medium text-white">
                  {item.path}
                </div>

                <div className="mt-1 text-xs text-slate-600">ID: {item.id}</div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={disabled}
                  className={[
                    "rounded-xl px-4 py-2 text-xs font-medium transition",
                    disabled
                      ? "pointer-events-none cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
                  ].join(" ")}
                >
                  {getButtonLabel(item.format)}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}