import type { MediaFile } from "@/entities/media-file/model/types";
import { StartTranscriptionButton } from "@/features/files/ui/StartTranscriptionButton";
import { formatDateTime } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type FilesTableProps = {
  files: MediaFile[];
  selectedFileId: string | null;
  downloadingFileId?: string | null;
  onSelectFile: (fileId: string) => void;
  onDownloadFile: (file: MediaFile) => void;
};

function formatBytes(value: number): string {
  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function FilesTable({
  files,
  selectedFileId,
  downloadingFileId = null,
  onSelectFile,
  onDownloadFile,
}: FilesTableProps) {
  if (!files.length) {
    return (
      <EmptyState
        title="No media files yet"
        description="Downloaded and uploaded media assets will appear here."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/90 text-left text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Download</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const isSelected = selectedFileId === file.id;
              const isDownloading = downloadingFileId === file.id;
              const canDownload = Boolean(file.download_url);

              return (
                <tr
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={[
                    "cursor-pointer border-b border-slate-800/70 text-slate-200 last:border-b-0",
                    isSelected ? "bg-cyan-500/10" : "hover:bg-slate-900/70",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{file.stored_name}</div>
                    <div className="mt-1 text-xs text-slate-500">{file.id}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{file.kind}</td>
                  <td className="px-4 py-3">{formatBytes(file.size_bytes)}</td>
                  <td className="px-4 py-3">
                    {file.duration_sec ? `${file.duration_sec} sec` : "—"}
                  </td>
                  <td className="px-4 py-3">{formatDateTime(file.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={!canDownload || isDownloading}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDownloadFile(file);
                      }}
                      className={[
                        "rounded-xl px-3 py-2 text-xs font-medium transition",
                        !canDownload || isDownloading
                          ? "cursor-not-allowed bg-slate-800 text-slate-500"
                          : "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
                      ].join(" ")}
                    >
                      {isDownloading ? "Downloading..." : "Download"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div onClick={(event) => event.stopPropagation()}>
                      <StartTranscriptionButton mediaAssetId={file.id} />
                    </div>
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
