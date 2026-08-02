'use client';

import { useState, useEffect, useCallback } from 'react';

const MUTE_KEY = 'dss_muted';
const MUTE_EVENT = 'dss-mute-changed';

function readMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function useMute() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(readMuted());
    const handler = () => setMuted(readMuted());
    window.addEventListener(MUTE_EVENT, handler);
    return () => window.removeEventListener(MUTE_EVENT, handler);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !readMuted();
    localStorage.setItem(MUTE_KEY, String(next));
    window.dispatchEvent(new Event(MUTE_EVENT));
  }, []);

  return { muted, toggleMute };
}
