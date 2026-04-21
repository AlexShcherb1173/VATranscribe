import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { registerUser } from "@/features/auth/api/auth";
import { extractErrorMessage } from "@/shared/lib/auth-errors";

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one digit.";
  }

  if (/\s/.test(password)) {
    return "Password must not contain spaces.";
  }

  return null;
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setSuccessMessage("User created successfully. You can sign in now.");
      setErrorMessage(null);
      setPassword("");
    },
    onError: (error: any) => {
      setSuccessMessage(null);
      setErrorMessage(extractErrorMessage(error));
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

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
          autoComplete="new-password"
        />
        <div className="mt-1 text-xs text-slate-500">
          At least 8 chars, one lowercase, one uppercase, one digit, no spaces.
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-xl border border-cyan-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}