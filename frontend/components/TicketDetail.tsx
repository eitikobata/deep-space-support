'use client';

import { useEffect, useState, useCallback } from 'react';
import { Api, Transmission, TransmissionStatus } from '@/lib/api';

export function TicketDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [responseBody, setResponseBody] = useState('');
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

  async function handleRespond() {
    if (!responseBody.trim()) return;
    await Api.respondToTransmission(id, responseBody.trim());
    setResponseBody('');
    load();
  }

  async function handleStatusChange(status: TransmissionStatus) {
    await Api.updateTransmissionStatus(id, status);
    load();
  }

  if (loading || !transmission) {
    return (
      <div className="panel">
        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>&larr; Back</a>
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  const entries = transmission.logEntries || [];
  const tags = (transmission.tags || []).map((t) => t.name).join(', ');

  return (
    <div className="panel">
      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>&larr; Back</a>

      <p className="ticket-meta" style={{ marginTop: 16 }}>
        FROM: {transmission.sender?.email || 'unknown'} · {new Date(transmission.createdAt).toLocaleString()}
      </p>
      <h2 style={{ color: 'var(--text)', fontSize: 16, textTransform: 'none', letterSpacing: 0, marginTop: 4 }}>
        {transmission.subject}
      </h2>
      <p style={{ lineHeight: 1.6 }}>{transmission.description}</p>
      <p className="ticket-meta">TAGS: {tags || 'none'} · STATUS: {transmission.status}</p>

      <div style={{ margin: '20px 0', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        {entries.length ? (
          entries.map((e) => (
            <div key={e.id} style={{ marginBottom: 14 }}>
              <p className="ticket-meta">
                {e.officer?.email || 'officer'} · {new Date(e.createdAt).toLocaleString()}
              </p>
              <p style={{ lineHeight: 1.5 }}>{e.body}</p>
            </div>
          ))
        ) : (
          <p className="empty-state">No log entries yet.</p>
        )}
      </div>

      <label htmlFor="responseBody">Log Entry</label>
      <textarea
        id="responseBody"
        placeholder="Write your response..."
        value={responseBody}
        onChange={(e) => setResponseBody(e.target.value)}
      />
      <button className="officer" onClick={handleRespond}>Submit Response</button>

      <label htmlFor="statusSelect">Update Status</label>
      <select
        id="statusSelect"
        value={transmission.status}
        onChange={(e) => handleStatusChange(e.target.value as TransmissionStatus)}
      >
        <option value="ACTIVE">Active</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="RESOLVED">Resolved</option>
      </select>
    </div>
  );
}
