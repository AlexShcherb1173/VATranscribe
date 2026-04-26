import type { TranscriptSegment } from "@/entities/transcript/model/types";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

type TranscriptSegmentsTableProps = {
  segments: TranscriptSegment[];
};

export function TranscriptSegmentsTable({
  segments,
}: TranscriptSegmentsTableProps) {
  if (!segments.length) {
    return (
      <EmptyState
        title="No segments"
        description="Transcript segments are not available yet."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-medium text-white">Segments</h3>
      </div>

      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/90 text-left text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">End</th>
              <th className="px-4 py-3 font-medium">Text</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr
                key={segment.id}
                className="border-b border-slate-800/70 text-slate-200 last:border-b-0"
              >
                <td className="px-4 py-3">{segment.order_index}</td>
                <td className="px-4 py-3">{segment.start_sec}</td>
                <td className="px-4 py-3">{segment.end_sec}</td>
                <td className="px-4 py-3 whitespace-pre-wrap">{segment.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}