import api from '../services/api.js';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const AVATAR_KEY = 'doclock_avatar';

export function setAuthToken(token) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthUser(user) {
  if (!user) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAvatarDataUrl(dataUrl) {
  if (!dataUrl) localStorage.removeItem(AVATAR_KEY);
  else localStorage.setItem(AVATAR_KEY, dataUrl);
}

export function getAvatarDataUrl() {
  return localStorage.getItem(AVATAR_KEY);
}

function normalizeApiUrl(path) {
  let p = path.replace(/^\//, '');
  if (p.startsWith('api/')) p = p.slice(4);
  return p.startsWith('/') ? p : `/${p}`;
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const url = normalizeApiUrl(path);
  try {
    const res = await api.request({
      method,
      url,
      data: body,
      headers: { ...headers },
    });
    return res.data;
  } catch (e) {
    const msg = e.response?.data?.message || e.message || `Request failed`;
    throw new Error(typeof msg === 'string' ? msg : 'Request failed');
  }
}

export const authApi = {
  async login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const adminApi = {
  async getAvailability() {
    const { data } = await api.get('/users/availability');
    return data;
  },
  async updateAvailability(availability) {
    const { data } = await api.put('/users/availability', { availability });
    return data;
  },
  async getAppointmentRequests() {
    const { data } = await api.get('/appointments/admin/requests');
    return data;
  },
  async updateAppointmentStatus(id, status) {
    const { data } = await api.patch(`/appointments/${id}/status`, { status });
    return data;
  },
  async getTodayAppointments() {
    const { data } = await api.get('/appointments/admin/today');
    return data;
  },
  async getPaymentsReceived() {
    const { data } = await api.get('/appointments/admin/payments');
    return data;
  },
};
