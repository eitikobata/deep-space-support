'use client';

import { useEffect, useState, useCallback } from 'react';
import { Api, Transmission } from '@/lib/api';

export function CrewTicketDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const t = await Api.getTransmission(id);
    setTransmission(t);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !transmission) {
    return (
      <div className="panel">
        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>&larr; Back</a>
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  const entries = transmission.logEntries || [];

  return (
    <div className="panel">
      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>&larr; Back</a>

      <p className="ticket-meta" style={{ marginTop: 16 }}>
        SENT: {new Date(transmission.createdAt).toLocaleString()} · STATUS: {transmission.status.replace('_', ' ')}
      </p>
      <h2 style={{ color: 'var(--text)', fontSize: 16, textTransform: 'none', letterSpacing: 0, marginTop: 4 }}>
        {transmission.subject}
      </h2>
      <p style={{ lineHeight: 1.6 }}>{transmission.description}</p>

      <div style={{ margin: '20px 0', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <p className="ticket-meta" style={{ marginBottom: 10 }}>RESPONSES</p>
        {entries.length ? (
          entries.map((e) => (
            <div key={e.id} style={{ marginBottom: 14 }}>
              <p className="ticket-meta">
                {e.officer?.email || 'Duty Officer'} · {new Date(e.createdAt).toLocaleString()}
              </p>
              <p style={{ lineHeight: 1.5 }}>{e.body}</p>
            </div>
          ))
        ) : (
          <p className="empty-state">No response yet. An officer will get back to you soon.</p>
        )}
      </div>
    </div>
  );
}
