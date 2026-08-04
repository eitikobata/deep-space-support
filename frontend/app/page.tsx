'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Api, Transmission, TransmissionStatus } from '@/lib/api';
import { sortNewestFirst } from '@/lib/sort';
import { LoginForm } from '@/components/LoginForm';
import { TicketList } from '@/components/TicketList';
import { CrewTicketDetail } from '@/components/CrewTicketDetail';
import { CharacterBanner } from '@/components/CharacterBanner';
import { CREW_DIALOGUE } from '@/lib/dialogue';

const COLUMNS: { status: TransmissionStatus; label: string }[] = [
  { status: 'ACTIVE', label: 'Active' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'RESOLVED', label: 'Resolved' },
];

export default function CrewPortal() {
  const { loggedIn, ready, login, logout } = useAuth();
  const [tickets, setTickets] = useState<Transmission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setTickets(await Api.listTransmissions());
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

  const selectedTicket = selectedId ? tickets.find((t) => t.id === selectedId) : null;
  let scene: keyof typeof CREW_DIALOGUE = 'login';
  let sceneKey = 'crew-login';
  if (loggedIn) {
    if (selectedId) {
      if (selectedTicket?.status === 'RESOLVED') {
        scene = 'resolved';
        sceneKey = `crew-resolved-${selectedId}`;
      } else {
        scene = 'viewing';
        sceneKey = `crew-viewing-${selectedId}`;
      }
    } else {
      scene = 'create';
      sceneKey = 'crew-create';
    }
  }

  return (
    <>
      <header className="station-header">
        <h1>Deep Space <span>Support</span></h1>
        {loggedIn && (
          <button className="ghost" onClick={logout}>Sign Out</button>
        )}
      </header>

      <CharacterBanner
        imageSrc="/images/crew-banner.png"
        imageAlt="Crew liaison"
        lines={CREW_DIALOGUE[scene]}
        sceneKey={sceneKey}
        aspectRatio="2400 / 380"
      />

      <main>
        {!loggedIn ? (
          <LoginForm variant="crew" onLogin={login} />
        ) : selectedId ? (
          <CrewTicketDetail
            id={selectedId}
            onBack={() => {
              setSelectedId(null);
              loadTickets();
            }}
          />
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

            <div className="kanban-board">
              {COLUMNS.map((col) => {
                const columnTickets = sortNewestFirst(tickets.filter((t) => t.status === col.status));
                return (
                  <div key={col.status} className="panel kanban-column">
                    <h2>{col.label} <span className="kanban-count">{columnTickets.length}</span></h2>
                    <TicketList tickets={columnTickets} onSelect={setSelectedId} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
