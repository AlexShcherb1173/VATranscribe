import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadMediaFile } from "@/features/uploads/api/uploads";
import type { UploadQueueItem } from "@/features/uploads/model/types";
import { UploadDropzone } from "@/features/uploads/ui/UploadDropzone";
import { UploadQueue } from "@/features/uploads/ui/UploadQueue";
import { UploadResultCard } from "@/features/uploads/ui/UploadResultCard";
import { useI18n } from "@/shared/i18n";
import { extractErrorMessage } from "@/shared/lib/auth-errors";
import { toastError, toastInfo, toastSuccess } from "@/shared/ui/toast";

type UploaderPanelProps = {
  redirectToFilesOnUpload?: boolean;
  redirectToFilesOnSelect?: boolean;
  compact?: boolean;
};

type UploadLocationState = {
  pendingFiles?: File[];
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

export function UploaderPanel({
  redirectToFilesOnUpload = false,
  redirectToFilesOnSelect = false,
  compact = false,
}: UploaderPanelProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [queue, setQueue] = useState<UploadQueueItem[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const initialItems = files.map(createQueueItem);
      let firstUploadedMediaAssetId: string | null = null;

      setQueue((prev) => [...initialItems, ...prev]);

      toastInfo(
        t.uploads.uploadStartedTitle,
        `${files.length} ${t.uploads.uploadStartedDescription}`,
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
                queueItem.id === item.id ? { ...queueItem, progress } : queueItem,
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
            t.uploads.uploadCompletedTitle,
            `${uploaded.stored_name} ${t.uploads.uploadCompletedDescription}`,
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

          toastError(t.uploads.uploadFailedTitle, message);
        }
      }

      return firstUploadedMediaAssetId;
    },

    onSuccess: async (firstUploadedMediaAssetId) => {
      await queryClient.invalidateQueries({ queryKey: ["media-files"] });
      await queryClient.invalidateQueries({ queryKey: ["quota", "me"] });

      if (redirectToFilesOnUpload && firstUploadedMediaAssetId) {
        navigate(`/app/files?fileId=${firstUploadedMediaAssetId}`, {
          replace: true,
        });
      }
    },
  });

  useEffect(() => {
    const state = location.state as UploadLocationState | null;
    const pendingFiles = state?.pendingFiles;

    if (pendingFiles?.length) {
      uploadMutation.mutate(pendingFiles);

      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesSelected(files: File[]) {
    if (!files.length) {
      return;
    }

    if (redirectToFilesOnSelect) {
      navigate("/app/files", {
        state: {
          pendingFiles: files,
        },
      });

      return;
    }

    uploadMutation.mutate(files);
  }

  return (
    <div className={compact ? "grid gap-3" : "grid gap-6"}>
      <UploadDropzone
        compact={compact}
        isBusy={uploadMutation.isPending}
        onFilesSelected={handleFilesSelected}
      />

      {!compact ? (
        <>
          <UploadResultCard items={queue} />
          <UploadQueue items={queue} />
        </>
      ) : null}
    </div>
  );
}