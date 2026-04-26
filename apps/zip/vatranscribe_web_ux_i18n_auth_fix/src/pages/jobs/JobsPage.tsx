import { useEffect, useMemo, useState } from "react";

import { useJobsQuery } from "@/shared/hooks/useJobsQuery";
import { useJobDetailsQuery } from "@/shared/hooks/useJobDetailsQuery";
import { useJobLogsQuery } from "@/shared/hooks/useJobLogsQuery";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { JobFilters } from "@/widgets/job-table/JobFilters";
import { JobTable } from "@/widgets/job-table/JobTable";
import { JobDetailsCard } from "@/features/jobs/ui/JobDetailsCard";
import { JobLogsPanel } from "@/features/jobs/ui/JobLogsPanel";
import { JobActions } from "@/features/jobs/ui/JobActions";
import { Card } from "@/shared/ui/Card";
import { useI18n } from "@/shared/i18n";

export function JobsPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data, isLoading } = useJobsQuery();

  const jobs = useMemo(() => {
    const items = data ?? [];

    return items.filter((job) => {
      const statusMatch = status ? job.status === status : true;
      const typeMatch = type ? job.type === type : true;
      return statusMatch && typeMatch;
    });
  }, [data, status, type]);

  useEffect(() => {
    if (!jobs.length) {
      setSelectedJobId(null);
      return;
    }

    if (!selectedJobId) {
      setSelectedJobId(jobs[0].id);
      return;
    }

    const exists = jobs.some((job) => job.id === selectedJobId);
    if (!exists) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const jobDetailsQuery = useJobDetailsQuery(selectedJobId);
  const jobLogsQuery = useJobLogsQuery(selectedJobId);

  return (
    <div>
      <PageHeader title={t.jobs.title} description={t.jobs.description} />

      <div className="mb-6">
        <JobFilters
          status={status}
          type={type}
          onStatusChange={setStatus}
          onTypeChange={setType}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-300">
          <Spinner />
          <span>{t.jobs.loading}</span>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <JobTable
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
            />
          </div>

          <div className="grid gap-6">
            {jobDetailsQuery.isLoading ? (
              <Card className="p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <Spinner />
                  <span>{t.jobs.loadingDetails}</span>
                </div>
              </Card>
            ) : jobDetailsQuery.data ? (
              <>
                <JobDetailsCard job={jobDetailsQuery.data} />
                <Card className="p-5">
                  <div className="mb-4 text-sm font-medium text-white">{t.jobs.actions}</div>
                  <JobActions job={jobDetailsQuery.data} />
                </Card>
              </>
            ) : (
              <Card className="p-5 text-sm text-slate-400">{t.jobs.select}</Card>
            )}

            {jobLogsQuery.isLoading ? (
              <Card className="p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <Spinner />
                  <span>{t.jobs.loadingLogs}</span>
                </div>
              </Card>
            ) : (
              <JobLogsPanel logs={jobLogsQuery.data ?? []} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
