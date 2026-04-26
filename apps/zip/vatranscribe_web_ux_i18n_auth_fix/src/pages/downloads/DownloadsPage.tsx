import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { analyzeDownloadUrl, createDownloadJob } from "@/features/downloads/api/downloads";
import type {
  DownloadAnalyzeResponse,
  DownloadFormatInfo,
} from "@/features/downloads/model/types";
import { AnalyzeUrlForm } from "@/features/downloads/ui/AnalyzeUrlForm";
import { DownloadJobForm } from "@/features/downloads/ui/DownloadJobForm";
import { FormatsTable } from "@/features/downloads/ui/FormatsTable";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Card } from "@/shared/ui/Card";
import { useI18n } from "@/shared/i18n";
import { extractErrorMessage } from "@/shared/lib/auth-errors";

export function DownloadsPage() {
  const { t } = useI18n();
  const [analysis, setAnalysis] = useState<DownloadAnalyzeResponse | null>(null);
  const [analysisUrl, setAnalysisUrl] = useState("");
  const [selectedVideoFormatId, setSelectedVideoFormatId] = useState("");
  const [selectedAudioFormatId, setSelectedAudioFormatId] = useState("");
  const [requestedFormat, setRequestedFormat] = useState<"mp3" | "mp4">("mp3");
  const [jobResultMessage, setJobResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: analyzeDownloadUrl,
    onSuccess: (data, variables) => {
      setAnalysis(data);
      setAnalysisUrl(variables.url);
      setErrorMessage(null);
      setJobResultMessage(null);

      const bestAudio = data.formats.find(
        (item: DownloadFormatInfo) => item.audio_only || item.video_only,
      );
      const bestVideo = data.formats.find(
        (item: DownloadFormatInfo) => !item.audio_only,
      );

      setSelectedAudioFormatId(bestAudio?.format_id || "");
      setSelectedVideoFormatId(bestVideo?.format_id || "");
    },
    onError: (error: any) => {
      setAnalysis(null);
      setErrorMessage(extractErrorMessage(error, t) || t.downloads.failedAnalyze);
    },
  });

  const createJobMutation = useMutation({
    mutationFn: createDownloadJob,
    onSuccess: (data) => {
      setJobResultMessage(`${t.downloads.created}: ${data.id}`);
      setErrorMessage(null);
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
            <div className="text-sm font-medium text-rose-300">{t.common.error}</div>
            <div className="mt-1 text-sm text-rose-200">{errorMessage}</div>
          </Card>
        ) : null}

        {jobResultMessage ? (
          <Card className="border-emerald-900/60 bg-emerald-950/30 p-4">
            <div className="text-sm font-medium text-emerald-300">{t.common.success}</div>
            <div className="mt-1 text-sm text-emerald-200">{jobResultMessage}</div>
          </Card>
        ) : null}

        {analysis ? (
          <>
            <Card className="p-5">
              <div className="grid gap-4 lg:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t.downloads.titleLabel}</div>
                  <div className="mt-1 text-sm text-white">{analysis.title || t.common.unavailable}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t.downloads.platform}</div>
                  <div className="mt-1 text-sm text-white">{analysis.extractor || t.common.unavailable}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t.downloads.duration}</div>
                  <div className="mt-1 text-sm text-white">
                    {analysis.duration ? `${analysis.duration} sec` : t.common.unavailable}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t.downloads.formats}</div>
                  <div className="mt-1 text-sm text-white">{formatsCount}</div>
                </div>
              </div>
            </Card>

            <FormatsTable
              formats={analysis.formats}
              requestedFormat={requestedFormat}
              selectedVideoFormatId={selectedVideoFormatId}
              selectedAudioFormatId={selectedAudioFormatId}
              onSelectVideoFormat={setSelectedVideoFormatId}
              onSelectAudioFormat={setSelectedAudioFormatId}
            />

            <DownloadJobForm
              url={analysisUrl}
              title={analysis.title}
              isSubmitting={createJobMutation.isPending}
              selectedVideoFormatId={selectedVideoFormatId}
              selectedAudioFormatId={selectedAudioFormatId}
              onSubmit={(payload) => {
                setRequestedFormat(payload.requestedFormat);

                createJobMutation.mutate({
                  url: analysisUrl,
                  requested_format: payload.requestedFormat,
                  requested_file_name: payload.requestedFileName,
                  mp4_mode: payload.mp4Mode,
                  selected_video_format_id: payload.selectedVideoFormatId,
                  selected_audio_format_id: payload.selectedAudioFormatId,
                });
              }}
            />
          </>
        ) : (
          <Card className="p-6">
            <div className="text-lg font-medium text-white">{t.downloads.waitingTitle}</div>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {t.downloads.waitingText}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
