import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { destroySession } from "@/shared/auth/session";
import { useCurrentUserQuery } from "@/shared/hooks/useCurrentUserQuery";

export function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useCurrentUserQuery();

  async function handleLogout() {
    destroySession();
    queryClient.clear();
    navigate("/auth", { replace: true });
  }

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

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            {data?.email || "authenticated"}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}