import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTranscriptionJob } from "@/shared/api/transcriptions";

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["transcripts"] });
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