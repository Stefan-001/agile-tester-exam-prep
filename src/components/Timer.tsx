'use client';
import { useEffect, useState } from 'react';

export function Timer({ seconds, onElapsed }: { seconds: number; onElapsed: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(id); onElapsed(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, onElapsed]);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return <div className="font-mono">Time left: {m}:{s.toString().padStart(2, '0')}</div>;
}