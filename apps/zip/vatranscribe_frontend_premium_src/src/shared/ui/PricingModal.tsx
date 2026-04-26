import { useUpgradePlanMutation } from "@/shared/hooks/useUpgradePlanMutation";
import { useI18n } from "@/shared/i18n";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
};

const plans = [
  { code: "free", price: "$0", highlighted: false },
  { code: "pro", price: "$15", highlighted: true },
  { code: "business", price: "$49", highlighted: false },
] as const;

export function PricingModal({ open, onClose }: PricingModalProps) {
  const { t } = useI18n();
  const upgradeMutation = useUpgradePlanMutation();

  if (!open) return null;

  const featuresByCode = {
    free: t.pricing.freeFeatures,
    pro: t.pricing.proFeatures,
    business: t.pricing.businessFeatures,
  };

  const descByCode = {
    free: t.pricing.freeDesc,
    pro: t.pricing.proDesc,
    business: t.pricing.businessDesc,
  };

  async function handleSelect(planCode: string) {
    await upgradeMutation.mutateAsync(planCode);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
      <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">
              VATranscribe Pro
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {t.pricing.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {t.pricing.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t.common.close}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.code}
              className={[
                "relative rounded-[1.5rem] border p-5 transition",
                plan.highlighted
                  ? "border-cyan-400 bg-cyan-50 shadow-xl shadow-cyan-500/10 dark:bg-cyan-500/10"
                  : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]",
              ].join(" ")}
            >
              {plan.highlighted ? (
                <div className="absolute right-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white dark:bg-cyan-300 dark:text-slate-950">
                  Best value
                </div>
              ) : null}
              <h3 className="text-lg font-semibold capitalize text-slate-950 dark:text-white">
                {plan.code}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {descByCode[plan.code]}
              </p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-semibold text-slate-950 dark:text-white">
                  {plan.price}
                </span>
                <span className="pb-1 text-sm text-slate-500">/{t.common.monthly}</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                {featuresByCode[plan.code].map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-0.5 text-cyan-600 dark:text-cyan-300">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSelect(plan.code)}
                disabled={upgradeMutation.isPending}
                className={[
                  "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60",
                  plan.highlighted
                    ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                    : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                ].join(" ")}
              >
                {plan.code === "free" ? t.common.startFree : t.common.upgrade}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
