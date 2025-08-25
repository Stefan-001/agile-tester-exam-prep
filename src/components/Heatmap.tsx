export default function Heatmap({ data }: { data: { topic: string; accuracy: number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {data.map((d) => {
        const pct = Math.round(d.accuracy * 100);
        const bg = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
        return (
          <div key={d.topic} className="card">
            <div className="mb-2">{d.topic}</div>
            <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
              <div className={`h-2 rounded ${bg}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}