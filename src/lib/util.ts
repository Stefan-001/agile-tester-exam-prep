export function safeUuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
  } catch {}
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Fisher-Yates shuffle; accepts an optional RNG for testability */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
