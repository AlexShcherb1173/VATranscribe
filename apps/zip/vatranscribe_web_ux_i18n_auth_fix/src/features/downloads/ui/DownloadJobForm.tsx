import { FormEvent, useEffect, useState } from "react";

import { useI18n } from "@/shared/i18n";

type DownloadJobFormProps = {
  url: string;
  title: string | null;
  isSubmitting: boolean;
  selectedVideoFormatId: string;
  selectedAudioFormatId: string;
  onSubmit: (payload: {
    requestedFormat: "mp3" | "mp4";
    requestedFileName: string;
    mp4Mode: "fast" | "compatible";
    selectedVideoFormatId: string | null;
    selectedAudioFormatId: string | null;
  }) => void;
};

function slugifyFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_\-\s]/gi, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

export function DownloadJobForm({
  url,
  title,
  isSubmitting,
  selectedVideoFormatId,
  selectedAudioFormatId,
  onSubmit,
}: DownloadJobFormProps) {
  const { t } = useI18n();
  const [requestedFormat, setRequestedFormat] = useState<"mp3" | "mp4">("mp3");
  const [mp4Mode, setMp4Mode] = useState<"fast" | "compatible">("compatible");
  const [requestedFileName, setRequestedFileName] = useState("");

  useEffect(() => {
    if (!title) return;

    setRequestedFileName((prev) => {
      if (prev.trim()) return prev;
      return slugifyFileName(title) || "media_file";
    });
  }, [title]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = slugifyFileName(requestedFileName) || "media_file";

    onSubmit({
      requestedFormat,
      requestedFileName: normalizedName,
      mp4Mode,
      selectedVideoFormatId: selectedVideoFormatId || null,
      selectedAudioFormatId: selectedAudioFormatId || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-white">{t.downloads.createTitle}</h2>
        <p className="mt-1 text-sm text-slate-400">{t.downloads.createText}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">{t.downloads.sourceUrl}</span>
          <input
            type="text"
            value={url}
            disabled
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-400"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">{t.downloads.outputFilename}</span>
          <input
            type="text"
            value={requestedFileName}
            onChange={(event) => setRequestedFileName(event.target.value)}
            placeholder="lesson_01"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">{t.downloads.requestedFormat}</span>
          <select
            value={requestedFormat}
            onChange={(event) => setRequestedFormat(event.target.value as "mp3" | "mp4")}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            <option value="mp3">MP3</option>
            <option value="mp4">MP4</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">{t.downloads.mp4Mode}</span>
          <select
            value={mp4Mode}
            onChange={(event) => setMp4Mode(event.target.value as "fast" | "compatible")}
            disabled={requestedFormat !== "mp4"}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="compatible">compatible</option>
            <option value="fast">fast</option>
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
        <div>
          <span className="text-slate-300">{t.downloads.selectedAudio}:</span>{" "}
          {selectedAudioFormatId || t.downloads.auto}
        </div>
        <div className="mt-1">
          <span className="text-slate-300">{t.downloads.selectedVideo}:</span>{" "}
          {requestedFormat === "mp4" ? selectedVideoFormatId || t.downloads.auto : t.downloads.notRequired}
        </div>
      </div>

      <div className="mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.downloads.creating : t.downloads.createJob}
        </button>
      </div>
    </form>
  );
}
