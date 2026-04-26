import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "@/features/auth/api/auth";
import {
  consumeRedirectAfterLogin,
  saveRedirectAfterLogin,
} from "@/shared/auth/navigation";
import { saveSession } from "@/shared/auth/session";
import { extractErrorMessage } from "@/shared/lib/auth-errors";
import { toastError, toastSuccess } from "@/shared/ui/toast";

type LocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      saveSession(data.access_token);
      setErrorMessage(null);

      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["quota", "me"] });

      const state = location.state as LocationState | null;
      const fromPath = state?.from?.pathname
        ? `${state.from.pathname || ""}${state.from.search || ""}${state.from.hash || ""}`
        : null;

      const storedRedirect = consumeRedirectAfterLogin();
      const redirectTo = storedRedirect || fromPath || "/";

      toastSuccess("Signed in", "Your session is active.");
      navigate(redirectTo, { replace: true });
    },
    onError: (error: any) => {
      const message = extractErrorMessage(error);
      setErrorMessage(message);
      toastError("Login failed", message);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      const message = "Email is required.";
      setErrorMessage(message);
      toastError("Login failed", message);
      return;
    }

    if (!password.trim()) {
      const message = "Password is required.";
      setErrorMessage(message);
      toastError("Login failed", message);
      return;
    }

    saveRedirectAfterLogin(
      window.location.pathname + window.location.search + window.location.hash,
    );

    mutation.mutate({
      email: email.trim(),
      password,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
          placeholder="alex@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-slate-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
          placeholder="Strong123!"
          autoComplete="current-password"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}