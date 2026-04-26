import type { Transcript } from "@/entities/transcript/model/types";
import { formatDateTime } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type TranscriptsTableProps = {
  transcripts: Transcript[];
  selectedTranscriptId: string | null;
  onSelectTranscript: (transcriptId: string) => void;
};

export function TranscriptsTable({
  transcripts,
  selectedTranscriptId,
  onSelectTranscript,
}: TranscriptsTableProps) {
  if (!transcripts.length) {
    return (
      <EmptyState
        title="No transcripts yet"
        description="Create a transcription from a media file to see results here."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/90 text-left text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 font-medium">Transcript</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Engine</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {transcripts.map((transcript) => {
              const isSelected = selectedTranscriptId === transcript.id;

              return (
                <tr
                  key={transcript.id}
                  onClick={() => onSelectTranscript(transcript.id)}
                  className={[
                    "cursor-pointer border-b border-slate-800/70 text-slate-200 last:border-b-0",
                    isSelected ? "bg-cyan-500/10" : "hover:bg-slate-900/70",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{transcript.id}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      media_asset: {transcript.media_asset_id}
                    </div>
                  </td>
                  <td className="px-4 py-3">{transcript.language}</td>
                  <td className="px-4 py-3">{transcript.model_name}</td>
                  <td className="px-4 py-3">{transcript.engine}</td>
                  <td className="px-4 py-3">{formatDateTime(transcript.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}