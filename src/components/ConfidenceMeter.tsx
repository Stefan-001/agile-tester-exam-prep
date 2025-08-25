export default function ConfidenceMeter({
  value,
  onChange
}: {
  value: 'low' | 'medium' | 'high';
  onChange: (v: 'low' | 'medium' | 'high') => void;
}) {
  return (
    <fieldset>
      <legend className="label">Confidence</legend>
      <div className="flex gap-2">
        {(['low', 'medium', 'high'] as const).map((v) => (
          <label key={v} className="inline-flex items-center gap-2">
            <input type="radio" name="confidence" value={v} checked={value === v} onChange={() => onChange(v)} />
            <span className="capitalize">{v}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}