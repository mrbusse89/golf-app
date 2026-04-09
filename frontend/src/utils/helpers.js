/**
 * Format a score relative to par (e.g., "+5", "-2", "E")
 */
export function formatScoreToPar(score, par) {
  if (!score || !par) return '—';
  const diff = score - par;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Score color class based on relation to par
 */
export function scoreColor(score, par) {
  if (!score || !par) return 'text-gray-600';
  const diff = score - par;
  if (diff <= -2) return 'text-green-700';
  if (diff <= 0) return 'text-green-600';
  if (diff <= 3) return 'text-yellow-600';
  if (diff <= 6) return 'text-orange-600';
  return 'text-red-600';
}
