const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;

export type AlertLevel = 'green_alert' | 'yellow_alert' | 'red_alert';
export type TransmissionStatus = 'active' | 'under_review' | 'resolved';

export interface Transmission {
  id: string;
  subject: string;
  description: string;
  alert_level: AlertLevel;
  status: TransmissionStatus;
  date_created: string;
  sender?: { email: string };
  tags?: { tags_id: { name: string } }[];
}

export interface LogEntry {
  id: string;
  body: string;
  date_created: string;
  officer?: { email: string };
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dss_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('dss_token');
    localStorage.removeItem('dss_refresh');
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  if (res.status === 204) return null as T;
  return res.json();
}

export const Api = {
  async login(email: string, password: string) {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const { data } = await res.json();
    localStorage.setItem('dss_token', data.access_token);
    localStorage.setItem('dss_refresh', data.refresh_token);
    return data;
  },

  logout() {
    localStorage.removeItem('dss_token');
    localStorage.removeItem('dss_refresh');
  },

  isLoggedIn() {
    return !!getToken();
  },

  async getMe(): Promise<{ id: string; email: string }> {
    const { data } = await request<{ data: { id: string; email: string } }>('/users/me?fields=id,email');
    return data;
  },

  async createTransmission({ subject, description, notifyEmail }: { subject: string; description: string; notifyEmail?: string }) {
  await request('/items/transmissions', {
    method: 'POST',
    body: JSON.stringify({ subject, description, alert_level: 'green_alert', status: 'active' }),
  });

  const { data: recent } = await request<{ data: Transmission[] }>(
    `/items/transmissions?filter[subject][_eq]=${encodeURIComponent(subject)}&sort=-date_created&limit=1&fields=id,subject,description`
  );
  const created = recent[0];

    let senderEmail = notifyEmail || '';
    if (!senderEmail) {
      try {
        const me = await this.getMe();
        senderEmail = me.email;
      } catch {}
    }

  if (created) {
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transmission_id: created.id,
        subject: created.subject,
        description: created.description,
        sender_email: senderEmail,
      }),
    }).catch(() => {});
  }

  return created;
},

  async listMyTransmissions(): Promise<Transmission[]> {
    const { data } = await request<{ data: Transmission[] }>(
      '/items/transmissions?sort=-date_created&fields=id,subject,status,alert_level,date_created'
    );
    return data;
  },

  async listAllTransmissions(): Promise<Transmission[]> {
    const { data } = await request<{ data: Transmission[] }>(
      '/items/transmissions?sort=-date_created&fields=id,subject,description,status,alert_level,date_created,sender.email'
    );
    return data;
  },

  async getTransmission(id: string): Promise<Transmission> {
    const { data } = await request<{ data: Transmission }>(
      `/items/transmissions/${id}?fields=id,subject,description,status,alert_level,date_created,sender.email,tags.tags_id.name`
    );
    return data;
  },

  async getLogEntries(transmissionId: string): Promise<LogEntry[]> {
    const { data } = await request<{ data: LogEntry[] }>(
      `/items/log_entries?filter[transmission][_eq]=${transmissionId}&sort=date_created&fields=id,body,date_created,officer.email`
    );
    return data;
  },

  async respondToTransmission(transmissionId: string, body: string) {
    const me = await this.getMe();
    await request('/items/log_entries', {
      method: 'POST',
      body: JSON.stringify({ transmission: transmissionId, officer: me.id, body }),
    });
  },

  async updateTransmissionStatus(id: string, status: TransmissionStatus) {
    await request(`/items/transmissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
