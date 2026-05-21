import { ChangeEvent, useEffect, useState } from "react";

import {
  deleteYoutubeCookies,
  getYoutubeCookiesStatus,
  uploadYoutubeCookies,
  type YoutubeCookiesStatus,
} from "@/shared/api/settings";
import { useI18n } from "@/shared/i18n";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { toastError, toastSuccess } from "@/shared/ui/toast";

export function SettingsPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<YoutubeCookiesStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadStatus() {
    const data = await getYoutubeCookiesStatus();
    setStatus(data);
  }

  useEffect(() => {
    loadStatus().catch(() => {
      setStatus(null);
    });
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await uploadYoutubeCookies(file);
      setStatus(data);
      toastSuccess("Cookies YouTube", "Файл cookies успешно загружен.");
    } catch (error: any) {
      toastError(
        "Cookies YouTube",
        error?.response?.data?.detail || "Не удалось загрузить cookies.txt",
      );
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  }

  async function handleDelete() {
    setIsLoading(true);

    try {
      const data = await deleteYoutubeCookies();
      setStatus(data);
      toastSuccess("Cookies YouTube", "Файл cookies удалён.");
    } catch (error: any) {
      toastError(
        "Cookies YouTube",
        error?.response?.data?.detail || "Не удалось удалить cookies.txt",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title={t.settings.title} description={t.settings.description} />

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="text-lg font-medium text-white">
            YouTube cookies
          </div>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Если YouTube требует подтверждение “Sign in to confirm you’re not a bot”,
            загрузи сюда cookies.txt, экспортированный из браузера.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
            <div>
              Статус:{" "}
              <span className={status?.exists ? "text-emerald-300" : "text-rose-300"}>
                {status?.exists ? "cookies.txt загружен" : "cookies.txt не загружен"}
              </span>
            </div>

            <div className="mt-2">
              Путь:{" "}
              <span className="text-slate-400">
                {status?.path || "—"}
              </span>
            </div>

            <div className="mt-2">
              Размер:{" "}
              <span className="text-slate-400">
                {status?.size_bytes ? `${status.size_bytes} bytes` : "—"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              <input
                type="file"
                accept=".txt"
                disabled={isLoading}
                onChange={handleUpload}
                className="hidden"
              />
              Загрузить youtube.txt
            </label>

            <button
              type="button"
              disabled={isLoading || !status?.exists}
              onClick={handleDelete}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Удалить cookies
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}