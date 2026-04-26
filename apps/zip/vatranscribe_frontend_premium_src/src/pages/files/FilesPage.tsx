import { useEffect, useState } from "react";

import { useMediaFilesQuery } from "@/shared/hooks/useMediaFilesQuery";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { FilesTable } from "@/features/files/ui/FilesTable";
import { Card } from "@/shared/ui/Card";
import { UploaderPanel } from "@/widgets/uploader/UploaderPanel";

export function FilesPage() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const { data, isLoading } = useMediaFilesQuery();
  const files = data ?? [];

  useEffect(() => {
    if (!files.length) {
      setSelectedFileId(null);
      return;
    }

    if (!selectedFileId) {
      setSelectedFileId(files[0].id);
      return;
    }

    const exists = files.some((file) => file.id === selectedFileId);
    if (!exists) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const selectedFile = files.find((file) => file.id === selectedFileId) ?? null;

  return (
    <div>
      <PageHeader
        title="Files"
        description="Upload local files, browse stored media assets, download originals and start transcription directly from media storage."
      />

      <div className="grid gap-6">
        <UploaderPanel />

        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Spinner />
            <span>Loading media files...</span>
          </div>
        ) : (
          <>
            <FilesTable
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
            />

            <Card className="p-5">
              <div className="mb-3 text-sm font-medium text-white">
                Selected file
              </div>

              {selectedFile ? (
                <div className="space-y-2 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-500">Name:</span>{" "}
                    {selectedFile.stored_name}
                  </div>
                  <div>
                    <span className="text-slate-500">Kind:</span>{" "}
                    {selectedFile.kind}
                  </div>
                  <div>
                    <span className="text-slate-500">Media asset ID:</span>{" "}
                    {selectedFile.id}
                  </div>
                  <div>
                    <span className="text-slate-500">Download:</span>{" "}
                    {selectedFile.download_url ? (
                      <a
                        href={`http://localhost:8000${selectedFile.download_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-300 hover:text-cyan-200"
                      >
                        open file
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">
                  Upload a file or select an existing media asset, then use the{" "}
                  <span className="text-cyan-300">Transcribe</span> button to enqueue a transcription job.
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}