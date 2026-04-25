import { Navigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

import { LoginForm } from "@/features/auth/ui/LoginForm";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { hasAccessToken } from "@/shared/auth/token";
import { useCurrentUserQuery } from "@/shared/hooks/useCurrentUserQuery";
import { useI18n } from "@/shared/i18n";
import { Spinner } from "@/shared/ui/Spinner";

type LocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

const copy = {
  en: {
    checking: "Checking session...",
    badge: "VATranscribe",
    heroTitle: "One upload. Transcript, subtitles and content pack.",
    heroText:
      "Built for creators, freelancers and teams who need the result, not another technical tool.",
    bullets: [
      "Paste URL → transcript",
      "Upload file → subtitles",
      "Transcript → summary + posts",
    ],
    signIn: "Sign in",
    createAccount: "Create account",
    login: "Login",
    register: "Register",
  },
  ru: {
    checking: "Проверяем сессию...",
    badge: "VATranscribe",
    heroTitle: "Одна загрузка. Транскрипт, субтитры и контент-пакет.",
    heroText:
      "Для creators, фрилансеров и команд, которым нужен готовый результат, а не ещё один технический инструмент.",
    bullets: [
      "Вставь ссылку → получи транскрипт",
      "Загрузи файл → получи субтитры",
      "Транскрипт → summary + посты",
    ],
    signIn: "Вход",
    createAccount: "Создать аккаунт",
    login: "Войти",
    register: "Регистрация",
  },
};

export function AuthPage() {
  const location = useLocation();
  const { language, setLanguage } = useI18n();
  const [tab, setTab] = useState<"login" | "register">("login");

  const t = useMemo(() => copy[language], [language]);

  const tokenExists = hasAccessToken();
  const currentUserQuery = useCurrentUserQuery();

  if (tokenExists && currentUserQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-3">
          <Spinner />
          <span>{t.checking}</span>
        </div>
      </div>
    );
  }

  if (tokenExists && currentUserQuery.data) {
    const state = location.state as LocationState | null;
    const redirectTo = state?.from?.pathname || "/app";
    return <Navigate to={redirectTo === "/" ? "/app" : redirectTo} replace />;
  }

  return (
    <div className="grid min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.20),transparent_28rem),radial-gradient(circle_at_70%_40%,rgba(99,102,241,0.16),transparent_28rem)]" />

        <div className="relative flex h-full flex-col justify-between rounded-[2rem] border border-slate-200 bg-white/70 p-10 shadow-2xl shadow-slate-950/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
          <div>
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
              {t.badge}
            </div>

            <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-[-0.06em]">
              {t.heroTitle}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
              {t.heroText}
            </p>
          </div>

          <div className="grid gap-3">
            {t.bullets.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium dark:border-white/10 dark:bg-white/[0.05]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
                VATranscribe
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {tab === "login" ? t.signIn : t.createAccount}
              </h1>
            </div>

            <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
              {(["en", "ru"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={[
                    "rounded-full px-2.5 py-1 transition",
                    language === item
                      ? "bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950"
                      : "text-slate-500",
                  ].join(" ")}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={[
                "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                tab === "login"
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-500 dark:text-slate-400",
              ].join(" ")}
            >
              {t.login}
            </button>

            <button
              type="button"
              onClick={() => setTab("register")}
              className={[
                "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                tab === "register"
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-500 dark:text-slate-400",
              ].join(" ")}
            >
              {t.register}
            </button>
          </div>

          <div className="mt-6">
            {tab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </section>
    </div>
  );
}