import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { savePendingStartUrl } from "@/shared/lib/pendingStartUrl";
import { useI18n } from "@/shared/i18n";

export function LandingPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  function handleStart(event?: FormEvent) {
    event?.preventDefault();

    savePendingStartUrl(url);
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 font-bold text-slate-950">
            VA
          </div>

          <div>
            <div className="font-semibold">VATranscribe</div>
            <div className="text-xs text-slate-400">{t.common.creatorOs}</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:border-cyan-300/60"
          >
            {t.auth.login}
          </Link>

          <Link to="/pricing" className="premium-button">
            {t.common.goToSubscriptions}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_570px] lg:items-center">
        <section>
          <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            {t.landing.badge}
          </div>

          <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            {t.landing.headline}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            {t.landing.subhead}
          </p>

          <form
            onSubmit={handleStart}
            className="mt-10 flex max-w-2xl gap-2 rounded-[1.75rem] border border-white/10 bg-white/5 p-2"
          >
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.landing.urlPlaceholder}
              className="min-w-0 flex-1 rounded-2xl bg-slate-950/80 px-5 py-4 text-sm text-white outline-none placeholder:text-slate-400"
            />

            <button type="submit" className="premium-button shrink-0">
              {t.landing.primary}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-400">
            <span>{t.result.transcript}</span>
            <span>·</span>
            <span>{t.result.subtitles}</span>
            <span>·</span>
            <span>{t.result.contentIdeas}</span>
            <span>·</span>
            <span>{t.result.export}</span>
            <span>·</span>
            <Link to="/pricing" className="font-semibold text-cyan-300 hover:text-cyan-200">
              {t.nav.billing}
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/15 bg-white/[0.04] p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                {t.landing.magicFlow}
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Ready
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              {t.landing.contentPack}
            </h2>

            <div className="mt-7 space-y-3">
              {t.landing.checks.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm"
                >
                  <span>{item}</span>
                  <span className="text-cyan-300">✓</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InfoCard title={t.landing.creator} text={t.landing.creatorText} />
            <InfoCard title={t.landing.agency} text={t.landing.agencyText} />
            <InfoCard title={t.landing.education} text={t.landing.educationText} />
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}