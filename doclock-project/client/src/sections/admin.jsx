import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import docLogo from '../assets/doc2.png';
import { adminApi, getAuthUser, getAvatarDataUrl } from '../lib/api';

const NavIcon = ({ children }) => (
  <span className="home-navIcon" aria-hidden="true">
    {children}
  </span>
);

const defaultScheduleWeek = () => [
  { key: 'mon', label: 'Monday', available: true, start: '09:00', end: '17:00' },
  { key: 'tue', label: 'Tuesday', available: true, start: '09:00', end: '17:00' },
  { key: 'wed', label: 'Wednesday', available: true, start: '09:00', end: '17:00' },
  { key: 'thu', label: 'Thursday', available: true, start: '09:00', end: '17:00' },
  { key: 'fri', label: 'Friday', available: true, start: '09:00', end: '17:00' },
  { key: 'sat', label: 'Saturday', available: false, start: '09:00', end: '13:00' },
  { key: 'sun', label: 'Sunday', available: false, start: '09:00', end: '13:00' },
];

function mergeScheduleWithDefaults(saved) {
  const defaults = defaultScheduleWeek();
  const byKey = Object.fromEntries(saved.map((d) => [d.key, d]));
  return defaults.map((d) => {
    const s = byKey[d.key];
    if (!s) return d;
    return {
      ...d,
      available: typeof s.available === 'boolean' ? s.available : d.available,
      start: typeof s.start === 'string' ? s.start : d.start,
      end: typeof s.end === 'string' ? s.end : d.end,
    };
  });
}

/** Sample data for My Patients → Today Appointments (matches product mockup). */
const TODAY_APPOINTMENTS = [
  {
    id: '1',
    initials: 'JS',
    name: 'Jhon Smith',
    type: 'Clinic Consulting',
    avatarBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    right: { kind: 'status', label: 'Ongoing' },
  },
  {
    id: '2',
    initials: 'FM',
    name: 'Frank Murray',
    type: 'Clinic Consulting',
    avatarBg: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    right: { kind: 'time', value: '10:25' },
  },
  {
    id: '3',
    initials: 'EL',
    name: 'Ella Lucia',
    type: 'Clinic Consulting',
    avatarBg: 'linear-gradient(135deg, #f472b6, #db2777)',
    right: { kind: 'time', value: '11:30' },
  },
  {
    id: '4',
    initials: 'AD',
    name: 'Alyssa Dehn',
    type: 'Clinic Consulting',
    avatarBg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    right: { kind: 'time', value: '12:20' },
  },
];

const APPOINTMENT_REQUESTS_INITIAL = [
  {
    id: '1',
    initials: 'BK',
    name: 'Bogdan Krivenchenko',
    detail: '45 Male, 12 April 9:30',
    avatarBg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    status: 'declined',
  },
  {
    id: '2',
    initials: 'JW',
    name: 'Jenny Wilson',
    detail: 'Female, 25 April 10:30 AM',
    avatarBg: 'linear-gradient(135deg,#f472b6,#ec4899)',
    status: 'confirmed',
  },
  {
    id: '3',
    initials: 'DR',
    name: 'Dianne Russel',
    detail: 'Male, 45 Today 14:30 PM',
    avatarBg: 'linear-gradient(135deg,#34d399,#10b981)',
    status: 'confirmed',
  },
  {
    id: '4',
    initials: 'AB',
    name: 'Annette Black',
    detail: 'Male, 45 Today 14:30 PM',
    avatarBg: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
    status: 'declined',
  },
  {
    id: '5',
    initials: 'AJ',
    name: 'Angelina Jully',
    detail: 'Male, 45 Today 14:30 PM',
    avatarBg: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
    status: 'confirmed',
  },
];

/** Payments the doctor has received (mock data). */
const PAYMENTS_RECEIVED = [
  {
    id: '1',
    patient: 'Jenny Wilson',
    detail: 'Clinic consultation',
    date: 'Mar 22, 2026',
    amount: 650,
    ref: 'TXN-2401',
  },
  {
    id: '2',
    patient: 'Dianne Russel',
    detail: 'Follow-up visit',
    date: 'Mar 21, 2026',
    amount: 400,
    ref: 'TXN-2400',
  },
  {
    id: '3',
    patient: 'Frank Murray',
    detail: 'Video consultation',
    date: 'Mar 20, 2026',
    amount: 120,
    ref: 'TXN-2399',
  },
  {
    id: '4',
    patient: 'Ella Lucia',
    detail: 'Clinic consultation',
    date: 'Mar 19, 2026',
    amount: 650,
    ref: 'TXN-2398',
  },
  {
    id: '5',
    patient: 'Alyssa Dehn',
    detail: 'Lab review',
    date: 'Mar 18, 2026',
    amount: 95,
    ref: 'TXN-2397',
  },
];

function formatMoneyPhp(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

const PAYMENTS_RECEIVED_TOTAL = PAYMENTS_RECEIVED.reduce((sum, p) => sum + p.amount, 0);

const css = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
.admin-root {
  --blue: #2563eb;
  --blue-light: #eff6ff;
  --blue-mid: #93c5fd;
  --purple: #7c3aed;
  --pink: #ec4899;
  --orange: #f59e0b;
  --green: #10b981;
  --red: #ef4444;
  --bg: #f8fafc;
  --sidebar: #ffffff;
  --white: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --card: #ffffff;
  --active-nav: #1e40af;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.admin-root.home-page.home-dashboard {
  width: 100vw;
  padding: 0;
}
.admin-root .home-sidebarLogo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px 4px;
}
.admin-root .admin-brand-logo {
  width: 100%;
  max-width: 152px;
  height: auto;
  display: block;
  object-fit: contain;
}
.admin-root .avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: white; flex-shrink: 0;
  overflow: hidden;
}
.admin-root .avatar img { width: 100%; height: 100%; object-fit: cover; }
.admin-root .user-info { line-height: 1.3; }
.admin-root .user-name { font-size: 13px; font-weight: 600; color: var(--text); }
.admin-root .user-role { font-size: 11px; color: var(--muted); }
.admin-root .page { display: none; flex: 1; overflow-y: auto; }
.admin-root .page.active { display: flex; flex-direction: column; }
.admin-root .overview-content { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.admin-root .welcome-row { display: flex; align-items: flex-start; justify-content: space-between; }
.admin-root .welcome-row h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.admin-root .welcome-row p { font-size: 13px; color: var(--muted); margin-top: 2px; }
.admin-root .stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.admin-root .stat-card {
  border-radius: 14px; padding: 16px 18px;
  display: flex; align-items: center; gap: 12px;
  color: white; position: relative; overflow: hidden;
}
.admin-root .stat-card::after {
  content: ''; position: absolute; right: -10px; top: -10px;
  width: 70px; height: 70px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
}
.admin-root .stat-card.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.admin-root .stat-card.pink { background: linear-gradient(135deg, #f472b6, #ec4899); }
.admin-root .stat-card.orange { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.admin-root .stat-card.cyan { background: linear-gradient(135deg, #22d3ee, #06b6d4); }
.admin-root .stat-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.admin-root .stat-icon svg { width: 18px; height: 18px; stroke: white; fill: none; stroke-width: 2; }
.admin-root .stat-num { font-size: 20px; font-weight: 700; }
.admin-root .stat-lbl { font-size: 11px; opacity: 0.85; }
.admin-root .three-col { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 16px; }
.admin-root .panel { background: var(--white); border-radius: 14px; border: 1px solid var(--border); padding: 16px; }
.admin-root .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.admin-root .panel-title { font-size: 14px; font-weight: 600; }
.admin-root .view-all { font-size: 12px; color: var(--blue); cursor: pointer; font-weight: 500; background: none; border: none; padding: 0; font: inherit; }
.admin-root .view-all:hover { text-decoration: underline; }
.admin-root .appt-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--bg);
}
.admin-root .appt-row:last-child { border-bottom: none; }
.admin-root .appt-info { flex: 1; min-width: 0; }
.admin-root .appt-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-root .appt-sub { font-size: 11px; color: var(--muted); }
.admin-root .badge {
  font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 20px;
  white-space: nowrap; flex-shrink: 0;
}
.admin-root .badge.declined { background: #fee2e2; color: #dc2626; }
.admin-root .badge.confirmed { background: #dcfce7; color: #16a34a; }
.admin-root .badge.ongoing { background: #dbeafe; color: #2563eb; }
.admin-root .badge.pending { background: #fef9c3; color: #ca8a04; }
.admin-root .patient-stat { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--bg); }
.admin-root .patient-stat:last-child { border-bottom: none; }
.admin-root .ps-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.admin-root .ps-icon svg { width: 18px; height: 18px; fill: none; stroke-width: 2; }
.admin-root .ps-num { font-size: 17px; font-weight: 700; }
.admin-root .ps-lbl { font-size: 11px; color: var(--muted); }
.admin-root .ps-trend { margin-left: auto; font-size: 11px; font-weight: 600; color: var(--green); }
.admin-root .donut-wrap { display: flex; justify-content: center; padding: 8px 0; }
.admin-root .donut-legend { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.admin-root .legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); }
.admin-root .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.admin-root .today-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--bg);
}
.admin-root .today-row:last-child { border-bottom: none; }
.admin-root .today-name { font-size: 13px; font-weight: 500; flex: 1; }
.admin-root .today-sub { font-size: 11px; color: var(--muted); }
.admin-root .today-time { font-size: 11px; color: var(--muted); }
.admin-root .recent-table { background: var(--white); border-radius: 14px; border: 1px solid var(--border); overflow: hidden; }
.admin-root .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr 0.5fr; padding: 10px 16px; background: var(--bg); border-bottom: 1px solid var(--border); }
.admin-root .th { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.admin-root .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr 0.5fr; padding: 10px 16px; border-bottom: 1px solid var(--bg); align-items: center; transition: background 0.15s; }
.admin-root .table-row:last-child { border-bottom: none; }
.admin-root .table-row:hover { background: var(--bg); }
.admin-root .td { font-size: 12px; color: var(--text); }
.admin-root .td.muted { color: var(--muted); }
.admin-root .td-name { display: flex; align-items: center; gap: 8px; }
.admin-root .msg-layout { display: flex; flex: 1; overflow: hidden; }
.admin-root .msg-list-panel {
  width: 240px; border-right: 1px solid var(--border);
  display: flex; flex-direction: column; flex-shrink: 0;
  background: var(--white);
}
.admin-root .msg-list-header { padding: 16px; border-bottom: 1px solid var(--border); }
.admin-root .msg-list-header h2 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
.admin-root .search-msg {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; padding: 7px 10px;
  font-size: 12px; color: var(--muted);
}
.admin-root .search-msg svg { width: 13px; height: 13px; stroke: var(--muted); fill: none; stroke-width: 2; flex-shrink: 0; }
.admin-root .recent-label { padding: 10px 16px 6px; font-size: 12px; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; }
.admin-root .chat-list { flex: 1; overflow-y: auto; }
.admin-root .chat-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer; transition: background 0.15s;
  border-left: 3px solid transparent;
}
.admin-root .chat-item:hover { background: var(--bg); }
.admin-root .chat-item.active { background: var(--blue-light); border-left-color: var(--blue); }
.admin-root .chat-info { flex: 1; min-width: 0; }
.admin-root .chat-name { font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
.admin-root .chat-time { font-size: 10px; color: var(--muted); }
.admin-root .chat-preview { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.admin-root .chat-preview.ongoing { color: var(--blue); font-weight: 500; }
.admin-root .msg-chat-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.admin-root .chat-header {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; border-bottom: 1px solid var(--border);
  background: var(--white); flex-shrink: 0;
}
.admin-root .chat-header-info { flex: 1; }
.admin-root .chat-header-name { font-size: 14px; font-weight: 600; }
.admin-root .chat-header-status { font-size: 12px; color: var(--green); font-weight: 500; }
.admin-root .chat-header-actions { display: flex; gap: 10px; }
.admin-root .messages-area { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; background: var(--bg); }
.admin-root .msg-bubble-wrap { display: flex; align-items: flex-end; gap: 8px; }
.admin-root .msg-bubble-wrap.right { flex-direction: row-reverse; }
.admin-root .bubble {
  max-width: 320px; padding: 10px 14px;
  border-radius: 16px; font-size: 13px; line-height: 1.5;
  position: relative;
}
.admin-root .bubble.left { background: var(--white); color: var(--text); border-bottom-left-radius: 4px; }
.admin-root .bubble.right { background: var(--blue); color: white; border-bottom-right-radius: 4px; }
.admin-root .bubble-time { font-size: 10px; color: var(--muted); margin-top: 4px; }
.admin-root .bubble-time.right { text-align: right; }
.admin-root .bubble-time .check { color: var(--blue); }
.admin-root .context-menu {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 10px; padding: 4px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  min-width: 110px;
}
.admin-root .ctx-item { padding: 8px 16px; font-size: 13px; cursor: pointer; transition: background 0.15s; color: var(--text); }
.admin-root .ctx-item:hover { background: var(--bg); }
.admin-root .audio-bubble {
  background: var(--blue); border-radius: 14px; border-bottom-right-radius: 4px;
  padding: 10px 14px; display: flex; align-items: center; gap: 10px; min-width: 180px;
}
.admin-root .play-btn { width: 28px; height: 28px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.admin-root .play-btn svg { width: 12px; height: 12px; fill: white; }
.admin-root .audio-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; position: relative; }
.admin-root .audio-progress { height: 100%; width: 55%; background: white; border-radius: 2px; position: relative; }
.admin-root .audio-progress::after { content: ''; position: absolute; right: -5px; top: -4px; width: 12px; height: 12px; background: white; border-radius: 50%; }
.admin-root .audio-time { font-size: 12px; color: rgba(255,255,255,0.8); }
.admin-root .chat-input-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; background: var(--white); border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.admin-root .chat-input {
  flex: 1; border: none; outline: none; font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: var(--text); background: transparent;
}
.admin-root .chat-input::placeholder { color: var(--muted); }
.admin-root .input-actions { display: flex; gap: 8px; align-items: center; }
.admin-root .input-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
.admin-root .input-icon:hover { background: var(--bg); }
.admin-root .input-icon svg { width: 16px; height: 16px; stroke: var(--muted); fill: none; stroke-width: 1.8; }
.admin-root .send-btn { width: 34px; height: 34px; background: var(--blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
.admin-root .send-btn:hover { background: #1d4ed8; }
.admin-root .send-btn svg { width: 16px; height: 16px; stroke: white; fill: none; stroke-width: 2; }
.admin-root .settings-layout { display: flex; flex: 1; overflow: hidden; gap: 0; }
.admin-root .profile-sidebar {
  width: 200px; border-right: 1px solid var(--border);
  padding: 24px 16px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; background: var(--white); flex-shrink: 0;
}
.admin-root .profile-avatar-wrap { position: relative; }
.admin-root .profile-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700; color: white; overflow: hidden;
}
.admin-root .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.admin-root .profile-name { font-size: 15px; font-weight: 700; text-align: center; }
.admin-root .profile-spec { font-size: 12px; color: var(--muted); }
.admin-root .edit-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--blue); color: white; border: none;
  padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background 0.2s;
}
.admin-root .edit-btn:hover { background: #1d4ed8; }
.admin-root .edit-btn svg { width: 12px; height: 12px; stroke: white; fill: none; stroke-width: 2; }
.admin-root .ratings-label { font-size: 12px; font-weight: 600; color: var(--muted); }
.admin-root .stars { color: #f59e0b; font-size: 16px; letter-spacing: 2px; }
.admin-root .trust-row { width: 100%; }
.admin-root .trust-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 4px; }
.admin-root .trust-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.admin-root .trust-fill { height: 100%; background: var(--green); border-radius: 3px; }
.admin-root .profile-main { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; background: var(--bg); }
.admin-root .profile-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); }
.admin-root .tab-item {
  padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--muted);
  cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all 0.18s;
}
.admin-root .tab-item:hover { color: var(--text); }
.admin-root .tab-item.active { color: var(--blue); border-bottom-color: var(--blue); }
.admin-root .reviews-list { display: flex; flex-direction: column; gap: 12px; }
.admin-root .review-card {
  background: var(--white); border-radius: 12px; border: 1px solid var(--border);
  padding: 14px 16px; transition: box-shadow 0.2s;
}
.admin-root .review-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.admin-root .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.admin-root .review-info { flex: 1; }
.admin-root .reviewer-name { font-size: 13px; font-weight: 600; }
.admin-root .reviewer-role { font-size: 11px; color: var(--muted); }
.admin-root .review-meta { text-align: right; }
.admin-root .review-stars { color: #f59e0b; font-size: 13px; }
.admin-root .review-date { font-size: 11px; color: var(--muted); }
.admin-root .review-text { font-size: 12px; color: var(--muted); line-height: 1.65; }
.admin-root .schedule-page { padding: 24px; max-width: 720px; }
.admin-root .schedule-head { margin-bottom: 20px; }
.admin-root .schedule-head h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
.admin-root .schedule-head p { font-size: 13px; color: var(--muted); margin-top: 6px; line-height: 1.5; }
.admin-root .schedule-card {
  background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 8px 0;
  margin-bottom: 16px;
}
.admin-root .schedule-dayRow {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--bg);
}
.admin-root .schedule-dayRow:last-child { border-bottom: none; }
@media (max-width: 640px) {
  .admin-root .schedule-dayRow { grid-template-columns: 1fr; gap: 10px; }
}
.admin-root .schedule-dayName { font-size: 14px; font-weight: 600; color: var(--text); }
.admin-root .schedule-availToggle {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.admin-root .schedule-availToggle label {
  font-size: 12px; font-weight: 500; color: var(--muted); cursor: pointer;
  user-select: none; display: flex; align-items: center; gap: 8px;
}
.admin-root .schedule-availToggle input[type="checkbox"] {
  width: 18px; height: 18px; accent-color: var(--blue); cursor: pointer;
}
.admin-root .schedule-times {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  justify-content: flex-end;
}
.admin-root .schedule-times label { font-size: 11px; color: var(--muted); font-weight: 500; }
.admin-root .schedule-timeInput {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; padding: 8px 10px; border: 1px solid var(--border);
  border-radius: 8px; background: var(--white); color: var(--text);
  min-width: 118px;
}
.admin-root .schedule-timeInput:focus { outline: none; border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.admin-root .schedule-unavailable { font-size: 12px; color: var(--muted); font-style: italic; text-align: right; }
.admin-root .schedule-actions { display: flex; gap: 10px; margin-top: 8px; }
.admin-root .schedule-save {
  background: var(--blue); color: white; border: none; padding: 10px 20px;
  border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.2s;
}
.admin-root .schedule-save:hover { background: #1d4ed8; }
.admin-root .schedule-saved {
  font-size: 12px; color: var(--green); font-weight: 600; align-self: center;
}
.admin-root .patients-page { padding: 24px; max-width: 560px; }
.admin-root .today-appt-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 0 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.admin-root .today-appt-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  padding: 0 18px 14px;
  border-bottom: 1px solid var(--bg);
  margin-bottom: 4px;
}
.admin-root .today-appt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid #f1f5f9;
}
.admin-root .today-appt-row:last-child { border-bottom: none; }
.admin-root .today-appt-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.admin-root .today-appt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.admin-root .today-appt-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
}
.admin-root .today-appt-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}
.admin-root .today-appt-right { flex-shrink: 0; }
.admin-root .today-appt-time {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}
.admin-root .today-appt-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
}
.admin-root .apptreq-page { padding: 24px; max-width: 640px; }
.admin-root .apptreq-page .panel { padding: 0 16px 16px; }
.admin-root .apptreq-page .panel-header {
  padding: 16px 4px 14px;
  margin-bottom: 0;
  border-bottom: 1px solid #f1f5f9;
}
.admin-root .apptreq-page .appt-row {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.admin-root .apptreq-page .appt-name { font-weight: 600; font-size: 13px; }
.admin-root .apptreq-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
.admin-root .apptreq-btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.admin-root .apptreq-btn:hover { background: var(--bg); }
.admin-root .apptreq-btnConfirm.apptreq-btn--active {
  background: #e8f5e9;
  color: #2e7d32;
  border-color: #c8e6c9;
}
.admin-root .apptreq-btnDecline.apptreq-btn--active {
  background: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}
.admin-root .pay-page { padding: 24px; max-width: 720px; }
.admin-root .pay-head { margin-bottom: 20px; }
.admin-root .pay-head h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
.admin-root .pay-head p { font-size: 13px; color: var(--muted); margin-top: 6px; line-height: 1.5; }
.admin-root .pay-summary {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #a7f3d0;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.admin-root .pay-summary-label { font-size: 12px; font-weight: 600; color: #047857; text-transform: uppercase; letter-spacing: 0.04em; }
.admin-root .pay-summary-value { font-size: 28px; font-weight: 800; color: #065f46; letter-spacing: -0.03em; }
.admin-root .pay-summary-hint { font-size: 11px; color: #059669; opacity: 0.9; }
.admin-root .pay-panel .panel-header { margin-bottom: 0; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
.admin-root .pay-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.admin-root .pay-row:last-child { border-bottom: none; }
.admin-root .pay-patient { font-size: 14px; font-weight: 600; color: var(--text); }
.admin-root .pay-detail { font-size: 12px; color: var(--muted); margin-top: 3px; }
.admin-root .pay-meta { font-size: 11px; color: #94a3b8; margin-top: 4px; }
.admin-root .pay-right { text-align: right; flex-shrink: 0; }
.admin-root .pay-amount { font-size: 13px; font-weight: 700; color: #059669; }
.admin-root .pay-badge {
  display: inline-block;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  background: #dcfce7;
  color: #16a34a;
}
.admin-root ::-webkit-scrollbar { width: 4px; }
.admin-root ::-webkit-scrollbar-track { background: transparent; }
.admin-root ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`;

function AvatarImg({ src, initials, className = 'avatar', style }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className} style={style}>
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        initials
      )}
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [page, setPage] = useState('settings');
  const [navKey, setNavKey] = useState('settings');
  const [profileTab, setProfileTab] = useState('reviews');
  const [chatId, setChatId] = useState('jone');
  const [avatar, setAvatar] = useState(() => getAvatarDataUrl() || '');
  const [scheduleDays, setScheduleDays] = useState(() => defaultScheduleWeek());
  const [scheduleSavedMsg, setScheduleSavedMsg] = useState(false);
  const [appointmentRequests, setAppointmentRequests] = useState(() => APPOINTMENT_REQUESTS_INITIAL);
  const [todayAppointments, setTodayAppointments] = useState(() => TODAY_APPOINTMENTS);
  const [paymentsReceived, setPaymentsReceived] = useState(() => PAYMENTS_RECEIVED);
  const [paymentsTotal, setPaymentsTotal] = useState(() => PAYMENTS_RECEIVED_TOTAL);

  useEffect(() => {
    document.title = 'Doclock | Admin';
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'doclock_avatar') setAvatar(getAvatarDataUrl() || '');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const gradients = [
      'linear-gradient(135deg,#8b5cf6,#7c3aed)',
      'linear-gradient(135deg,#f472b6,#ec4899)',
      'linear-gradient(135deg,#34d399,#10b981)',
      'linear-gradient(135deg,#fbbf24,#f59e0b)',
      'linear-gradient(135deg,#a78bfa,#7c3aed)',
      'linear-gradient(135deg,#14b8a6,#0d9488)',
    ];
    let alive = true;
    (async () => {
      const [availabilityRes, requestsRes, todayRes, paymentsRes] = await Promise.allSettled([
        adminApi.getAvailability(),
        adminApi.getAppointmentRequests(),
        adminApi.getTodayAppointments(),
        adminApi.getPaymentsReceived(),
      ]);

      if (!alive) return;

      if (availabilityRes.status === 'fulfilled' && Array.isArray(availabilityRes.value?.availability)) {
        setScheduleDays(mergeScheduleWithDefaults(availabilityRes.value.availability));
      }

      if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value?.requests)) {
        setAppointmentRequests(
          requestsRes.value.requests.map((r, idx) => ({
            ...r,
            avatarBg: r.avatarBg || gradients[idx % gradients.length],
          })),
        );
      }

      if (todayRes.status === 'fulfilled' && Array.isArray(todayRes.value?.appointments)) {
        setTodayAppointments(
          todayRes.value.appointments.map((r, idx) => ({
            ...r,
            avatarBg: r.avatarBg || gradients[idx % gradients.length],
          })),
        );
      }

      if (paymentsRes.status === 'fulfilled') {
        const rows = Array.isArray(paymentsRes.value?.payments) ? paymentsRes.value.payments : [];
        const total = Number(paymentsRes.value?.total || 0);
        setPaymentsReceived(rows);
        setPaymentsTotal(total);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const goNav = (key, targetPage) => {
    setNavKey(key);
    setPage(targetPage);
  };

  const patchScheduleDay = (key, patch) => {
    setScheduleSavedMsg(false);
    setScheduleDays((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const saveSchedule = async () => {
    try {
      await adminApi.updateAvailability(scheduleDays);
      setScheduleSavedMsg(true);
    } catch {
      setScheduleSavedMsg(false);
    }
  };

  const setApptRequestStatus = async (id, status) => {
    const prev = appointmentRequests;
    const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
    setAppointmentRequests(next);
    try {
      await adminApi.updateAppointmentStatus(id, status);
    } catch {
      setAppointmentRequests(prev);
    }
  };

  const user = getAuthUser();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>
      <div className="admin-root home-page home-dashboard">
        <aside className="home-sidebar" aria-label="Admin navigation">
          <div className="home-sidebarLogo">
            <img className="admin-brand-logo" src={docLogo} alt="Doclock" />
          </div>
          <nav className="home-nav">
            <button
              type="button"
              className={`home-navItem${navKey === 'overview' ? ' active' : ''}`}
              onClick={() => goNav('overview', 'overview')}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <path
                    d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </NavIcon>
              Overview
            </button>
            <button
              type="button"
              className={`home-navItem${navKey === 'appointment' ? ' active' : ''}`}
              onClick={() => goNav('appointment', 'appointment')}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </NavIcon>
              Appointment
            </button>
            <button
              type="button"
              className={`home-navItem${navKey === 'patients' ? ' active' : ''}`}
              onClick={() => goNav('patients', 'patients')}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <path
                    d="M20 21a8 8 0 1 0-16 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </NavIcon>
              My Patients
            </button>
            <button
              type="button"
              className={`home-navItem${navKey === 'schedule' ? ' active' : ''}`}
              onClick={() => goNav('schedule', 'schedule')}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </NavIcon>
              Schedule Timings
            </button>
            <button
              type="button"
              className={`home-navItem${navKey === 'payments' ? ' active' : ''}`}
              onClick={() => goNav('payments', 'payments')}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 10h20" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 15h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </NavIcon>
              Payments
            </button>
            <button
              type="button"
              className={`home-navItem${navKey === 'settings' ? ' active' : ''}`}
              onClick={() => goNav('settings', 'settings')}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </NavIcon>
              Settings
            </button>
            <button type="button" className="home-navItem home-navItemLogout" onClick={() => navigate('/login')}>
              <NavIcon>
                <svg viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavIcon>
              Log out
            </button>
          </nav>
        </aside>

        <div className="home-main">
          <header className="home-topbar home-topbarDash">
            <div className="home-searchWrap">
              <span className="home-searchIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="home-searchInput"
                type="search"
                placeholder="Search appointment, patient, etc."
                aria-label="Search"
              />
            </div>
            <div className="home-topbarRight">
              <button className="home-bell" type="button" aria-label="Notifications">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M13.7 21a2 2 0 01-3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {avatar ? (
                <img className="home-avatar home-avatarHeader" src={avatar} alt={user?.name ? `${user.name} profile` : 'Profile'} />
              ) : (
                <div className="home-avatar home-avatarHeader" aria-hidden="true" />
              )}
            </div>
          </header>

          <div className="home-mainInner">
            <div className={`page${page === 'overview' ? ' active' : ''}`} id="page-overview">
              <div className="overview-content">
                <div className="welcome-row">
                  <div>
                    <h1>Welcome, Dr. Stephen</h1>
                    <p>Have a nice day at great work</p>
                  </div>
                </div>

                <div className="stat-cards">
                  <div className="stat-card blue">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <div className="stat-num">24.4k</div>
                      <div className="stat-lbl">Appointments</div>
                    </div>
                  </div>
                  <div className="stat-card pink">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <div className="stat-num">166.3k</div>
                      <div className="stat-lbl">Total Patient</div>
                    </div>
                  </div>
                  <div className="stat-card orange">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="stat-num">10</div>
                      <div className="stat-lbl">Pending</div>
                    </div>
                  </div>
                  <div className="stat-card cyan">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" />
                      </svg>
                    </div>
                    <div>
                      <div className="stat-num">0</div>
                      <div className="stat-lbl">Cancelled</div>
                    </div>
                  </div>
                </div>

                <div className="three-col">
                  <div className="panel">
                    <div className="panel-header">
                      <span className="panel-title">Appointment Request</span>
                      <span className="view-all">View All →</span>
                    </div>
                    <div className="appt-row">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                        BK
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">Bogdan Krivenchenko</div>
                        <div className="appt-sub">45 Male, 12 April 9:30</div>
                      </div>
                      <span className="badge declined">Declined</span>
                    </div>
                    <div className="appt-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#f472b6,#ec4899)',
                        }}
                      >
                        JW
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">Jenny Wilson</div>
                        <div className="appt-sub">Female, 25 April 10:30 AM</div>
                      </div>
                      <span className="badge confirmed">Confirmed</span>
                    </div>
                    <div className="appt-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#34d399,#10b981)',
                        }}
                      >
                        DR
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">Dianne Russel</div>
                        <div className="appt-sub">Male, 45 Today 14:30 PM</div>
                      </div>
                      <span className="badge confirmed">Confirmed</span>
                    </div>
                    <div className="appt-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                        }}
                      >
                        AB
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">Annette Black</div>
                        <div className="appt-sub">Male, 45 Today 14:30 PM</div>
                      </div>
                      <span className="badge declined">Declined</span>
                    </div>
                    <div className="appt-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
                        }}
                      >
                        AJ
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">Angelina Jully</div>
                        <div className="appt-sub">Male, 45 Today 14:30 PM</div>
                      </div>
                      <span className="badge confirmed">Confirmed</span>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-header">
                      <span className="panel-title">Patients</span>
                      <span className="view-all" style={{ fontSize: 11, color: 'var(--muted)' }}>
                        2020 ▾
                      </span>
                    </div>
                    <div className="patient-stat">
                      <div className="ps-icon" style={{ background: '#eff6ff' }}>
                        <svg viewBox="0 0 24 24" style={{ stroke: '#2563eb' }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <div className="ps-num">24.4k</div>
                        <div className="ps-lbl">New Patient</div>
                      </div>
                      <div className="ps-trend">↑ 15%</div>
                    </div>
                    <div className="patient-stat">
                      <div className="ps-icon" style={{ background: '#fef9c3' }}>
                        <svg viewBox="0 0 24 24" style={{ stroke: '#ca8a04' }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <div className="ps-num">166.3k</div>
                        <div className="ps-lbl">Old Patient</div>
                      </div>
                      <div className="ps-trend">↑ 15%</div>
                    </div>
                    <div className="panel-header" style={{ marginTop: 10 }}>
                      <span className="panel-title" style={{ fontSize: 13 }}>
                        Gender
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>2020 ▾</span>
                    </div>
                    <div className="donut-wrap">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="28" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                        <circle
                          cx="40"
                          cy="40"
                          r="28"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="12"
                          strokeDasharray="79 97"
                          strokeDashoffset="-25"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="28"
                          fill="none"
                          stroke="#ec4899"
                          strokeWidth="12"
                          strokeDasharray="54 122"
                          strokeDashoffset="-104"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="28"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="12"
                          strokeDasharray="43 133"
                          strokeDashoffset="-158"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="donut-legend">
                      <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#3b82f6' }} />
                        Male 45%
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#ec4899' }} />
                        Female 30%
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#f59e0b' }} />
                        Child 25%
                      </div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-header">
                      <span className="panel-title">Today Appointments</span>
                    </div>
                    <div className="today-row">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                        JS
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="today-name">Jhon Smith</div>
                        <div className="today-sub">Clinic Consulting</div>
                      </div>
                      <span className="badge ongoing">Ongoing</span>
                    </div>
                    <div className="today-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#34d399,#10b981)',
                        }}
                      >
                        FM
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="today-name">Frank Murray</div>
                        <div className="today-sub">Clinic Consulting</div>
                      </div>
                      <span className="today-time">10:25</span>
                    </div>
                    <div className="today-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#f472b6,#ec4899)',
                        }}
                      >
                        EL
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="today-name">Ella Lucia</div>
                        <div className="today-sub"> Clinic Consulting</div>
                      </div>
                      <span className="today-time">11:30</span>
                    </div>
                    <div className="today-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
                        }}
                      >
                        AD
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="today-name">Alyssa Dehn</div>
                        <div className="today-sub">Clinic Consulting</div>
                      </div>
                      <span className="today-time">12:20</span>
                    </div>
                  </div>
                </div>

                <div className="recent-table">
                  <div
                    className="panel-header"
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--white)',
                      borderRadius: '14px 14px 0 0',
                    }}
                  >
                    <span className="panel-title">Recent Patients</span>
                    <span className="view-all">View All →</span>
                  </div>
                  <div className="table-head">
                    <div className="th">Patient Name</div>
                    <div className="th">Visit Id</div>
                    <div className="th">Date</div>
                    <div className="th">Gender</div>
                    <div className="th">Diseases</div>
                    <div className="th">Status</div>
                    <div className="th" />
                  </div>
                  <div className="table-row">
                    <div className="td td-name">
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 9 }}>
                        DL
                      </div>
                      Deveon Lane
                    </div>
                    <div className="td muted">OPD-2345</div>
                    <div className="td muted">5/7/21</div>
                    <div className="td">Male</div>
                    <div className="td">Diabetes</div>
                    <div className="td">
                      <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        Out-Patient
                      </span>
                    </div>
                    <div className="td muted">⋮</div>
                  </div>
                  <div className="table-row">
                    <div className="td td-name">
                      <div
                        className="avatar"
                        style={{
                          width: 24,
                          height: 24,
                          fontSize: 9,
                          background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                        }}
                      >
                        AF
                      </div>
                      Albert Flores
                    </div>
                    <div className="td muted">IPD-2424</div>
                    <div className="td muted">5/7/21</div>
                    <div className="td">Male</div>
                    <div className="td">Diabetes</div>
                    <div className="td">
                      <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        Out-Patient
                      </span>
                    </div>
                    <div className="td muted">⋮</div>
                  </div>
                  <div className="table-row">
                    <div className="td td-name">
                      <div
                        className="avatar"
                        style={{
                          width: 24,
                          height: 24,
                          fontSize: 9,
                          background: 'linear-gradient(135deg,#f472b6,#ec4899)',
                        }}
                      >
                        EL
                      </div>
                      Ella Lucia
                    </div>
                    <div className="td muted">OPD-2345</div>
                    <div className="td muted">8/15/21</div>
                    <div className="td">Male</div>
                    <div className="td">Diabetes</div>
                    <div className="td">
                      <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        Out-Patient
                      </span>
                    </div>
                    <div className="td muted">⋮</div>
                  </div>
                  <div className="table-row">
                    <div className="td td-name">
                      <div
                        className="avatar"
                        style={{
                          width: 24,
                          height: 24,
                          fontSize: 9,
                          background: 'linear-gradient(135deg,#34d399,#10b981)',
                        }}
                      >
                        AF
                      </div>
                      Albert Flores
                    </div>
                    <div className="td muted">IPD-2424</div>
                    <div className="td muted">8/30/21</div>
                    <div className="td">Male</div>
                    <div className="td">Diabetes</div>
                    <div className="td">
                      <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        Out-Patient
                      </span>
                    </div>
                    <div className="td muted">⋮</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`page${page === 'schedule' ? ' active' : ''}`} id="page-schedule">
              <div className="schedule-page">
                <div className="schedule-head">
                  <h1>Schedule Timings</h1>
                  <p>
                    Set whether you are available each day and your clinic hours. Patients only see slots inside
                    these times on days you mark as available.
                  </p>
                </div>
                <div className="schedule-card">
                  {scheduleDays.map((d) => (
                    <div key={d.key} className="schedule-dayRow">
                      <div className="schedule-dayName">{d.label}</div>
                      <div className="schedule-availToggle">
                        <label htmlFor={`avail-${d.key}`}>
                          <input
                            id={`avail-${d.key}`}
                            type="checkbox"
                            checked={d.available}
                            onChange={() => patchScheduleDay(d.key, { available: !d.available })}
                          />
                          Available this day
                        </label>
                      </div>
                      {d.available ? (
                        <div className="schedule-times">
                          <label htmlFor={`start-${d.key}`}>From</label>
                          <input
                            id={`start-${d.key}`}
                            className="schedule-timeInput"
                            type="time"
                            value={d.start}
                            onChange={(e) => patchScheduleDay(d.key, { start: e.target.value })}
                          />
                          <label htmlFor={`end-${d.key}`}>To</label>
                          <input
                            id={`end-${d.key}`}
                            className="schedule-timeInput"
                            type="time"
                            value={d.end}
                            onChange={(e) => patchScheduleDay(d.key, { end: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="schedule-unavailable">Not available</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="schedule-actions">
                  <button type="button" className="schedule-save" onClick={saveSchedule}>
                    Save schedule
                  </button>
                  {scheduleSavedMsg ? (
                    <span className="schedule-saved" role="status">
                      Saved
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={`page${page === 'appointment' ? ' active' : ''}`} id="page-appointment">
              <div className="apptreq-page">
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Appointment Request</span>
                    <button type="button" className="view-all" onClick={() => navigate('/appointments')}>
                      View All →
                    </button>
                  </div>
                  {appointmentRequests.map((row) => (
                    <div key={row.id} className="appt-row">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          background: row.avatarBg,
                        }}
                      >
                        {row.initials}
                      </div>
                      <div className="appt-info">
                        <div className="appt-name">{row.name}</div>
                        <div className="appt-sub">{row.detail}</div>
                      </div>
                      <div className="apptreq-actions">
                        <button
                          type="button"
                          className={`apptreq-btn apptreq-btnConfirm${row.status === 'confirmed' ? ' apptreq-btn--active' : ''}`}
                          onClick={() => setApptRequestStatus(row.id, 'confirmed')}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className={`apptreq-btn apptreq-btnDecline${row.status === 'declined' ? ' apptreq-btn--active' : ''}`}
                          onClick={() => setApptRequestStatus(row.id, 'declined')}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`page${page === 'patients' ? ' active' : ''}`} id="page-patients">
              <div className="patients-page">
                <div className="today-appt-card">
                  <div className="today-appt-title">Today Appointments</div>
                  {todayAppointments.map((row) => (
                    <div key={row.id} className="today-appt-row">
                      <div className="today-appt-left">
                        <div className="today-appt-avatar" style={{ background: row.avatarBg }}>
                          {row.initials}
                        </div>
                        <div>
                          <div className="today-appt-name">{row.name}</div>
                          <div className="today-appt-sub">{row.type}</div>
                        </div>
                      </div>
                      <div className="today-appt-right">
                        {row.right.kind === 'status' ? (
                          <span className="today-appt-badge">{row.right.label}</span>
                        ) : (
                          <span className="today-appt-time">{row.right.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`page${page === 'payments' ? ' active' : ''}`} id="page-payments">
              <div className="pay-page">
                <div className="pay-head">
                  <h1>Payments received</h1>
                  <p>Payments you have received from patients for visits and consultations.</p>
                </div>
                <div className="pay-summary">
                  <span className="pay-summary-label">Total received</span>
                  <span className="pay-summary-value">{formatMoneyPhp(paymentsTotal)}</span>
                  <span className="pay-summary-hint">Sum of sample transactions below</span>
                </div>
                <div className="panel pay-panel">
                  <div className="panel-header">
                    <span className="panel-title">Recent payments</span>
                  </div>
                  {paymentsReceived.map((row) => (
                    <div key={row.id} className="pay-row">
                      <div>
                        <div className="pay-patient">{row.patient}</div>
                        <div className="pay-detail">{row.detail}</div>
                        <div className="pay-meta">{row.date} · {row.ref}</div>
                      </div>
                      <div className="pay-right">
                        <div className="pay-amount">{formatMoneyPhp(row.amount)}</div>
                        <span className="pay-badge">Received</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`page${page === 'messages' ? ' active' : ''}`} id="page-messages">
              <div className="msg-layout">
                <div className="msg-list-panel">
                  <div className="msg-list-header">
                    <h2>Message</h2>
                    <div className="search-msg">
                      <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Search for message
                    </div>
                  </div>
                  <div className="recent-label">Recent Chat ▾</div>
                  <div className="chat-list">
                    {[
                      {
                        id: 'jone',
                        src: 'https://randomuser.me/api/portraits/men/44.jpg',
                        initials: 'JM',
                        name: 'Jone Martin',
                        time: '25:09',
                        preview: 'Ongoing Call',
                        ongoing: true,
                      },
                      {
                        id: 'jhon',
                        src: 'https://randomuser.me/api/portraits/men/22.jpg',
                        initials: 'JS',
                        grad: 'linear-gradient(135deg,#34d399,#10b981)',
                        name: 'Jhon Smith',
                        time: '17:10',
                        preview: 'I hope you get well soon',
                      },
                      {
                        id: 'jonathon',
                        src: 'https://randomuser.me/api/portraits/men/55.jpg',
                        initials: 'JS',
                        grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
                        name: 'Jhonathon Smith',
                        time: 'Yesterday',
                        mutedTime: true,
                        preview: 'I have prescribed for you...',
                      },
                      {
                        id: 'celcilia',
                        src: 'https://randomuser.me/api/portraits/women/33.jpg',
                        initials: 'CJ',
                        grad: 'linear-gradient(135deg,#f472b6,#ec4899)',
                        name: 'Celcilia R. Jones',
                        time: '05/04/21',
                        mutedTime: true,
                        preview: 'Thank You for your advice.',
                      },
                      {
                        id: 'doe1',
                        initials: 'JD',
                        grad: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                        name: 'Mr. Jhon Doe',
                        time: '04/04/21',
                        mutedTime: true,
                        preview: 'You need to do a lab check',
                      },
                      {
                        id: 'linda',
                        src: 'https://randomuser.me/api/portraits/women/44.jpg',
                        initials: 'LG',
                        grad: 'linear-gradient(135deg,#34d399,#10b981)',
                        name: 'Linda G. Guthrie',
                        time: '03/04/21',
                        mutedTime: true,
                        preview: 'Okay, see you again Human',
                      },
                      {
                        id: 'doe2',
                        initials: 'JD',
                        grad: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                        name: 'Mr. Jhon Doe',
                        time: '02/04/21',
                        mutedTime: true,
                        preview: 'You need to do a lab check',
                      },
                    ].map((c) => (
                      <div
                        key={c.id}
                        className={`chat-item${chatId === c.id ? ' active' : ''}`}
                        onClick={() => setChatId(c.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setChatId(c.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <AvatarImg
                          src={c.src}
                          initials={c.initials}
                          className="avatar"
                          style={{
                            width: 36,
                            height: 36,
                            ...(c.grad ? { background: c.grad } : {}),
                          }}
                        />
                        <div className="chat-info">
                          <div className="chat-name">
                            {c.name}{' '}
                            <span
                              className="chat-time"
                              style={c.mutedTime ? { color: 'var(--muted)' } : undefined}
                            >
                              {c.time}
                            </span>
                          </div>
                          <div className={`chat-preview${c.ongoing ? ' ongoing' : ''}`}>{c.preview}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="msg-chat-panel">
                  <div className="chat-header">
                    <AvatarImg
                      src="https://randomuser.me/api/portraits/men/44.jpg"
                      initials="JM"
                      className="avatar"
                      style={{ width: 38, height: 38 }}
                    />
                    <div className="chat-header-info">
                      <div className="chat-header-name">Jone Martin</div>
                      <div className="chat-header-status">● Online</div>
                    </div>
                    <div className="chat-header-actions">
                      <div className="icon-btn">
                        <svg viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                      <div className="icon-btn">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="messages-area">
                    <div className="msg-bubble-wrap">
                      <AvatarImg
                        src="https://randomuser.me/api/portraits/men/44.jpg"
                        initials="JM"
                        className="avatar"
                        style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                      />
                      <div>
                        <div className="bubble left">Hi Doctor,</div>
                        <div className="bubble-time">Today 7:45 am</div>
                      </div>
                    </div>
                    <div className="msg-bubble-wrap right">
                      <div>
                        <div className="bubble right">Good Morning</div>
                        <div className="bubble-time right">
                          <span className="check">✓✓</span> Today 7:55 am
                        </div>
                      </div>
                      <AvatarImg
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        initials="SC"
                        className="avatar"
                        style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                      />
                    </div>
                    <div className="msg-bubble-wrap right">
                      <div>
                        <div className="bubble right">Whats the matter jone?</div>
                        <div className="bubble-time right">
                          <span className="check">✓✓</span> Today 7:55 am
                        </div>
                      </div>
                      <AvatarImg
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        initials="SC"
                        className="avatar"
                        style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                      />
                    </div>
                    <div className="msg-bubble-wrap">
                      <AvatarImg
                        src="https://randomuser.me/api/portraits/men/44.jpg"
                        initials="JM"
                        className="avatar"
                        style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                      />
                      <div>
                        <div className="bubble left">
                          I am not fine. I am a cardio patient. I need your help immidately.
                        </div>
                        <div className="bubble-time">Today 7:59 am</div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 6,
                      }}
                    >
                      <div className="msg-bubble-wrap right">
                        <div>
                          <div className="bubble right">
                            Hey man, don&apos;t worry I am here. Let me know your situation now.
                          </div>
                          <div className="bubble-time right">
                            <span className="check">✓✓</span> Today 7:55 am
                          </div>
                        </div>
                        <AvatarImg
                          src="https://randomuser.me/api/portraits/men/32.jpg"
                          initials="SC"
                          className="avatar"
                          style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                        />
                      </div>
                      <div className="context-menu" style={{ marginRight: 46 }}>
                        <div className="ctx-item">Reply</div>
                        <div className="ctx-item">Forward</div>
                        <div className="ctx-item">Delete</div>
                      </div>
                    </div>
                    <div className="msg-bubble-wrap">
                      <AvatarImg
                        src="https://randomuser.me/api/portraits/men/44.jpg"
                        initials="JM"
                        className="avatar"
                        style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                      />
                      <div>
                        <div className="bubble left" style={{ padding: 8, display: 'flex', gap: 6 }}>
                          <div
                            style={{
                              width: 60,
                              height: 50,
                              borderRadius: 8,
                              background: '#fde8e8',
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=120&q=70"
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div
                            style={{
                              width: 60,
                              height: 50,
                              borderRadius: 8,
                              background: '#e8f4fd',
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&q=70"
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                        <div className="bubble left" style={{ marginTop: 4 }}>
                          Sure
                        </div>
                      </div>
                    </div>
                    <div className="msg-bubble-wrap right">
                      <div>
                        <div className="audio-bubble">
                          <div className="play-btn">
                            <svg viewBox="0 0 24 24">
                              <polygon points="5 3 19 12 5 21 5 3" fill="white" />
                            </svg>
                          </div>
                          <div className="audio-bar">
                            <div className="audio-progress" />
                          </div>
                          <span className="audio-time">1:30</span>
                        </div>
                      </div>
                      <AvatarImg
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        initials="SC"
                        className="avatar"
                        style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                      />
                    </div>
                  </div>

                  <div className="chat-input-bar">
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </div>
                    <input className="chat-input" type="text" placeholder="Type a message..." />
                    <div className="input-actions">
                      <div className="input-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </div>
                      <div className="input-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </div>
                      <div className="send-btn">
                        <svg viewBox="0 0 24 24">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`page${page === 'settings' ? ' active' : ''}`} id="page-settings">
              <div className="settings-layout">
                <div className="profile-sidebar">
                  <div className="profile-avatar-wrap">
                    <AvatarImg
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      initials="SC"
                      className="profile-avatar"
                    />
                  </div>
                  <div className="profile-name">Dr. Stephen Conley</div>
                  <div className="profile-spec">Cardiologist</div>
                  <button type="button" className="edit-btn">
                    <svg viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </button>
                  <div className="ratings-label">146 Rates</div>
                  <div className="stars">★★★★★</div>
                  <div className="trust-row">
                    <div className="trust-label">
                      <span>Trust</span>
                      <span>91%</span>
                    </div>
                    <div className="trust-bar">
                      <div className="trust-fill" style={{ width: '91%' }} />
                    </div>
                  </div>
                </div>

                <div className="profile-main">
                  <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>My Profile</h2>
                  <div className="profile-tabs">
                    {[
                      { id: 'profile', label: 'My Profile' },
                      { id: 'password', label: 'Change Password' },
                      { id: 'notification', label: 'Notification' },
                      { id: 'reviews', label: 'Reviews' },
                    ].map((t) => (
                      <div
                        key={t.id}
                        className={`tab-item${profileTab === t.id ? ' active' : ''}`}
                        onClick={() => setProfileTab(t.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setProfileTab(t.id)}
                        role="button"
                        tabIndex={0}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>

                  <div className="reviews-list">
                    <div className="review-card">
                      <div className="review-header">
                        <div
                          className="avatar"
                          style={{
                            width: 36,
                            height: 36,
                            fontSize: 12,
                            background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                          }}
                        >
                          RR
                        </div>
                        <div className="review-info">
                          <div className="reviewer-name">Ronald Richards</div>
                          <div className="reviewer-role">Engineer</div>
                        </div>
                        <div className="review-meta">
                          <div className="review-stars">★★★★★</div>
                          <div className="review-date">8 Jun, 2021</div>
                        </div>
                      </div>
                      <p className="review-text">
                        Thank you to Dr. Stephen Conley and staff for a great experience right from the start.
                        Everyone made me feel comfortable and the outcome was great. If you need heart surgery
                        check out Dr. Stephen.
                      </p>
                    </div>

                    <div className="review-card">
                      <div className="review-header">
                        <div
                          className="avatar"
                          style={{
                            width: 36,
                            height: 36,
                            fontSize: 12,
                            background: 'linear-gradient(135deg,#f472b6,#ec4899)',
                          }}
                        >
                          AB
                        </div>
                        <div className="review-info">
                          <div className="reviewer-name">Annette Black</div>
                          <div className="reviewer-role">Teacher</div>
                        </div>
                        <div className="review-meta">
                          <div className="review-stars">★★★★★</div>
                          <div className="review-date">8 Jun, 2021</div>
                        </div>
                      </div>
                      <p className="review-text">
                        Dr. Stephen Conley did a great job on my knee! After my injection I was able to walk again
                        without pain. Before his injection I had 24-hour round the clock pain. Now, I can walk
                        without any discomfort. Thank You Dr. Stephen Conley.
                      </p>
                    </div>

                    <div className="review-card">
                      <div className="review-header">
                        <div
                          className="avatar"
                          style={{
                            width: 36,
                            height: 36,
                            fontSize: 12,
                            background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
                          }}
                        >
                          AJ
                        </div>
                        <div className="review-info">
                          <div className="reviewer-name">Angelina Jully</div>
                          <div className="reviewer-role">Teacher</div>
                        </div>
                        <div className="review-meta">
                          <div className="review-stars">★★★★☆</div>
                          <div className="review-date">8 Jun, 2021</div>
                        </div>
                      </div>
                      <p className="review-text">
                        Excellent cardiologist, my husband and I have both had surgery and ongoing care from him
                        over the years, the medical technology used is state of the art as well, continue to highly
                        recommend.
                      </p>
                    </div>

                    <div className="review-card">
                      <div className="review-header">
                        <div
                          className="avatar"
                          style={{
                            width: 36,
                            height: 36,
                            fontSize: 12,
                            background: 'linear-gradient(135deg,#34d399,#10b981)',
                          }}
                        >
                          JC
                        </div>
                        <div className="review-info">
                          <div className="reviewer-name">Jane Cooper</div>
                          <div className="reviewer-role">Teacher</div>
                        </div>
                        <div className="review-meta">
                          <div className="review-stars">★★★★★</div>
                          <div className="review-date">8 Jun, 2021</div>
                        </div>
                      </div>
                      <p className="review-text">
                        Excellent cardiologist, my husband and I have both had surgery and ongoing care from him
                        over the years, the medical technology used is state of the art as well, continue to highly
                        recommend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
