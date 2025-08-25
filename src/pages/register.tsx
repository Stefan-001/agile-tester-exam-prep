import { useState } from 'react';
import { registerLocal } from '@/lib/auth';
import { useRouter } from 'next/router';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await registerLocal(username, password);
      router.push('/');
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <div className="rounded bg-red-100 p-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">{err}</div>}
        <button type="submit" className="btn btn-primary w-full">Create account</button>
      </form>
    </div>
  );
}