import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadMediaFile } from "@/features/uploads/api/uploads";
import type { UploadQueueItem } from "@/features/uploads/model/types";
import { UploadDropzone } from "@/features/uploads/ui/UploadDropzone";
import { UploadQueue } from "@/features/uploads/ui/UploadQueue";
import { UploadResultCard } from "@/features/uploads/ui/UploadResultCard";
import { extractErrorMessage } from "@/shared/lib/auth-errors";
import { toastError, toastInfo, toastSuccess } from "@/shared/ui/toast";

type UploaderPanelProps = {
  redirectToFilesOnUpload?: boolean;
};

function createQueueItem(file: File): UploadQueueItem {
  return {
    id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
    file,
    progress: 0,
    status: "idle",
    errorMessage: null,
    uploadedMediaAssetId: null,
    uploadedStoredName: null,
  };
}

export function UploaderPanel({ redirectToFilesOnUpload = false }: UploaderPanelProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const initialItems = files.map(createQueueItem);
      let firstUploadedMediaAssetId: string | null = null;

      setQueue((prev) => [...initialItems, ...prev]);

      toastInfo(
        "Upload started",
        `${files.length} file${files.length > 1 ? "s" : ""} added to queue.`,
      );

      for (const item of initialItems) {
        setQueue((prev) =>
          prev.map((queueItem) =>
            queueItem.id === item.id
              ? {
                  ...queueItem,
                  status: "uploading",
                  progress: 0,
                  errorMessage: null,
                }
              : queueItem,
          ),
        );

        try {
          const uploaded = await uploadMediaFile(item.file, (progress) => {
            setQueue((prev) =>
              prev.map((queueItem) =>
                queueItem.id === item.id
                  ? { ...queueItem, progress }
                  : queueItem,
              ),
            );
          });

          if (!firstUploadedMediaAssetId) {
            firstUploadedMediaAssetId = uploaded.id;
          }

          setQueue((prev) =>
            prev.map((queueItem) =>
              queueItem.id === item.id
                ? {
                    ...queueItem,
                    progress: 100,
                    status: "succeeded",
                    uploadedMediaAssetId: uploaded.id,
                    uploadedStoredName: uploaded.stored_name,
                  }
                : queueItem,
            ),
          );

          toastSuccess(
            "Upload completed",
            `${uploaded.stored_name} is ready for transcription.`,
          );
        } catch (error: any) {
          const message = extractErrorMessage(error);

          setQueue((prev) =>
            prev.map((queueItem) =>
              queueItem.id === item.id
                ? {
                    ...queueItem,
                    status: "failed",
                    errorMessage: message,
                  }
                : queueItem,
            ),
          );

          toastError("Upload failed", message);
        }
      }

      return firstUploadedMediaAssetId;
    },
    onSuccess: async (firstUploadedMediaAssetId) => {
      await queryClient.invalidateQueries({ queryKey: ["media-files"] });
      await queryClient.invalidateQueries({ queryKey: ["quota", "me"] });

      if (redirectToFilesOnUpload && firstUploadedMediaAssetId) {
        navigate(`/app/files?fileId=${firstUploadedMediaAssetId}`);
      }
    },
  });

  return (
    <div className="grid gap-6">
      <UploadDropzone
        isBusy={uploadMutation.isPending}
        onFilesSelected={(files) => uploadMutation.mutate(files)}
      />

      <UploadResultCard items={queue} />
      <UploadQueue items={queue} />
    </div>
  );
}
