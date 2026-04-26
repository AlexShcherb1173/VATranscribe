import type { UserQuota } from "@/entities/quota/model/types";
import { QuotaCard } from "@/features/quota/ui/QuotaCard";

type QuotaGridProps = {
  quota: UserQuota;
};

export function QuotaGrid({ quota }: QuotaGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <QuotaCard
        title="Storage"
        used={quota.storage_bytes_used}
        limit={quota.storage_bytes_limit}
        unitLabel="bytes"
      />

      <QuotaCard
        title="Transcription seconds"
        used={quota.transcription_seconds_used}
        limit={quota.transcription_seconds_limit}
        unitLabel="sec"
      />

      <QuotaCard
        title="Jobs"
        used={quota.jobs_count_used}
        limit={quota.jobs_count_limit}
        unitLabel="jobs"
      />
    </div>
  );
}