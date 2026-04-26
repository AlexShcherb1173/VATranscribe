import { useCurrentUserQuery } from "@/shared/hooks/useCurrentUserQuery";
import { useProfileQuery } from "@/shared/hooks/useProfileQuery";
import { useQuotaQuery } from "@/shared/hooks/useQuotaQuery";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { QuotaGrid } from "@/features/quota/ui/QuotaGrid";
import { AccountSummaryCard } from "@/features/profile/ui/AccountSummaryCard";
import { PlanCard } from "@/features/profile/ui/PlanCard";
import { ProfileForm } from "@/features/profile/ui/ProfileForm";
import { QuotaWarningBanner } from "@/features/profile/ui/QuotaWarningBanner";

export function ProfilePage() {
  const userQuery = useCurrentUserQuery();
  const profileQuery = useProfileQuery();
  const quotaQuery = useQuotaQuery();

  const isLoading =
    userQuery.isLoading || profileQuery.isLoading || quotaQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-300">
        <Spinner />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!userQuery.data || !profileQuery.data || !quotaQuery.data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Failed to load account data.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage account metadata, review plan capacity and monitor current quota usage."
      />

      <div className="grid gap-6">
        <QuotaWarningBanner quota={quotaQuery.data} />
        <PlanCard quota={quotaQuery.data} />
        <QuotaGrid quota={quotaQuery.data} />
        <AccountSummaryCard
          user={userQuery.data}
          profile={profileQuery.data}
        />
        <ProfileForm profile={profileQuery.data} />
      </div>
    </div>
  );
}