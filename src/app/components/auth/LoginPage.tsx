import { FormEvent, useState } from 'react';
import { Loader2, Lock, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SINGLE_USER_NAME = (import.meta as any).env?.VITE_SINGLE_USER_NAME || 'Borja';

export function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState(SINGLE_USER_NAME);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password, remember);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-amber-100 p-7">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>LifeHub Login</h1>
          <p className="text-gray-500 text-sm">Sign in to access your meals, planner and groceries.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            Remember me
          </label>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

