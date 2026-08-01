import { Transmission } from '@/lib/directus';
import { SignalIndicator } from './SignalIndicator';

export function TicketList({
  tickets,
  showSender = false,
  onSelect,
}: {
  tickets: Transmission[];
  showSender?: boolean;
  onSelect?: (id: string) => void;
}) {
  if (!tickets.length) {
    return <p className="empty-state">No transmissions logged yet.</p>;
  }

  return (
    <div>
      {tickets.map((t) => (
        <div
          key={t.id}
          className="ticket"
          onClick={() => onSelect?.(t.id)}
          style={{ cursor: onSelect ? 'pointer' : 'default' }}
        >
          <div>
            <div className="ticket-subject">{t.subject}</div>
            <div className="ticket-meta">
              {showSender && t.sender ? `${t.sender.email} · ` : ''}
              {new Date(t.date_created).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SignalIndicator level={t.alert_level || 'green_alert'} />
            <span className="status-tag">{(t.status || 'unknown').replace('_', ' ')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
