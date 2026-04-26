import type { CurrentUser } from "@/features/auth/model/types";
import type { UserProfile } from "@/entities/profile/model/types";

type AccountSummaryCardProps = {
  user: CurrentUser;
  profile: UserProfile;
};

export function AccountSummaryCard({
  user,
  profile,
}: AccountSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="text-sm text-slate-400">Account summary</div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Email
          </div>
          <div className="mt-1 text-sm text-white">{user.email}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Full name
          </div>
          <div className="mt-1 text-sm text-white">
            {profile.full_name || "—"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Company
          </div>
          <div className="mt-1 text-sm text-white">
            {profile.company_name || "—"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Timezone
          </div>
          <div className="mt-1 text-sm text-white">
            {profile.timezone || "—"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Locale
          </div>
          <div className="mt-1 text-sm text-white">
            {profile.locale || "—"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Role
          </div>
          <div className="mt-1 text-sm text-white">
            {user.is_superuser ? "Administrator" : "User"}
          </div>
        </div>
      </div>
    </div>
  );
}