import type { DownloadFormatInfo } from "@/features/downloads/model/types";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type FormatsTableProps = {
  formats: DownloadFormatInfo[];
  selectedVideoFormatId: string;
  selectedAudioFormatId: string;
  requestedFormat: "mp3" | "mp4";
  onSelectVideoFormat: (value: string) => void;
  onSelectAudioFormat: (value: string) => void;
};

function formatFilesize(bytes: number | null): string {
  if (!bytes || bytes <= 0) {
    return "—";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function FormatsTable({
  formats,
  selectedVideoFormatId,
  selectedAudioFormatId,
  requestedFormat,
  onSelectVideoFormat,
  onSelectAudioFormat,
}: FormatsTableProps) {
  if (!formats.length) {
    return (
      <EmptyState
        title="No formats found"
        description="Analyze a URL first to view downloadable media formats."
      />
    );
  }

  const videoFormats = formats.filter((item) => !item.audio_only);
  const audioFormats = formats.filter((item) => item.audio_only || item.video_only);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-medium text-white">Video formats</h3>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Pick</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Resolution</th>
                <th className="px-4 py-3">Ext</th>
                <th className="px-4 py-3">VCodec</th>
                <th className="px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {videoFormats.map((format) => (
                <tr
                  key={`video-${format.format_id}-${format.ext}-${format.resolution}`}
                  className="border-t border-slate-800/70 text-slate-200"
                >
                  <td className="px-4 py-3">
                    <input
                      type="radio"
                      name="video-format"
                      checked={selectedVideoFormatId === (format.format_id || "")}
                      onChange={() => onSelectVideoFormat(format.format_id || "")}
                      disabled={requestedFormat !== "mp4"}
                    />
                  </td>
                  <td className="px-4 py-3">{format.format_id || "—"}</td>
                  <td className="px-4 py-3">{format.resolution || "—"}</td>
                  <td className="px-4 py-3">{format.ext || "—"}</td>
                  <td className="px-4 py-3">{format.vcodec || "—"}</td>
                  <td className="px-4 py-3">{formatFilesize(format.filesize)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-medium text-white">Audio formats</h3>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Pick</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ext</th>
                <th className="px-4 py-3">ACodec</th>
                <th className="px-4 py-3">Bitrate</th>
                <th className="px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {audioFormats.map((format) => (
                <tr
                  key={`audio-${format.format_id}-${format.ext}-${format.acodec}`}
                  className="border-t border-slate-800/70 text-slate-200"
                >
                  <td className="px-4 py-3">
                    <input
                      type="radio"
                      name="audio-format"
                      checked={selectedAudioFormatId === (format.format_id || "")}
                      onChange={() => onSelectAudioFormat(format.format_id || "")}
                    />
                  </td>
                  <td className="px-4 py-3">{format.format_id || "—"}</td>
                  <td className="px-4 py-3">{format.ext || "—"}</td>
                  <td className="px-4 py-3">{format.acodec || "—"}</td>
                  <td className="px-4 py-3">{format.tbr ? `${format.tbr}` : "—"}</td>
                  <td className="px-4 py-3">{formatFilesize(format.filesize)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}