import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function formatApptLine({ doctor, date, time }) {
  if (!doctor && !date && !time) return 'Your appointment has been confirmed.';
  const d = doctor ? `with ${doctor}` : '';
  const dt = date ? `for ${date}` : '';
  const tm = time ? `at ${time}` : '';
  return `Your appointment ${d} has been confirmed ${dt} ${tm}.`.replace(/\s+/g, ' ').trim();
}

export default function Booked() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};

  const doctor = state.doctor || 'Dr. James Tan';
  const specialty = state.specialty || 'Dermatologist';
  const date = state.date || 'Not selected';
  const time = state.time || 'Not selected';
  const type = state.type || 'In-Person';
  const fee = typeof state.fee === 'number' ? state.fee : 650;

  useEffect(() => {
    document.title = 'Doclock | Appointment Booked';
  }, []);

  const line = useMemo(() => formatApptLine({ doctor, date: date === 'Not selected' ? '' : date, time: time === 'Not selected' ? '' : time }), [doctor, date, time]);

  return (
    <div className="booked-page" role="region" aria-label="Appointment booked">
      <div className="booked-card">
        <div className="booked-icon" aria-hidden="true">🎉</div>
        <h1 className="booked-title">Appointment Booked!</h1>
        <p className="booked-sub">{line}</p>

        <div className="booked-table" role="table" aria-label="Appointment summary">
          <div className="booked-row" role="row">
            <div className="booked-key" role="cell">Doctor</div>
            <div className="booked-val" role="cell">{doctor}</div>
          </div>
          <div className="booked-row" role="row">
            <div className="booked-key" role="cell">Specialty</div>
            <div className="booked-val" role="cell">{specialty}</div>
          </div>
          <div className="booked-row" role="row">
            <div className="booked-key" role="cell">Date</div>
            <div className="booked-val" role="cell">{date}</div>
          </div>
          <div className="booked-row" role="row">
            <div className="booked-key" role="cell">Time</div>
            <div className="booked-val" role="cell">{time}</div>
          </div>
          <div className="booked-row" role="row">
            <div className="booked-key" role="cell">Type</div>
            <div className="booked-val" role="cell">{type}</div>
          </div>
          <div className="booked-row" role="row">
            <div className="booked-key" role="cell">Fee</div>
            <div className="booked-val" role="cell">₱{fee}</div>
          </div>
        </div>

        <div className="booked-actions">
          <button className="booked-btn booked-btnGhost" type="button" onClick={() => navigate('/available')}>
            Book Another
          </button>
          <button className="booked-btn" type="button" onClick={() => navigate('/home')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

