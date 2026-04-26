import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { analyzeDownloadUrl, createDownloadJob } from "@/features/downloads/api/downloads";
import type {
  DownloadAnalyzeResponse,
  DownloadFormatInfo,
} from "@/features/downloads/models/types";
import { AnalyzeUrlForm } from "@/features/downloads/ui/AnalyzeUrlForm";
import { DownloadJobForm } from "@/features/downloads/ui/DownloadJobForm";
import { FormatsTable } from "@/features/downloads/ui/FormatsTable";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Card } from "@/shared/ui/Card";

export function DownloadsPage() {
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
      setErrorMessage(
        error?.response?.data?.detail || error?.message || "Failed to analyze URL.",
      );
    },
  });

  const createJobMutation = useMutation({
    mutationFn: createDownloadJob,
    onSuccess: (data) => {
      setJobResultMessage(`Job created successfully: ${data.id}`);
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setJobResultMessage(null);
      setErrorMessage(
        error?.response?.data?.detail || error?.message || "Failed to create download job.",
      );
    },
  });

  const formatsCount = useMemo(() => analysis?.formats.length ?? 0, [analysis]);

  return (
    <div>
      <PageHeader
        title="Downloads"
        description="Analyze media URLs, inspect available formats and enqueue MP3/MP4 download jobs."
      />

      <div className="grid gap-6">
        <AnalyzeUrlForm
          isLoading={analyzeMutation.isPending}
          initialUrl={analysisUrl}
          onAnalyze={(url) => analyzeMutation.mutate({ url })}
        />

        {errorMessage ? (
          <Card className="border-rose-900/60 bg-rose-950/30 p-4">
            <div className="text-sm font-medium text-rose-300">Error</div>
            <div className="mt-1 text-sm text-rose-200">{errorMessage}</div>
          </Card>
        ) : null}

        {jobResultMessage ? (
          <Card className="border-emerald-900/60 bg-emerald-950/30 p-4">
            <div className="text-sm font-medium text-emerald-300">Success</div>
            <div className="mt-1 text-sm text-emerald-200">{jobResultMessage}</div>
          </Card>
        ) : null}

        {analysis ? (
          <>
            <Card className="p-5">
              <div className="grid gap-4 lg:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Title</div>
                  <div className="mt-1 text-sm text-white">{analysis.title || "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Extractor</div>
                  <div className="mt-1 text-sm text-white">{analysis.extractor || "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Duration</div>
                  <div className="mt-1 text-sm text-white">
                    {analysis.duration ? `${analysis.duration} sec` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Formats</div>
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
            <div className="text-lg font-medium text-white">Waiting for analysis</div>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Run URL analysis first. After that, you will be able to inspect formats,
              choose MP3 or MP4 mode and create a download job.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}