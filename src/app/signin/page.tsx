'use client';
import { useState } from 'react';
import { signInWithMagicLink } from '../../lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signInWithMagicLink(email);
    setMsg(error ? `Error: ${error.message || error}` : 'Check your email for a sign-in link.');
  };
  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <input className="w-full border rounded p-2" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="px-3 py-1 border rounded" type="submit">Send magic link</button>
      {msg && <div className="text-sm">{msg}</div>}
    </form>
  );
}