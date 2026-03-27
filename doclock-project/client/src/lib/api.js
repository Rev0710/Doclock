import api from '../services/api.js';
import { specialtyAndDoctorFromService } from '../utils/appointmentDisplay.js';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const AVATAR_KEY = 'doclock_avatar';

/** Stable unique image per account: uploaded `user.avatar`, else DiceBear from id/email/name. */
export function getProfileImageSrc(user) {
  if (!user) return null;
  const a = user.avatar;
  if (typeof a === 'string' && a.trim().length > 0) return a.trim();
  const seed = encodeURIComponent(String(user.email || user.name || user._id || user.id || 'user'));
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
}

/**
 * Avatar for the provider on appointment rows — not the signed-in patient's photo.
 * Uses linked doctor account `avatar` when present; otherwise a stable initials-style image from doctor id or name.
 */
export function getAppointmentDoctorImageSrc(appt) {
  if (!appt || typeof appt !== 'object') {
    return `https://api.dicebear.com/7.x/initials/svg?seed=appointment&backgroundType=gradientLinear`;
  }
  const d = appt.doctor;
  if (d && typeof d === 'object') {
    const a = d.avatar;
    if (typeof a === 'string' && a.trim().length > 0) return a.trim();
    const seed = encodeURIComponent(String(d._id || d.id || d.name || 'doctor'));
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
  }
  const { doctor } = specialtyAndDoctorFromService(appt.service);
  const seed = encodeURIComponent(String(doctor || appt._id || appt.id || 'appointment'));
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
}

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
  const u = getAuthUser();
  if (u) {
    setAuthUser({ ...u, avatar: dataUrl ? String(dataUrl) : '' });
  }
  try {
    localStorage.removeItem(AVATAR_KEY);
  } catch {
    /* ignore */
  }
}

/** @deprecated Prefer `getProfileImageSrc(user)` with `useAuth().user` */
export function getAvatarDataUrl() {
  const u = getAuthUser();
  if (u?.avatar) return u.avatar;
  return localStorage.getItem(AVATAR_KEY) || '';
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
  async getAdminStats() {
    const { data } = await api.get('/appointments/admin/stats');
    return data;
  },
  async getRecentPatients(limit = 10) {
    const { data } = await api.get('/appointments/admin/recent-patients', { params: { limit } });
    return data;
  },
  async getPaymentsReceived() {
    const { data } = await api.get('/appointments/admin/payments');
    return data;
  },
};
