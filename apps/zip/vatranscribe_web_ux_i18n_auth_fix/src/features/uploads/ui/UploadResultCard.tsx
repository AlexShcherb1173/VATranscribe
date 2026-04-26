
import type { UploadQueueItem } from "@/features/uploads/model/types";
import { Card } from "@/shared/ui/Card";

type UploadResultCardProps = {
  items: UploadQueueItem[];
};

export function UploadResultCard({ items }: UploadResultCardProps) {
  const succeeded = items.filter((item) => item.status === "succeeded").length;
  const failed = items.filter((item) => item.status === "failed").length;
  const uploading = items.filter((item) => item.status === "uploading").length;

  return (
    <Card className="p-5">
      <div className="mb-4 text-lg font-medium text-white">Upload summary</div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryItem label="Succeeded" value={String(succeeded)} color="text-emerald-300" />
        <SummaryItem label="Uploading" value={String(uploading)} color="text-blue-300" />
        <SummaryItem label="Failed" value={String(failed)} color="text-rose-300" />
      </div>
    </Card>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
  color: string;
};

function SummaryItem({ label, value, color }: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}