import { useMemo, useState } from "react";

import { useJobsQuery } from "@/shared/hooks/useJobsQuery";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { JobFilters } from "@/widgets/job-table/JobFilters";
import { JobTable } from "@/widgets/job-table/JobTable";

export function JobsPage() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const { data, isLoading } = useJobsQuery();

  const jobs = useMemo(() => {
    const items = data ?? [];

    return items.filter((job) => {
      const statusMatch = status ? job.status === status : true;
      const typeMatch = type ? job.type === type : true;
      return statusMatch && typeMatch;
    });
  }, [data, status, type]);

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Track asynchronous media download and transcription tasks with live polling."
      />

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
          <span>Loading jobs...</span>
        </div>
      ) : (
        <JobTable jobs={jobs} />
      )}
    </div>
  );
}