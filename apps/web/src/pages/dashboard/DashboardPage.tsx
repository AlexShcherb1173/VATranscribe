import { useJobsQuery } from "@/shared/hooks/useJobsQuery";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";

export function DashboardPage() {
  const { data, isLoading } = useJobsQuery();

  const total = data?.length ?? 0;
  const running = data?.filter((job) => job.status === "running").length ?? 0;
  const failed = data?.filter((job) => job.status === "failed").length ?? 0;
  const succeeded = data?.filter((job) => job.status === "succeeded").length ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Operational overview of media downloads, transcription jobs and pipeline health."
      />

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-300">
          <Spinner />
          <span>Loading dashboard data...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Jobs" value={String(total)} />
          <MetricCard title="Running" value={String(running)} />
          <MetricCard title="Succeeded" value={String(succeeded)} />
          <MetricCard title="Failed" value={String(failed)} />
        </div>
      )}
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
};

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    </Card>
  );
}