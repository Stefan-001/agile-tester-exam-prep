type Props = { value: number; label?: string };
export default function ProgressBar({ value, label }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm">{label}</span>
          <span className="text-sm">{pct}%</span>
        </div>
      )}
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-3 rounded bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}