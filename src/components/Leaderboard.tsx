type Entry = { label: string; score: number; date: string };
export default function Leaderboard({ entries }: { entries: Entry[] }) {
  const sorted = [...entries].sort((a, b) => b.score - a.score).slice(0, 10);
  return (
    <div className="card">
      <h3 className="mb-2 text-lg font-semibold">Leaderboard (Your Best Sessions)</h3>
      <ol className="list-decimal pl-5">
        {sorted.map((e, i) => (
          <li key={i} className="flex items-center justify-between py-1">
            <span>{e.label}</span>
            <span className="font-mono">{e.score}%</span>
          </li>
        ))}
      </ol>
    </div>
  );
}