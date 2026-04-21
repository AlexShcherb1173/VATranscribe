import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Job } from "@/entities/job/model/types";
import { cancelJob, retryJob } from "@/shared/api/jobs";

type JobActionsProps = {
  job: Job;
};

export function JobActions({ job }: JobActionsProps) {
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: () => retryJob(job.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      await queryClient.invalidateQueries({ queryKey: ["job-logs", job.id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelJob(job.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      await queryClient.invalidateQueries({ queryKey: ["job-logs", job.id] });
    },
  });

  const canRetry = ["failed", "canceled", "succeeded"].includes(job.status);
  const canCancel = ["pending", "queued", "running"].includes(job.status);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={!canRetry || retryMutation.isPending}
        onClick={() => retryMutation.mutate()}
        className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {retryMutation.isPending ? "Retrying..." : "Retry"}
      </button>

      <button
        type="button"
        disabled={!canCancel || cancelMutation.isPending}
        onClick={() => cancelMutation.mutate()}
        className="rounded-xl border border-rose-700 bg-rose-950/30 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-900/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelMutation.isPending ? "Canceling..." : "Cancel"}
      </button>
    </div>
  );
}