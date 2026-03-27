import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuthUser, getProfileImageSrc } from '../lib/api';
import { useAuth } from '../hooks/useAuth.js';
import { usersAPI } from '../services/api.js';
import DashboardNav from '../components/DashboardNav.jsx';

function formatShortDate(value) {
  if (value == null || value === '') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatHeightCm(cm) {
  if (cm == null || !Number.isFinite(Number(cm))) return '—';
  const n = Number(cm);
  const inchesTotal = Math.round(n / 2.54);
  const ft = Math.floor(inchesTotal / 12);
  const inch = inchesTotal % 12;
  return `${n} cm (${ft}'${inch}")`;
}

function sortByDateDesc(items, key = 'recordedAt') {
  return [...items].sort((a, b) => {
    const ta = new Date(a[key] || 0).getTime();
    const tb = new Date(b[key] || 0).getTime();
    return tb - ta;
  });
}

const emptyProfile = {
  heightCm: null,
  weightKg: null,
  weightRecordedAt: null,
  bloodPressureReadings: [],
  labResults: [],
  medications: [],
};

export default function HealthRecord() {
  const { user } = useAuth();
  const profileImg = getProfileImageSrc(getAuthUser() || user);
  const [hp, setHp] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await usersAPI.getHealthRecord();
      const next = data?.healthProfile && typeof data.healthProfile === 'object' ? data.healthProfile : emptyProfile;
      setHp({
        ...emptyProfile,
        ...next,
        bloodPressureReadings: Array.isArray(next.bloodPressureReadings) ? next.bloodPressureReadings : [],
        labResults: Array.isArray(next.labResults) ? next.labResults : [],
        medications: Array.isArray(next.medications) ? next.medications : [],
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load health record');
      setHp(emptyProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Doclock | Health Record';
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const bpSorted = useMemo(() => sortByDateDesc(hp.bloodPressureReadings || []), [hp.bloodPressureReadings]);
  const recentBp = bpSorted[0];
  const bpHistory = bpSorted.slice(0, 8);

  const labsSorted = useMemo(() => sortByDateDesc(hp.labResults || []), [hp.labResults]);

  const activeMeds = useMemo(
    () => (hp.medications || []).filter((m) => m.active !== false),
    [hp.medications],
  );

  const flagClass = (flag) => {
    const f = String(flag || 'normal').toLowerCase();
    if (f === 'high') return 'health-flag health-flag-high';
    if (f === 'low') return 'health-flag health-flag-low';
    if (f === 'abnormal') return 'health-flag health-flag-abnormal';
    return 'health-flag health-flag-normal';
  };

  return (
    <div className="home-page home-dashboard" role="region" aria-label="Health record">
      <aside className="home-sidebar" aria-label="Main navigation">
        <DashboardNav active="health" />
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
            <input className="home-searchInput" type="search" placeholder="Search" aria-label="Search" readOnly />
          </div>
          <div className="home-topbarRight">
            <button className="home-bell" type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M13.7 21a2 2 0 01-3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {profileImg ? (
              <img className="home-avatar home-avatarHeader" src={profileImg} alt="" />
            ) : (
              <div className="home-avatar home-avatarHeader" aria-hidden="true" />
            )}
          </div>
        </header>

        <div className="home-mainInner">
          <main className="home-content home-contentDash health-record-page">
            <h1 className="health-record-title">Health Record</h1>
            <p className="health-record-lead">Vitals, lab results, and medications on file for your account.</p>

            {error ? (
              <p className="health-record-error" role="alert">
                {error}{' '}
                <button type="button" className="health-record-retry" onClick={() => load()}>
                  Retry
                </button>
              </p>
            ) : null}

            {loading ? (
              <p className="health-record-loading">Loading your record…</p>
            ) : (
              <div className="health-record-grid">
                <section className="health-card" aria-labelledby="health-vitals-heading">
                  <h2 id="health-vitals-heading" className="health-card-title">
                    Vitals
                  </h2>
                  <div className="health-vitals-grid">
                    <div className="health-stat">
                      <span className="health-stat-label">Height</span>
                      <span className="health-stat-value">{formatHeightCm(hp.heightCm)}</span>
                    </div>
                    <div className="health-stat">
                      <span className="health-stat-label">Recent weight</span>
                      <span className="health-stat-value">
                        {hp.weightKg != null && Number.isFinite(Number(hp.weightKg))
                          ? `${hp.weightKg} kg`
                          : '—'}
                      </span>
                      {hp.weightRecordedAt ? (
                        <span className="health-stat-sub">as of {formatShortDate(hp.weightRecordedAt)}</span>
                      ) : null}
                    </div>
                    <div className="health-stat health-stat-wide">
                      <span className="health-stat-label">Recent blood pressure</span>
                      <span className="health-stat-value">
                        {recentBp
                          ? `${recentBp.systolic}/${recentBp.diastolic} mmHg`
                          : '—'}
                      </span>
                      {recentBp?.recordedAt ? (
                        <span className="health-stat-sub">{formatShortDate(recentBp.recordedAt)}</span>
                      ) : null}
                    </div>
                  </div>

                  {bpHistory.length > 1 ? (
                    <>
                      <h3 className="health-subheading">Blood pressure history</h3>
                      <ul className="health-bp-list">
                        {bpHistory.map((r, i) => (
                          <li key={`${r.recordedAt}-${i}`} className="health-bp-row">
                            <span>
                              {r.systolic}/{r.diastolic} mmHg
                            </span>
                            <span className="health-bp-date">{formatShortDate(r.recordedAt)}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </section>

                <section className="health-card" aria-labelledby="health-labs-heading">
                  <h2 id="health-labs-heading" className="health-card-title">
                    Lab results
                  </h2>
                  {labsSorted.length === 0 ? (
                    <p className="health-empty">No lab results recorded yet.</p>
                  ) : (
                    <div className="health-table-wrap">
                      <table className="health-table">
                        <thead>
                          <tr>
                            <th scope="col">Test</th>
                            <th scope="col">Result</th>
                            <th scope="col">Date</th>
                            <th scope="col">Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labsSorted.map((lab, i) => (
                            <tr key={`${lab.name}-${i}`}>
                              <td>{lab.name || '—'}</td>
                              <td>
                                {lab.value || '—'}
                                {lab.unit ? <span className="health-unit"> {lab.unit}</span> : null}
                              </td>
                              <td>{formatShortDate(lab.recordedAt)}</td>
                              <td>
                                <span className={flagClass(lab.flag)}>{lab.flag || 'normal'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="health-card health-card-full" aria-labelledby="health-meds-heading">
                  <h2 id="health-meds-heading" className="health-card-title">
                    Medications
                  </h2>
                  {activeMeds.length === 0 ? (
                    <p className="health-empty">No active medications on file.</p>
                  ) : (
                    <ul className="health-med-list">
                      {activeMeds.map((m, i) => (
                        <li key={`${m.name}-${i}`} className="health-med-row">
                          <div className="health-med-name">{m.name}</div>
                          <div className="health-med-detail">
                            {[m.dosage, m.frequency].filter(Boolean).join(' · ') || '—'}
                          </div>
                          {m.startDate ? (
                            <div className="health-med-sub">Since {formatShortDate(m.startDate)}</div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}

            <p className="health-record-footnote">
              Data is stored with your account. Your care team can update this record through the clinic.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
