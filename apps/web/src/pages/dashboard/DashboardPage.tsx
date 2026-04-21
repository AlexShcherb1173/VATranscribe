import { useMemo } from "react";

import { useJobsQuery } from "@/shared/hooks/useJobsQuery";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { JobsStatsGrid } from "@/features/jobs/ui/JobsStatsGrid";
import { Badge } from "@/shared/ui/Badge";
import { formatDateTime } from "@/shared/lib/utils";

export function DashboardPage() {
  const { data, isLoading } = useJobsQuery();

  const jobs = data ?? [];
  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Operational overview of downloads, transcription execution and job health."
      />

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-300">
          <Spinner />
          <span>Loading dashboard data...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          <JobsStatsGrid jobs={jobs} />

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Recent jobs</h2>
              <div className="text-xs text-slate-500">Live polling enabled</div>
            </div>

            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{job.title || job.id}</div>
                      <div className="mt-1 text-xs text-slate-500">{job.id}</div>
                    </div>
                    <Badge status={job.status} />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">Type</div>
                      <div className="mt-1 text-sm text-slate-200">{job.type}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">Created</div>
                      <div className="mt-1 text-sm text-slate-200">
                        {formatDateTime(job.created_at)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">Output</div>
                      <div className="mt-1 break-all text-sm text-slate-200">
                        {job.output_media_asset_id || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!recentJobs.length ? (
                <div className="text-sm text-slate-400">No jobs yet.</div>
              ) : null}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}