const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export type AlertLevel = 'BLUE_ALERT' | 'YELLOW_ALERT' | 'RED_ALERT';
export type TransmissionStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'RESOLVED';
export type Role = 'CREW' | 'OFFICER';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface Tag {
  id: string;
  name: string;
}

export interface LogEntry {
  id: string;
  body: string;
  transmissionId: string;
  officerId: string;
  createdAt: string;
  officer?: { email: string };
}

export interface Transmission {
  id: string;
  subject: string;
  description: string;
  alertLevel: AlertLevel;
  status: TransmissionStatus;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  sender?: { email: string };
  tags?: Tag[];
  logEntries?: LogEntry[];
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dss_token');
}

function clearSession() {
  localStorage.removeItem('dss_token');
  localStorage.removeItem('dss_user');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export const Api = {
  async login(email: string, password: string) {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('dss_token', data.access_token);
    localStorage.setItem('dss_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    clearSession();
  },

  isLoggedIn() {
    return !!getToken();
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('dss_user');
    return raw ? JSON.parse(raw) : null;
  },

  async createTransmission({
    subject,
    description,
    notifyEmail,
  }: {
    subject: string;
    description: string;
    notifyEmail?: string;
  }) {
    const created = await request<Transmission>('/transmissions', {
      method: 'POST',
      body: JSON.stringify({ subject, description, notifyEmail: notifyEmail || undefined }),
    });

    // Fire-and-forget: hand off to n8n for AI triage (alert level + tags).
    // NOTE: n8n workflow still needs its Directus nodes repointed to this API
    // before this actually classifies anything (tracked as a separate step).
    if (N8N_WEBHOOK_URL) {
      const sender = this.getCurrentUser();
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transmission_id: created.id,
          subject: created.subject,
          description: created.description,
          sender_email: notifyEmail || sender?.email || '',
        }),
      }).catch(() => {});
    }

    return created;
  },

  // Single endpoint for both portals — the backend filters by role from the JWT.
  // Crew gets only their own transmissions; Officer gets all of them.
  async listTransmissions(): Promise<Transmission[]> {
    return request<Transmission[]>('/transmissions');
  },

  // Includes nested tags and logEntries — no separate log-entries call needed.
  async getTransmission(id: string): Promise<Transmission> {
    return request<Transmission>(`/transmissions/${id}`);
  },

  async respondToTransmission(transmissionId: string, body: string) {
    return request<LogEntry>('/log-entries', {
      method: 'POST',
      body: JSON.stringify({ transmissionId, body }),
    });
  },

  async updateTransmissionStatus(id: string, status: TransmissionStatus) {
    return request<Transmission>(`/transmissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
