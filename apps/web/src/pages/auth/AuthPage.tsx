import { Navigate, useLocation } from "react-router-dom";
import { useState } from "react";

import { LoginForm } from "@/features/auth/ui/LoginForm";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { hasAccessToken } from "@/shared/auth/token";
import { useCurrentUserQuery } from "@/shared/hooks/useCurrentUserQuery";
import { Spinner } from "@/shared/ui/Spinner";

export function AuthPage() {
  const location = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");

  const tokenExists = hasAccessToken();
  const currentUserQuery = useCurrentUserQuery();

  if (tokenExists && currentUserQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-3">
          <Spinner />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  if (tokenExists && currentUserQuery.data) {
    const redirectTo =
      (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)
        ?.from?.pathname || "/";

    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-400">
          VATranscribe
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          {tab === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Access your private media assets, jobs and transcripts.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={[
              "rounded-lg px-3 py-2 text-sm transition",
              tab === "login"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-300 hover:text-white",
            ].join(" ")}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={[
              "rounded-lg px-3 py-2 text-sm transition",
              tab === "register"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-300 hover:text-white",
            ].join(" ")}
          >
            Register
          </button>
        </div>

        <div className="mt-6">
          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}