'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Entry = { user: string; score: number; when: string };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      // Fallback to localStorage if no Supabase
      if (!supabase) {
        const local = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        setEntries(local);
        return;
      }
      const { data, error } = await supabase.from('leaderboard').select('*').order('score', { ascending: false }).limit(50);
      if (!error && data) setEntries(data as any);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leaderboard</h1>
      <ul className="space-y-2">
        {entries.map((e, i) => (
          <li key={i} className="border rounded p-2 flex justify-between">
            <span>{e.user}</span>
            <span className="font-mono">{e.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}