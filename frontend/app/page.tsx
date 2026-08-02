'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Api, Transmission } from '@/lib/api';
import { LoginForm } from '@/components/LoginForm';
import { TicketList } from '@/components/TicketList';

export default function CrewPortal() {
  const { loggedIn, ready, login, logout } = useAuth();
  const [tickets, setTickets] = useState<Transmission[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setTickets(await Api.listMyTransmissions());
    } catch {
      setError('Could not load transmissions.');
    }
  }, []);

  useEffect(() => {
    if (loggedIn) loadTickets();
  }, [loggedIn, loadTickets]);

  async function handleSubmit() {
    setError('');
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      await Api.createTransmission({
        subject: subject.trim(),
        description: description.trim(),
        notifyEmail: notifyEmail.trim(),
      });
      setSubject('');
      setDescription('');
      setNotifyEmail('');
      loadTickets();
    } catch {
      setError('Could not send transmission. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <>
      <header className="station-header">
        <h1>Deep Space <span>Support</span></h1>
        {loggedIn && (
          <button className="ghost" onClick={logout}>Sign Out</button>
        )}
      </header>

      <main>
        {!loggedIn ? (
          <LoginForm variant="crew" onLogin={login} />
        ) : (
          <>
            <div className="panel">
              <h2>New Transmission</h2>
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Describe what's happening in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label htmlFor="notifyEmail">Notify me at (optional)</label>
              <input
                id="notifyEmail"
                type="email"
                placeholder="you@email.com"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
              />
              <button className="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Transmission'}
              </button>
              {error && <p className="error-text">{error}</p>}
            </div>

            <div className="panel">
              <h2>Your Transmissions</h2>
              <TicketList tickets={tickets} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
