'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, signOut } from '../lib/supabaseClient';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUserEmail(u?.email ?? null);
    })();
  }, []);
  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex gap-4">
        <Link className="font-semibold" href={`${base}/`}>Agile Tester Prep</Link>
        <Link href={`${base}/quiz`}>Quiz</Link>
        <Link href={`${base}/flashcards`}>Flashcards</Link>
        <Link href={`${base}/adaptive`}>Adaptive</Link>
        <Link href={`${base}/exam`}>Exam</Link>
        <Link href={`${base}/leaderboard`}>Leaderboard</Link>
        <Link href={`${base}/notes`}>Notes</Link>
        <Link href={`${base}/revision`}>Revision</Link>
      </div>
      <div className="flex items-center gap-3">
        {userEmail ? (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-300">{userEmail}</span>
            <button className="px-3 py-1 border rounded" onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <Link className="px-3 py-1 border rounded" href={`${base}/signin`}>Sign in</Link>
        )}
      </div>
    </nav>
  );
}