import { useBillingOverviewQuery } from "@/shared/hooks/useBillingOverviewQuery";
import { useUpgradePlanMutation } from "@/shared/hooks/useUpgradePlanMutation";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { PlanSelectorCard } from "@/features/billing/ui/PlanSelectorCard";
import { UpgradeBanner } from "@/features/billing/ui/UpgradeBanner";

export function UpgradePage() {
  const { data, isLoading } = useBillingOverviewQuery();
  const upgradeMutation = useUpgradePlanMutation();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-300">
        <Spinner />
        <span>Loading upgrade options...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Failed to load plan options.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Upgrade plan"
        description="Choose a subscription level that matches your operational workload."
      />

      <div className="grid gap-6">
        <UpgradeBanner
          title="Scale your workspace"
          description="Move to a larger plan for more storage, more jobs and longer transcription capacity."
        />

        <PlanSelectorCard
          overview={data}
          isPending={upgradeMutation.isPending}
          onSelectPlan={(planCode) => upgradeMutation.mutate(planCode)}
        />
      </div>
    </div>
  );
}