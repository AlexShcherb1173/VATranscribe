import { FormEvent, useState } from "react";

type AnalyzeUrlFormProps = {
  isLoading: boolean;
  initialUrl?: string;
  onAnalyze: (url: string) => void;
};

export function AnalyzeUrlForm({
  isLoading,
  initialUrl = "",
  onAnalyze,
}: AnalyzeUrlFormProps) {
  const [url, setUrl] = useState(initialUrl);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }

    onAnalyze(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
    >
      <div className="mb-3">
        <h2 className="text-lg font-medium text-white">Analyze URL</h2>
        <p className="mt-1 text-sm text-slate-400">
          Insert a supported media URL to inspect available downloadable formats.
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </form>
  );
}