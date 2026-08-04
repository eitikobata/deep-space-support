'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Api, Transmission, AlertLevel, TransmissionStatus } from '@/lib/api';
import { LoginForm } from '@/components/LoginForm';
import { TicketList } from '@/components/TicketList';
import { TicketDetail } from '@/components/TicketDetail';
import { CharacterBanner } from '@/components/CharacterBanner';
import { OFFICER_DIALOGUE } from '@/lib/dialogue';

const URGENCY_ORDER: Record<AlertLevel, number> = {
  RED_ALERT: 0,
  YELLOW_ALERT: 1,
  BLUE_ALERT: 2,
};

const COLUMNS: { status: TransmissionStatus; label: string }[] = [
  { status: 'ACTIVE', label: 'Active' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'RESOLVED', label: 'Resolved' },
];

function sortByUrgency(tickets: Transmission[]) {
  return [...tickets].sort((a, b) => {
    const urgencyDiff = URGENCY_ORDER[a.alertLevel] - URGENCY_ORDER[b.alertLevel];
    if (urgencyDiff !== 0) return urgencyDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function OfficerDeck() {
  const { loggedIn, ready, login, logout } = useAuth();
  const [tickets, setTickets] = useState<Transmission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  if (!ready) return null;

  const selectedTicket = selectedId ? tickets.find((t) => t.id === selectedId) : null;
  let scene: keyof typeof OFFICER_DIALOGUE = 'login';
  let sceneKey = 'officer-login';
  if (loggedIn) {
    if (selectedId) {
      if (selectedTicket?.status === 'RESOLVED') {
        scene = 'resolved';
        sceneKey = `officer-resolved-${selectedId}`;
      } else {
        const level = selectedTicket?.alertLevel || 'BLUE_ALERT';
        scene = level === 'RED_ALERT' ? 'red' : level === 'YELLOW_ALERT' ? 'yellow' : 'blue';
        sceneKey = `officer-${scene}-${selectedId}`;
      }
    } else {
      scene = 'login';
      sceneKey = 'officer-board';
    }
  }

  return (
    <>
      <header className="station-header">
        <h1>Officer <span className="amber">Deck</span></h1>
        {loggedIn && (
          <button className="ghost" onClick={logout}>Sign Out</button>
        )}
      </header>

      <CharacterBanner
        imageSrc="/images/officer-banner.png"
        imageAlt="Commanding officer"
        lines={OFFICER_DIALOGUE[scene]}
        sceneKey={sceneKey}
        aspectRatio="2400 / 380"
      />

      <main>
        {!loggedIn ? (
          <LoginForm variant="officer" onLogin={login} />
        ) : selectedId ? (
          <TicketDetail
            id={selectedId}
            onBack={() => {
              setSelectedId(null);
              loadTickets();
            }}
          />
        ) : (
          <>
            {error && <p className="error-text">{error}</p>}
            <div className="kanban-board">
              {COLUMNS.map((col) => {
                const columnTickets = sortByUrgency(tickets.filter((t) => t.status === col.status));
                return (
                  <div key={col.status} className="panel kanban-column">
                    <h2>{col.label} <span className="kanban-count">{columnTickets.length}</span></h2>
                    <TicketList tickets={columnTickets} showSender onSelect={setSelectedId} />
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
