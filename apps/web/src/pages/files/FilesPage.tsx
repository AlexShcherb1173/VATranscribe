import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import type { MediaFile } from "@/entities/media-file/model/types";
import { StartTranscriptionButton } from "@/features/files/ui/StartTranscriptionButton";
import { FilesTable } from "@/features/files/ui/FilesTable";
import { downloadMediaFile, saveBlob } from "@/shared/api/files";
import { useMediaFilesQuery } from "@/shared/hooks/useMediaFilesQuery";
import { useI18n } from "@/shared/i18n";
import { extractErrorMessage } from "@/shared/lib/auth-errors";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { toastError } from "@/shared/ui/toast";
import { UploaderPanel } from "@/widgets/uploader/UploaderPanel";

export function FilesPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    searchParams.get("fileId"),
  );
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const { data, isLoading } = useMediaFilesQuery();
  const files = data ?? [];

  useEffect(() => {
    const fileIdFromUrl = searchParams.get("fileId");

    if (fileIdFromUrl && fileIdFromUrl !== selectedFileId) {
      setSelectedFileId(fileIdFromUrl);
    }
  }, [searchParams, selectedFileId]);

  useEffect(() => {
    if (!files.length) {
      setSelectedFileId(null);
      return;
    }

    if (!selectedFileId) {
      setSelectedFile(files[0].id);
      return;
    }

    const exists = files.some((file) => file.id === selectedFileId);
    if (!exists) {
      setSelectedFile(files[0].id);
    }
  }, [files, selectedFileId]);

  const selectedFile = files.find((file) => file.id === selectedFileId) ?? null;

  function setSelectedFile(fileId: string) {
    setSelectedFileId(fileId);
    setSearchParams({ fileId });
  }

  async function handleDownloadFile(file: MediaFile) {
    if (!file.download_url || downloadingFileId) {
      return;
    }

    setDownloadingFileId(file.id);

    try {
      const blob = await downloadMediaFile(file.id);
      saveBlob(blob, file.stored_name || file.original_name || `media-${file.id}`);
    } catch (error: any) {
      toastError("Download failed", extractErrorMessage(error));
    } finally {
      setDownloadingFileId(null);
    }
  }

  return (
    <div>
      <PageHeader title={t.files.title} description={t.files.description} />

      <div className="grid gap-6">
        <UploaderPanel />

        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Spinner />
            <span>{t.files.loading}</span>
          </div>
        ) : (
          <>
            <FilesTable
              files={files}
              selectedFileId={selectedFileId}
              downloadingFileId={downloadingFileId}
              onSelectFile={setSelectedFile}
              onDownloadFile={handleDownloadFile}
            />

            <Card className="p-5">
              <div className="mb-3 text-sm font-medium text-white">
                {t.files.selected}
              </div>

              {selectedFile ? (
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500">{t.files.name}:</span>{" "}
                      {selectedFile.stored_name}
                    </div>
                    <div>
                      <span className="text-slate-500">{t.files.kind}:</span>{" "}
                      {selectedFile.kind}
                    </div>
                    <div>
                      <span className="text-slate-500">{t.files.id}:</span>{" "}
                      {selectedFile.id}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!selectedFile.download_url || downloadingFileId === selectedFile.id}
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      {downloadingFileId === selectedFile.id
                        ? "Downloading..."
                        : t.common.openFile}
                    </button>

                    <StartTranscriptionButton mediaAssetId={selectedFile.id} />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">{t.files.helper}</div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
