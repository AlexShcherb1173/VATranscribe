import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTranscriptionJob } from "@/shared/api/transcriptions";
import { extractErrorMessage } from "@/shared/lib/auth-errors";
import { toastError, toastSuccess } from "@/shared/ui/toast";

type StartTranscriptionButtonProps = {
  mediaAssetId: string;
};

export function StartTranscriptionButton({
  mediaAssetId,
}: StartTranscriptionButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createTranscriptionJob({
        media_asset_id: mediaAssetId,
        model_name: "small",
        language: "ru",
        export_formats: ["txt", "srt", "vtt", "json"],
      }),
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      await queryClient.invalidateQueries({ queryKey: ["quota", "me"] });

      toastSuccess(
        "Transcription job created",
        `Job ${data?.id ?? ""} has been enqueued.`,
      );
    },
    onError: (error: any) => {
      toastError("Transcription failed", extractErrorMessage(error));
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {mutation.isPending ? "Starting..." : "Transcribe"}
    </button>
  );
}