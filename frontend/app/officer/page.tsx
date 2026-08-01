'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Api, Transmission } from '@/lib/directus';
import { LoginForm } from '@/components/LoginForm';
import { TicketList } from '@/components/TicketList';
import { TicketDetail } from '@/components/TicketDetail';

export default function OfficerDeck() {
  const { loggedIn, ready, login, logout } = useAuth();
  const [tickets, setTickets] = useState<Transmission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setTickets(await Api.listAllTransmissions());
    } catch {
      setError('Could not load transmissions.');
    }
  }, []);

  useEffect(() => {
    if (loggedIn) loadTickets();
  }, [loggedIn, loadTickets]);

  if (!ready) return null;

  return (
    <>
      <header className="station-header">
        <h1>Officer <span className="amber">Deck</span></h1>
        {loggedIn && (
          <button className="ghost" onClick={logout}>Sign Out</button>
        )}
      </header>

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
          <div className="panel">
            <h2>All Transmissions</h2>
            {error && <p className="error-text">{error}</p>}
            <TicketList tickets={tickets} showSender onSelect={setSelectedId} />
          </div>
        )}
      </main>
    </>
  );
}
