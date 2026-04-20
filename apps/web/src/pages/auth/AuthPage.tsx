export function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-400">
          VATranscribe
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Authentication UI placeholder for the next stage.
        </p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
            placeholder="Email"
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
            placeholder="Password"
          />
          <button className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}