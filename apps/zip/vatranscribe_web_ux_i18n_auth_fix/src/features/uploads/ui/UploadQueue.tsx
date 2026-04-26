import type { UploadQueueItem } from "@/features/uploads/model/types";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type UploadQueueProps = {
  items: UploadQueueItem[];
};

function statusColor(status: UploadQueueItem["status"]): string {
  switch (status) {
    case "uploading":
      return "bg-blue-500";
    case "succeeded":
      return "bg-emerald-500";
    case "failed":
      return "bg-rose-500";
    default:
      return "bg-slate-600";
  }
}

export function UploadQueue({ items }: UploadQueueProps) {
  if (!items.length) {
    return (
      <EmptyState
        title="Upload queue is empty"
        description="Selected files will appear here with progress and upload status."
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 text-lg font-medium text-white">Upload queue</div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  {item.file.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>

              <div className="text-xs capitalize text-slate-300">
                {item.status}
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all ${statusColor(item.status)}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">{item.progress}%</span>

              {item.uploadedMediaAssetId ? (
                <span className="text-emerald-300">
                  media_asset_id: {item.uploadedMediaAssetId}
                </span>
              ) : null}

              {item.errorMessage ? (
                <span className="text-rose-300">{item.errorMessage}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}