import { AlertLevel } from '@/lib/api';

const LEVEL_CLASS: Record<AlertLevel, string> = {
  BLUE_ALERT: 'blue_alert',
  YELLOW_ALERT: 'yellow_alert',
  RED_ALERT: 'red_alert',
};

export function SignalIndicator({ level }: { level: AlertLevel }) {
  return <span className={`signal-rect ${LEVEL_CLASS[level]}`} />;
}
