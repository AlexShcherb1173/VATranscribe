import { useState } from "react";

import { useBillingOverviewQuery } from "@/shared/hooks/useBillingOverviewQuery";
import { useI18n } from "@/shared/i18n";
import { formatBytes, formatHoursFromSeconds, percentage } from "@/shared/lib/format";
import { PricingModal } from "@/shared/ui/PricingModal";
import { Spinner } from "@/shared/ui/Spinner";

export function BillingPage() {
  const { t } = useI18n();
  const { data: billing, isLoading } = useBillingOverviewQuery();
  const [pricingOpen, setPricingOpen] = useState(false);

  if (isLoading) {
    return <div className="flex items-center gap-3"><Spinner /> Loading billing...</div>;
  }

  if (!billing) {
    return <div className="premium-card p-8">Billing overview is not available.</div>;
  }

  const quota = billing.quota;

  return (
    <div className="space-y-6">
      <section className="premium-card p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">Billing</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {billing.current_plan.name} plan
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Subscription status: {billing.subscription.status}
            </p>
          </div>
          <button type="button" onClick={() => setPricingOpen(true)} className="premium-button">
            {t.common.upgradeToPro}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Storage" value={`${formatBytes(quota.storage_bytes_used)} / ${formatBytes(quota.storage_bytes_limit)}`} pct={percentage(quota.storage_bytes_used, quota.storage_bytes_limit)} />
        <Metric label="Transcription" value={`${formatHoursFromSeconds(quota.transcription_seconds_used)} / ${formatHoursFromSeconds(quota.transcription_seconds_limit)}`} pct={percentage(quota.transcription_seconds_used, quota.transcription_seconds_limit)} />
        <Metric label="Jobs" value={`${quota.jobs_count_used} / ${quota.jobs_count_limit}`} pct={percentage(quota.jobs_count_used, quota.jobs_count_limit)} />
      </section>

      <section className="premium-card p-5 md:p-6">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Usage history</h2>
        <div className="mt-5 grid gap-3">
          {billing.usage_history.map((point) => (
            <div key={point.label} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/[0.03] md:grid-cols-4">
              <div className="font-semibold text-slate-950 dark:text-white">{point.label}</div>
              <div>{formatBytes(point.storage_bytes_used)}</div>
              <div>{formatHoursFromSeconds(point.transcription_seconds_used)}</div>
              <div>{point.jobs_count_used} jobs</div>
            </div>
          ))}
        </div>
      </section>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
}

function Metric({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="premium-card p-5">
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{value}</div>
      <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
