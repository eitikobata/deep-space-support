'use client';

import { useState } from 'react';

export function LoginForm({
  variant,
  onLogin,
}: {
  variant: 'crew' | 'officer';
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>{variant === 'crew' ? 'Crew Login' : 'Officer Login'}</h2>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className={variant === 'crew' ? 'primary' : 'officer'} disabled={loading}>
        {loading ? 'Authenticating...' : 'Authenticate'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
