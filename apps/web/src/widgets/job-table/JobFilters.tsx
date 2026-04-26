type JobFiltersProps = {
  status: string;
  type: string;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
};

export function JobFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
}: JobFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:max-w-xl">
      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-300">Status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
        >
          <option value="">All</option>
          <option value="pending">pending</option>
          <option value="queued">queued</option>
          <option value="running">running</option>
          <option value="succeeded">succeeded</option>
          <option value="failed">failed</option>
          <option value="canceled">canceled</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-300">Type</span>
        <select
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
        >
          <option value="">All</option>
          <option value="download">download</option>
          <option value="transcribe">transcribe</option>
          <option value="combined">combined</option>
          <option value="export">export</option>
        </select>
      </label>
    </div>
  );
}