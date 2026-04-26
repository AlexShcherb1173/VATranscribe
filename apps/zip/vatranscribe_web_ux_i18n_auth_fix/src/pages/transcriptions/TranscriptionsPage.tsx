import { useEffect, useState } from "react";

import { useTranscriptsQuery } from "@/shared/hooks/useTranscriptsQuery";
import { useTranscriptDetailsQuery } from "@/shared/hooks/useTranscriptDetailsQuery";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { TranscriptsTable } from "@/features/transcriptions/ui/TranscriptsTable";
import { TranscriptCard } from "@/features/transcriptions/ui/TranscriptCard";
import { TranscriptSegmentsTable } from "@/features/transcriptions/ui/TranscriptSegmentsTable";
import { TranscriptExports } from "@/features/transcriptions/ui/TranscriptExports";
import { Card } from "@/shared/ui/Card";
import { useI18n } from "@/shared/i18n";

export function TranscriptionsPage() {
  const { t } = useI18n();
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null);

  const { data, isLoading } = useTranscriptsQuery();
  const transcripts = data ?? [];

  useEffect(() => {
    if (!transcripts.length) {
      setSelectedTranscriptId(null);
      return;
    }

    if (!selectedTranscriptId) {
      setSelectedTranscriptId(transcripts[0].id);
      return;
    }

    const exists = transcripts.some((item) => item.id === selectedTranscriptId);
    if (!exists) {
      setSelectedTranscriptId(transcripts[0].id);
    }
  }, [transcripts, selectedTranscriptId]);

  const transcriptDetailsQuery = useTranscriptDetailsQuery(selectedTranscriptId);

  return (
    <div>
      <PageHeader title={t.transcriptions.title} description={t.transcriptions.description} />

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-300">
          <Spinner />
          <span>{t.transcriptions.loading}</span>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <TranscriptsTable
              transcripts={transcripts}
              selectedTranscriptId={selectedTranscriptId}
              onSelectTranscript={setSelectedTranscriptId}
            />
          </div>

          <div className="grid gap-6">
            {transcriptDetailsQuery.isLoading ? (
              <Card className="p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <Spinner />
                  <span>{t.transcriptions.loadingDetails}</span>
                </div>
              </Card>
            ) : transcriptDetailsQuery.data ? (
              <>
                <TranscriptCard transcript={transcriptDetailsQuery.data} />
                <TranscriptExports
                  exportsList={transcriptDetailsQuery.data.exports ?? []}
                />
                <TranscriptSegmentsTable
                  segments={transcriptDetailsQuery.data.segments ?? []}
                />
              </>
            ) : (
              <Card className="p-5 text-sm text-slate-400">
                {t.transcriptions.select}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
