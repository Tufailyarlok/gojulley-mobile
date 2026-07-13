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

// today's date as YYYY-MM-DD (local)
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
