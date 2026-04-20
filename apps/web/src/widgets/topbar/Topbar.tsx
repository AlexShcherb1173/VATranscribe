export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur md:px-6 xl:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white">
            Media download & transcription operations
          </div>
          <div className="text-xs text-slate-400">
            FastAPI · Celery · Redis · PostgreSQL · FFmpeg · Faster-Whisper
          </div>
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
          development
        </div>
      </div>
    </header>
  );
}