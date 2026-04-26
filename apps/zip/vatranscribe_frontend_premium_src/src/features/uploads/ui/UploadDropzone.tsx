import { useRef, useState, type DragEvent } from "react";

type UploadDropzoneProps = {
  isBusy?: boolean;
  onFilesSelected: (files: File[]) => void;
};

export function UploadDropzone({
  isBusy = false,
  onFilesSelected,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openFileDialog() {
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    onFilesSelected(Array.from(files));
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "rounded-2xl border-2 border-dashed p-8 text-center transition",
        isDragging
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-slate-700 bg-slate-900/50",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".mp3,.wav,.m4a,.aac,.flac,.ogg,.mp4,.mov,.mkv,.webm,.avi"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="mx-auto max-w-2xl">
        <div className="text-lg font-medium text-white">
          Drag & drop local media files
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Supported: MP3, WAV, M4A, AAC, FLAC, OGG, MP4, MOV, MKV, WEBM, AVI
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={openFileDialog}
            disabled={isBusy}
            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Uploading..." : "Choose files"}
          </button>
        </div>
      </div>
    </div>
  );
}