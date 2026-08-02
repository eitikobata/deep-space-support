'use client';

import { useState } from 'react';

const DEMO_CREDENTIALS = {
  crew: {
    email: process.env.NEXT_PUBLIC_DEMO_CREW_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_CREW_PASSWORD,
  },
  officer: {
    email: process.env.NEXT_PUBLIC_DEMO_OFFICER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_OFFICER_PASSWORD,
  },
};

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

  const demo = DEMO_CREDENTIALS[variant];
  const otherPortal = variant === 'crew' ? { href: '/officer', label: 'Officer Deck' } : { href: '/', label: 'Crew Portal' };

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

  function fillDemoCredentials() {
    if (!demo?.email || !demo?.password) return;
    setEmail(demo.email);
    setPassword(demo.password);
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

      {demo?.email && demo?.password && (
        <button type="button" className="demo-login" onClick={fillDemoCredentials} disabled={loading}>
          Auto-fill Demo Credentials
        </button>
      )}

      {error && <p className="error-text">{error}</p>}

      <a href={otherPortal.href} className="portal-switch-link">
        Switch to {otherPortal.label} &rarr;
      </a>
    </form>
  );
}
