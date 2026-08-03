'use client';

import { useState, useCallback, useEffect } from 'react';
import { Api, AUTH_EVENT } from '@/lib/api';

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLoggedIn(Api.isLoggedIn());
    setReady(true);

    const handler = () => setLoggedIn(Api.isLoggedIn());
    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await Api.login(email, password);
    setLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    Api.logout();
    setLoggedIn(false);
  }, []);

  return { loggedIn, ready, login, logout };
}
