import { Transmission } from '@/lib/api';
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
              {new Date(t.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SignalIndicator level={t.alertLevel || 'BLUE_ALERT'} />
            <span className="status-tag">{(t.status || 'UNKNOWN').replace('_', ' ')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
