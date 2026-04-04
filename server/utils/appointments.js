function todayYmd() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function initialsFromName(name) {
  const s = String(name || "P")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return s || "P";
}

function normalizeTimeDisplay(time) {
  const s = String(time || "").trim();
  return s || "—";
}

function formatVisitDateLabel(dateStr) {
  let display = dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
    const [yy, mm, dd] = String(dateStr).split("-").map(Number);
    const dt = new Date(yy, mm - 1, dd);
    if (!Number.isNaN(dt.getTime())) {
      display = dt.toLocaleDateString();
    }
  }
  return display;
}

module.exports = {
  todayYmd,
  initialsFromName,
  normalizeTimeDisplay,
  formatVisitDateLabel,
};
