import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useBillingOverviewQuery } from "@/shared/hooks/useBillingOverviewQuery";
import { useJobsQuery } from "@/shared/hooks/useJobsQuery";
import { useMediaFilesQuery } from "@/shared/hooks/useMediaFilesQuery";
import { useTranscriptsQuery } from "@/shared/hooks/useTranscriptsQuery";
import { useI18n } from "@/shared/i18n";
import {
  formatBytes,
  formatDate,
  formatHoursFromSeconds,
  percentage,
} from "@/shared/lib/format";
import {
  clearPendingStartUrl,
  getPendingStartUrl,
  savePendingStartUrl,
} from "@/shared/lib/pendingStartUrl";
import { UploaderPanel } from "@/widgets/uploader/UploaderPanel";

function UsageBar({
  label,
  used,
  limit,
  value,
}: {
  label: string;
  used: number;
  limit: number;
  value: string;
}) {
  const pct = percentage(used, limit);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className={pct >= 80 ? "font-semibold text-amber-600" : "text-slate-500 dark:text-slate-400"}>
          {value}
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-2 rounded-full bg-slate-950 dark:bg-cyan-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const { data: billing } = useBillingOverviewQuery();
  const { data: jobs = [] } = useJobsQuery();
  const { data: mediaFiles = [] } = useMediaFilesQuery();
  const { data: transcripts = [] } = useTranscriptsQuery();

  const [url, setUrl] = useState("");

  useEffect(() => {
    const pendingUrl = getPendingStartUrl();

    if (pendingUrl) {
      setUrl(pendingUrl);
      clearPendingStartUrl();
    }
  }, []);

  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);
  const successfulJobs = jobs.filter((job) => job.status === "succeeded").length;
  const runningJobs = jobs.filter((job) => job.status === "queued" || job.status === "running").length;

  const quota = billing?.quota;

  const usageAlert = quota
    ? percentage(quota.transcription_seconds_used, quota.transcription_seconds_limit) >= 80
    : false;

  function handlePasteLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      return;
    }

    savePendingStartUrl(cleanUrl);
    navigate("/app/downloads");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-card p-4 md:p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white md:text-4xl">
            {t.dashboard.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t.dashboard.description}
          </p>

          <form
            onSubmit={handlePasteLink}
            className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950/60 md:flex-row"
          >
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.dashboard.urlPlaceholder}
              className="min-h-11 flex-1 rounded-xl border border-transparent bg-white px-4 text-sm outline-none transition focus:border-cyan-300 dark:bg-white/5 dark:text-white"
            />

            <button type="submit" className="premium-button min-h-11">
              {t.common.pasteLink}
            </button>
          </form>
        </div>

        <div className="premium-card p-4 md:p-5">
          <div className="mb-3">
            <div className="text-sm font-semibold text-slate-950 dark:text-white">
              {t.common.uploadFile}
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              MP3, WAV, MP4, MOV, M4A
            </p>
          </div>

          <UploaderPanel compact redirectToFilesOnSelect />
        </div>
      </section>

      {usageAlert ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
          <div className="font-semibold">{t.dashboard.almostOut}</div>
          <div className="mt-1 text-sm opacity-80">{t.dashboard.magicFlow}</div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          [t.files.title, mediaFiles.length.toString()],
          [t.jobs.title, jobs.length.toString()],
          [t.uploads.succeeded, successfulJobs.toString()],
          [t.common.processing, runningJobs.toString()],
        ].map(([label, value]) => (
          <div key={label} className="premium-card p-5">
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {value}
            </div>
          </div>
        ))}
      </section>

      {quota ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <UsageBar
            label={t.profile.storage}
            used={quota.storage_bytes_used}
            limit={quota.storage_bytes_limit}
            value={`${formatBytes(quota.storage_bytes_used)} / ${formatBytes(quota.storage_bytes_limit)}`}
          />

          <UsageBar
            label={t.profile.transcriptionTime}
            used={quota.transcription_seconds_used}
            limit={quota.transcription_seconds_limit}
            value={`${formatHoursFromSeconds(quota.transcription_seconds_used)} / ${formatHoursFromSeconds(
              quota.transcription_seconds_limit,
            )}`}
          />

          <UsageBar
            label={t.jobs.title}
            used={quota.jobs_count_used}
            limit={quota.jobs_count_limit}
            value={`${quota.jobs_count_used} / ${quota.jobs_count_limit}`}
          />
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="premium-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              {t.dashboard.recentResults}
            </h2>

            <Link to="/app/transcriptions" className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
              {t.common.viewAll}
            </Link>
          </div>

          <div className="space-y-3">
            {transcripts.slice(0, 3).map((transcript) => (
              <Link
                key={transcript.id}
                to={`/app/results/${transcript.id}`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-950 dark:text-white">{t.common.ready}</div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {t.common.ready}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {transcript.full_text || transcript.id}
                </p>

                <div className="mt-3 text-xs text-slate-400">{formatDate(transcript.created_at)}</div>
              </Link>
            ))}

            {!transcripts.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                {t.dashboard.empty}
              </div>
            ) : null}
          </div>
        </div>

        <div className="premium-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              {t.jobs.title}
            </h2>

            <Link to="/app/jobs" className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
              {t.jobs.actions}
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-950 dark:text-white">{job.title || job.id}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{job.type}</div>
                  </div>

                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium capitalize text-white dark:bg-white dark:text-slate-950">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}

            {!recentJobs.length ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">{t.jobs.select}</div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}