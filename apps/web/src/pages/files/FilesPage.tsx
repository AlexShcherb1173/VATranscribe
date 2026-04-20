import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";

export function FilesPage() {
  return (
    <div>
      <PageHeader
        title="Files"
        description="Browse downloaded media assets and future uploaded local files."
      />

      <Card className="p-6">
        <div className="text-lg font-medium text-white">Next step</div>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          This page will host the media asset list, file metadata and playback/download actions.
        </p>
      </Card>
    </div>
  );
}