export function ConfidenceMeter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Confidence</span>
      <input type="range" min={1} max={5} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="text-sm">{value}</span>
    </div>
  );
}