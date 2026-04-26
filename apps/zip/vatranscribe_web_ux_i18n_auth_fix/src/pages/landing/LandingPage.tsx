import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { PricingModal } from "@/shared/ui/PricingModal";
import { useI18n } from "@/shared/i18n";
import { hasAccessToken } from "@/shared/auth/token";

function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  return (
    <div className="flex rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold shadow-sm dark:border-white/10 dark:bg-white/5">
      {(["en", "ru"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={[
            "rounded-full px-3 py-1.5 transition",
            language === item
              ? "bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
          ].join(" ")}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [pricingOpen, setPricingOpen] = useState(false);

  function startApp(event?: FormEvent) {
    event?.preventDefault();
    if (hasAccessToken()) {
      navigate("/app", { state: url ? { initialUrl: url } : undefined });
      return;
    }
    navigate("/auth");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg dark:bg-cyan-300 dark:text-slate-950">
            VA
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">VATranscribe</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Creator workspace</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link to="/auth" className="secondary-button hidden sm:inline-flex">
            {t.landing.login}
          </Link>
          <button type="button" onClick={() => setPricingOpen(true)} className="premium-button">
            {t.common.upgrade}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
              {t.landing.badge}
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-white md:text-7xl">
              {t.landing.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {t.landing.subhead}
            </p>

            <form onSubmit={startApp} className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-cyan-950/20">
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder={t.landing.urlPlaceholder}
                  className="min-h-14 flex-1 rounded-2xl border border-transparent bg-slate-50 px-5 text-sm outline-none transition focus:border-cyan-300 dark:bg-slate-950/60 dark:text-white"
                />
                <button type="submit" className="premium-button min-h-14">
                  {t.landing.primary}
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>{t.landing.proof}</span>
              <button type="button" onClick={() => setPricingOpen(true)} className="font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300">
                {t.landing.secondary}
              </button>
            </div>
          </div>

          <div className="premium-card p-4 md:p-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-300"{t.landing.magicFlow}</div>
                  <div className="mt-2 text-xl font-semibold"{t.landing.contentPack}</div>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Ready</div>
              </div>
              <div className="mt-6 space-y-3">
                {t.landing.checks.map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span className="text-sm text-slate-200">{item}</span>
                    <span className="text-cyan-300">✓</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                [t.landing.creator, t.landing.creatorText],
                [t.landing.agency, t.landing.agencyText],
                [t.landing.education, t.landing.educationText],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
}
