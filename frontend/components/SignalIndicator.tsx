import { AlertLevel } from '@/lib/directus';

export function SignalIndicator({ level }: { level: AlertLevel }) {
  return (
    <span className={`signal ${level}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
}
