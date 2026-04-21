import { useBillingOverviewQuery } from "@/shared/hooks/useBillingOverviewQuery";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { BillingSummaryCard } from "@/features/billing/ui/BillingSummaryCard";
import { UsageHistoryWidget } from "@/features/billing/ui/UsageHistoryWidget";
import { UpgradeBanner } from "@/features/billing/ui/UpgradeBanner";

export function BillingPage() {
  const { data, isLoading } = useBillingOverviewQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-300">
        <Spinner />
        <span>Loading billing...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Failed to load billing data.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Review subscription state, plan allowances and recent account usage."
      />

      <div className="grid gap-6">
        <UpgradeBanner />
        <BillingSummaryCard overview={data} />
        <UsageHistoryWidget items={data.usage_history} />
      </div>
    </div>
  );
}