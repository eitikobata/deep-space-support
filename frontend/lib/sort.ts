import { Transmission, AlertLevel } from './api';

const URGENCY_ORDER: Record<AlertLevel, number> = {
  RED_ALERT: 0,
  YELLOW_ALERT: 1,
  BLUE_ALERT: 2,
};

/** Red alerts first, then yellow, then blue. Ties broken by most recent first. */
export function sortByUrgency(tickets: Transmission[]): Transmission[] {
  return [...tickets].sort((a, b) => {
    const urgencyDiff = URGENCY_ORDER[a.alertLevel] - URGENCY_ORDER[b.alertLevel];
    if (urgencyDiff !== 0) return urgencyDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** Most recently created first — no urgency weighting. */
export function sortNewestFirst(tickets: Transmission[]): Transmission[] {
  return [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
