export function specialtyAndDoctorFromService(service) {
  if (!service || typeof service !== 'string') {
    return { specialty: '—', doctor: 'Appointment' };
  }
  const parts = service.split(/\s*[—–-]\s*/u).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const specialty = parts[0] || '—';
    let doctor = parts[1] || '—';
    if (doctor && !/^dr\.?\s/i.test(doctor)) doctor = `Dr. ${doctor}`;
    return { specialty, doctor };
  }
  if (parts.length === 1) {
    return { specialty: parts[0], doctor: 'Appointment' };
  }
  return { specialty: '—', doctor: 'Appointment' };
}

export function formatVisitDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}
