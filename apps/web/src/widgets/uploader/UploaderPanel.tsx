import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadMediaFile } from "@/features/uploads/api/uploads";
import type { UploadQueueItem } from "@/features/uploads/model/types";
import { UploadDropzone } from "@/features/uploads/ui/UploadDropzone";
import { UploadQueue } from "@/features/uploads/ui/UploadQueue";
import { UploadResultCard } from "@/features/uploads/ui/UploadResultCard";

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

export function UploaderPanel() {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const initialItems = files.map(createQueueItem);
      setQueue((prev) => [...initialItems, ...prev]);

      for (const item of initialItems) {
        setQueue((prev) =>
          prev.map((queueItem) =>
            queueItem.id === item.id
              ? { ...queueItem, status: "uploading", progress: 0, errorMessage: null }
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
        } catch (error: any) {
          setQueue((prev) =>
            prev.map((queueItem) =>
              queueItem.id === item.id
                ? {
                    ...queueItem,
                    status: "failed",
                    errorMessage:
                      error?.response?.data?.detail ||
                      error?.message ||
                      "Upload failed",
                  }
                : queueItem,
            ),
          );
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media-files"] });
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