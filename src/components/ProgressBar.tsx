export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded">
      <div className="bg-green-500 h-2 rounded" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}