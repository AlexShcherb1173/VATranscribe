import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="System configuration, API environment details and future user preferences."
      />

      <Card className="p-6">
        <div className="text-lg font-medium text-white">Next step</div>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          This page will host environment settings, preferences and future account controls.
        </p>
      </Card>
    </div>
  );
}