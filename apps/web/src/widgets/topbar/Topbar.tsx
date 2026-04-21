import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { destroySession } from "@/shared/auth/session";
import { useCurrentUserQuery } from "@/shared/hooks/useCurrentUserQuery";
import { useQuotaQuery } from "@/shared/hooks/useQuotaQuery";
import { toastInfo } from "@/shared/ui/toast";

function formatBytesCompact(value: number): string {
  if (!value) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUserQuery();
  const { data: quota } = useQuotaQuery();

  async function handleLogout() {
    destroySession();
    queryClient.clear();
    toastInfo("Session closed", "You have been signed out.");
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

        <div className="flex flex-wrap items-center justify-end gap-3">
          {quota ? (
            <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
              Storage: {formatBytesCompact(quota.storage_bytes_used)} /{" "}
              {formatBytesCompact(quota.storage_bytes_limit)}
            </div>
          ) : null}

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            {user?.email || "authenticated"}
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