// Rupee formatter with Indian digit grouping (₹1,23,456). Hand-rolled so it
// doesn't depend on Intl being present in the JS engine.
export function inr(value: number): string {
  const n = Math.round(Number(value) || 0)
  const neg = n < 0
  const s = String(Math.abs(n))
  const last3 = s.slice(-3)
  let rest = s.slice(0, -3)
  if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `₹${neg ? '-' : ''}${rest ? rest + ',' + last3 : last3}`
}

// Local-timezone YYYY-MM-DD (avoids the UTC off-by-one from toISOString()).
export function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// today's date as YYYY-MM-DD (local)
export function todayISO(): string {
  return localISO(new Date())
}

// Parse a YYYY-MM-DD string into a local Date (midnight). Falls back to today.
export function isoToDate(iso: string): Date {
  const [y, m, d] = (iso || '').split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Friendly display, e.g. "3 Jul 2026".
export function prettyDate(iso: string): string {
  const [y, m, d] = (iso || '').split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}
