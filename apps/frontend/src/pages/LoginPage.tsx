import { FormEvent, useState } from 'react';
import { apiFetch } from '../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('admin@pos.local');
  const [password, setPassword] = useState('Password123!');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const data = await apiFetch<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', data.token);
    location.href = '/';
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl w-full max-w-sm shadow space-y-3">
        <h1 className="text-xl font-bold">POS Login</h1>
        <input className="w-full border p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-slate-900 text-white rounded p-2">Login</button>
      </form>
    </div>
  );
}
