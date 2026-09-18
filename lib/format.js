// Parses a "YYYY-MM-DD" string as a local date (avoids UTC off-by-one) and
// returns "Mon, March 17, 2026".
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function yearOf(dateStr) {
  if (!dateStr) return null;
  const [y] = dateStr.split('-').map(Number);
  return y || null;
}

export function isTodayOrFuture(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function isCurrentYear(dateStr) {
  return yearOf(dateStr) === new Date().getFullYear();
}

export function isWithinPastYear(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  return date >= cutoff && date <= new Date();
}
