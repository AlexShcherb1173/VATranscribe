import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import {
  analyzeDownloadUrl,
  createDownloadJob,
} from "@/features/downloads/api/downloads";
import type {
  DownloadAnalyzeResponse,
  DownloadFormatInfo,
  DownloadMode,
} from "@/features/downloads/model/types";
import { AnalyzeUrlForm } from "@/features/downloads/ui/AnalyzeUrlForm";
import { DownloadJobForm } from "@/features/downloads/ui/DownloadJobForm";
import { FormatsTable } from "@/features/downloads/ui/FormatsTable";
import { useI18n } from "@/shared/i18n";
import { extractErrorMessage } from "@/shared/lib/auth-errors";
import {
  clearPendingStartUrl,
  getPendingStartUrl,
} from "@/shared/lib/pendingStartUrl";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";

export function DownloadsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [analysis, setAnalysis] = useState<DownloadAnalyzeResponse | null>(null);
  const [analysisUrl, setAnalysisUrl] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState("");
  const [selectedVideoFormatId, setSelectedVideoFormatId] = useState("");
  const [selectedAudioFormatId, setSelectedAudioFormatId] = useState("");
  const [jobResultMessage, setJobResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const pendingUrl = getPendingStartUrl();

    if (pendingUrl) {
      setAnalysisUrl(pendingUrl);
      clearPendingStartUrl();
    }
  }, []);

  const selectedFormat = useMemo(() => {
    if (!analysis || !selectedFormatId) {
      return null;
    }

    return analysis.formats.find((item) => item.format_id === selectedFormatId) ?? null;
  }, [analysis, selectedFormatId]);

  const analyzeMutation = useMutation({
    mutationFn: analyzeDownloadUrl,

    onSuccess: (data, variables) => {
      setAnalysis(data);
      setAnalysisUrl(variables.url);
      setErrorMessage(null);
      setJobResultMessage(null);

      const firstFormat = data.formats.find((item) => item.format_id);

      const bestAudio = data.formats.find(
        (item: DownloadFormatInfo) => item.audio_only || item.vcodec === "none",
      );

      const bestVideo = data.formats.find(
        (item: DownloadFormatInfo) => !item.audio_only && item.vcodec !== "none",
      );

      setSelectedFormatId(firstFormat?.format_id || "");
      setSelectedAudioFormatId(bestAudio?.format_id || "");
      setSelectedVideoFormatId(bestVideo?.format_id || "");
    },

    onError: (error: any) => {
      setAnalysis(null);
      setJobResultMessage(null);
      setErrorMessage(extractErrorMessage(error, t) || t.downloads.failedAnalyze);
    },
  });

  const createJobMutation = useMutation({
    mutationFn: createDownloadJob,

    onSuccess: () => {
      setErrorMessage(null);
      navigate("/app/jobs?source=downloads");
    },

    onError: (error: any) => {
      setJobResultMessage(null);
      setErrorMessage(extractErrorMessage(error, t) || t.downloads.failedCreate);
    },
  });

  const formatsCount = useMemo(() => analysis?.formats.length ?? 0, [analysis]);

  return (
    <div>
      <PageHeader title={t.downloads.title} description={t.downloads.description} />

      <div className="grid gap-6">
        <AnalyzeUrlForm
          isLoading={analyzeMutation.isPending}
          initialUrl={analysisUrl}
          onAnalyze={(url) => analyzeMutation.mutate({ url })}
        />

        {errorMessage ? (
          <Card className="border-rose-900/60 bg-rose-950/30 p-4">
            <div className="text-sm font-medium text-rose-300">
              {t.common.error}
            </div>

            <div className="mt-1 text-sm text-rose-200">
              {errorMessage}
            </div>
          </Card>
        ) : null}

        {jobResultMessage ? (
          <Card className="border-emerald-900/60 bg-emerald-950/30 p-4">
            <div className="text-sm font-medium text-emerald-300">
              {t.common.success}
            </div>

            <div className="mt-1 text-sm text-emerald-200">
              {jobResultMessage}
            </div>
          </Card>
        ) : null}

        {analysis ? (
          <>
            <Card className="p-5">
              <div className="grid gap-4 lg:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t.downloads.titleLabel}
                  </div>

                  <div className="mt-1 text-sm text-white">
                    {analysis.title || t.common.unavailable}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t.downloads.platform}
                  </div>

                  <div className="mt-1 text-sm text-white">
                    {analysis.extractor || t.common.unavailable}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t.downloads.duration}
                  </div>

                  <div className="mt-1 text-sm text-white">
                    {analysis.duration ? `${analysis.duration} sec` : t.common.unavailable}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {t.downloads.formats}
                  </div>

                  <div className="mt-1 text-sm text-white">
                    {formatsCount}
                  </div>
                </div>
              </div>
            </Card>

            <FormatsTable
              formats={analysis.formats}
              selectedFormatId={selectedFormatId}
              selectedVideoFormatId={selectedVideoFormatId}
              selectedAudioFormatId={selectedAudioFormatId}
              onSelectFormat={setSelectedFormatId}
              onSelectVideoFormat={(formatId) => {
                setSelectedVideoFormatId(formatId);
                setSelectedFormatId(formatId);
              }}
              onSelectAudioFormat={(formatId) => {
                setSelectedAudioFormatId(formatId);
                setSelectedFormatId(formatId);
              }}
            />

            <DownloadJobForm
              url={analysisUrl}
              title={analysis.title}
              isSubmitting={createJobMutation.isPending}
              selectedFormat={selectedFormat}
              selectedVideoFormatId={selectedVideoFormatId}
              selectedAudioFormatId={selectedAudioFormatId}
              onSubmit={(payload) => {
                createJobMutation.mutate({
                  url: analysisUrl,
                  download_mode: payload.downloadMode as DownloadMode,
                  requested_format: payload.requestedFormat,
                  requested_file_name: payload.requestedFileName,
                  mp4_mode: payload.mp4Mode,
                  selected_format_id: payload.selectedFormatId,
                  selected_video_format_id: payload.selectedVideoFormatId,
                  selected_audio_format_id: payload.selectedAudioFormatId,
                });
              }}
            />
          </>
        ) : (
          <Card className="p-6">
            <div className="text-lg font-medium text-white">
              {t.downloads.waitingTitle}
            </div>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {t.downloads.waitingText}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}