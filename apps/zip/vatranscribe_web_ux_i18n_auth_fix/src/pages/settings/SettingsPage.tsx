import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { useI18n } from "@/shared/i18n";

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <div>
      <PageHeader title={t.settings.title} description={t.settings.description} />

      <Card className="p-6">
        <div className="text-lg font-medium text-white">{t.settings.next}</div>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          {t.settings.text}
        </p>
      </Card>
    </div>
  );
}
