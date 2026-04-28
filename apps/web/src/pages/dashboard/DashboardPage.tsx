import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createDownloadJob } from "@/features/downloads/api/downloads";
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
import { toastError, toastSuccess } from "@/shared/ui/toast";
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
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>

        <span
          className={
            pct >= 80
              ? "font-semibold text-amber-600"
              : "text-slate-500 dark:text-slate-400"
          }
        >
          {value}
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-2 rounded-full bg-slate-950 dark:bg-cyan-300"
          style={{ width: `${pct}%` }}
        />
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
  const [isCreatingDownload, setIsCreatingDownload] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  const successfulJobs = jobs.filter((job) => job.status === "succeeded").length;

  const runningJobs = jobs.filter(
    (job) => job.status === "queued" || job.status === "running"
  ).length;

  const quota = billing?.quota;

  const usageAlert = quota
    ? percentage(
        quota.transcription_seconds_used,
        quota.transcription_seconds_limit
      ) >= 80
    : false;

  async function handlePasteLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) {
      return;
    }

    setIsCreatingDownload(true);

    try {
      await createDownloadJob({
        url: url.trim(),
        requested_format: "mp3",
        requested_file_name: `vatranscribe-${Date.now()}.mp3`,
        mp4_mode: "compatible",
        selected_video_format_id: null,
        selected_audio_format_id: null,
      });

      setUrl("");

      toastSuccess(t.downloads.created, t.dashboard.magicFlow);

      navigate("/app/jobs");
    } catch (error: any) {
      toastError(
        t.downloads.failedCreate,
        error?.response?.data?.detail || t.common.requestFailed
      );
    } finally {
      setIsCreatingDownload(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-card overflow-hidden p-6 md:p-8">
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
            {t.dashboard.eyebrow}
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white md:text-6xl">
            {t.dashboard.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {t.dashboard.description}
          </p>

          <form
            onSubmit={handlePasteLink}
            className="mt-7 flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950/60 md:flex-row"
          >
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.dashboard.urlPlaceholder}
              className="min-h-14 flex-1 rounded-2xl border border-transparent bg-white px-5 text-sm outline-none transition focus:border-cyan-300 dark:bg-white/5 dark:text-white"
            />

            <button
              type="submit"
              disabled={isCreatingDownload}
              className="premium-button min-h-14 disabled:opacity-60"
            >
              {isCreatingDownload ? t.common.processing : t.common.pasteLink}
            </button>
          </form>
        </div>

        <div className="premium-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white">
                {t.common.uploadFile}
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                MP3, WAV, MP4, MOV, M4A
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {t.uploads.fastPath}
            </span>
          </div>

          <UploaderPanel redirectToFilesOnUpload />
        </div>
      </section>

      {usageAlert ? (
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">{t.dashboard.almostOut}</div>

            <div className="mt-1 text-sm opacity-80">
              {t.dashboard.magicFlow}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPricingOpen(true)}
            className="rounded-2xl bg-amber-950 px-5 py-3 text-sm font-semibold text-white dark:bg-amber-200 dark:text-amber-950"
          >
            {t.common.upgradeToPro}
          </button>
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
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {label}
            </div>

            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {value}
            </div>
          </div>
        ))}
      </section>

      {quota ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <UsageBar
            label="Storage"
            used={quota.storage_bytes_used}
            limit={quota.storage_bytes_limit}
            value={`${formatBytes(quota.storage_bytes_used)} / ${formatBytes(
              quota.storage_bytes_limit
            )}`}
          />

          <UsageBar
            label="Transcription"
            used={quota.transcription_seconds_used}
            limit={quota.transcription_seconds_limit}
            value={`${formatHoursFromSeconds(
              quota.transcription_seconds_used
            )} / ${formatHoursFromSeconds(quota.transcription_seconds_limit)}`}
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

            <Link
              to="/app/transcriptions"
              className="text-sm font-semibold text-cyan-700 dark:text-cyan-300"
            >
              {t.common.openFile}
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
                  <div className="font-medium text-slate-950 dark:text-white">
                    {t.common.ready}
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {t.common.ready}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {transcript.full_text || transcript.id}
                </p>

                <div className="mt-3 text-xs text-slate-400">
                  {formatDate(transcript.created_at)}
                </div>
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

            <Link
              to="/app/jobs"
              className="text-sm font-semibold text-cyan-700 dark:text-cyan-300"
            >
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
                    <div className="font-medium text-slate-950 dark:text-white">
                      {job.title || job.id}
                    </div>

                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                      {job.type}
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium capitalize text-white dark:bg-white dark:text-slate-950">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}

            {!recentJobs.length ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t.jobs.select}
              </div>
            ) : null}
          </div>
        </div>
      </section>

    </div>
  );
}