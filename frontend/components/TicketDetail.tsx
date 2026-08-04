'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Api, Transmission, TransmissionStatus, AlertLevel } from '@/lib/api';
import { useMute } from '@/hooks/useMute';

const THEME_CLASS: Record<AlertLevel, string> = {
  BLUE_ALERT: 'theme-blue',
  YELLOW_ALERT: 'theme-yellow',
  RED_ALERT: 'theme-red',
};

const BANNER_CLASS: Record<AlertLevel, string> = {
  BLUE_ALERT: 'blue',
  YELLOW_ALERT: 'yellow',
  RED_ALERT: 'red',
};

const BANNER_LABEL: Record<AlertLevel, string> = {
  BLUE_ALERT: 'Blue Condition',
  YELLOW_ALERT: 'Yellow Alert',
  RED_ALERT: 'Red Alert',
};

const AUDIO_SRC: Record<AlertLevel, string> = {
  BLUE_ALERT: '/audio/blue.mp3',
  YELLOW_ALERT: '/audio/yellow.mp3',
  RED_ALERT: '/audio/red.mp3',
};

export function TicketDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const { muted, toggleMute } = useMute();
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [responseBody, setResponseBody] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const playedForId = useRef<string | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const t = await Api.getTransmission(id);
    setTransmission(t);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!transmission || muted) return;
    if (playedForId.current === transmission.id) return;
    playedForId.current = transmission.id;
    const audio = new Audio(AUDIO_SRC[transmission.alertLevel]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, [transmission, muted]);

  async function handleRespond() {
    if (!responseBody.trim()) return;
    setActionError('');
    try {
      await Api.respondToTransmission(id, responseBody.trim());
      setResponseBody('');
      load(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not submit response.');
    }
  }

  async function handleStatusChange(status: TransmissionStatus) {
    setActionError('');
    try {
      await Api.updateTransmission(id, { status });
      load(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update status.');
    }
  }

  async function handleAlertLevelChange(alertLevel: AlertLevel) {
    setActionError('');
    try {
      await Api.updateTransmission(id, { alertLevel });
      load(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update alert level.');
    }
  }

  async function handleAddTag() {
    const name = newTag.trim().toLowerCase().replace(/\s+/g, '_');
    if (!name || !transmission) return;
    const currentNames = (transmission.tags || []).map((t) => t.name);
    if (currentNames.includes(name)) {
      setNewTag('');
      return;
    }
    setActionError('');
    try {
      await Api.updateTransmission(id, { tagNames: [...currentNames, name] });
      setNewTag('');
      load(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not add tag.');
    }
  }

  async function handleRemoveTag(name: string) {
    if (!transmission) return;
    const currentNames = (transmission.tags || []).map((t) => t.name);
    setActionError('');
    try {
      await Api.updateTransmission(id, { tagNames: currentNames.filter((n) => n !== name) });
      load(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not remove tag.');
    }
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
  const tags = transmission.tags || [];
  const themeClass = THEME_CLASS[transmission.alertLevel];

  return (
    <div className={themeClass}>
      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>&larr; Back</a>

      <div className="detail-grid" style={{ marginTop: 16 }}>
        <div className="panel" style={{ marginBottom: 0 }}>
          {actionError && <p className="error-text" style={{ marginTop: 0, marginBottom: 12 }}>{actionError}</p>}
          <p className="ticket-meta">
            {new Date(transmission.createdAt).toLocaleString()} · STATUS: {transmission.status.replace('_', ' ')}
          </p>
          <h2 style={{ color: 'var(--text)', fontSize: 16, textTransform: 'none', letterSpacing: 0, marginTop: 4 }}>
            {transmission.subject}
          </h2>
          <p style={{ lineHeight: 1.6 }}>{transmission.description}</p>

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

        <aside className="sidebar">
          <div className={`alert-banner alert-banner-compact ${BANNER_CLASS[transmission.alertLevel]}`}>
            <span>{BANNER_LABEL[transmission.alertLevel]}</span>
            <button type="button" className="mute-toggle" onClick={toggleMute}>
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          <div className="panel sidebar-panel" style={{ marginBottom: 0 }}>
          <div className="sidebar-section">
            <div className="sidebar-label">Sender (Login)</div>
            <div className="sidebar-value">{transmission.sender?.email || 'unknown'}</div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Notify Email</div>
            <div className="sidebar-value">{transmission.notifyEmail || '— none —'}</div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Alert Level</div>
            <div className="alert-level-buttons">
              <button
                type="button"
                className={transmission.alertLevel === 'BLUE_ALERT' ? 'active-blue' : 'inactive'}
                onClick={() => handleAlertLevelChange('BLUE_ALERT')}
              >
                Blue
              </button>
              <button
                type="button"
                className={transmission.alertLevel === 'YELLOW_ALERT' ? 'active-yellow' : 'inactive'}
                onClick={() => handleAlertLevelChange('YELLOW_ALERT')}
              >
                Yellow
              </button>
              <button
                type="button"
                className={transmission.alertLevel === 'RED_ALERT' ? 'active-red' : 'inactive'}
                onClick={() => handleAlertLevelChange('RED_ALERT')}
              >
                Red
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Tags</div>
            <div className="tag-chips">
              {tags.length ? (
                tags.map((t) => (
                  <span key={t.id} className="tag-chip">
                    {t.name}
                    <button type="button" onClick={() => handleRemoveTag(t.name)} aria-label={`Remove ${t.name}`}>
                      &times;
                    </button>
                  </span>
                ))
              ) : (
                <span className="ticket-meta">No tags yet.</span>
              )}
            </div>
            <div className="tag-add-row">
              <input
                type="text"
                placeholder="new_tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <button type="button" className="ghost" onClick={handleAddTag}>Add</button>
            </div>
          </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
