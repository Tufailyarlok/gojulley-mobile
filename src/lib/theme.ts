// Shared visual tokens — mirrors the web design system (navy/cyan Practo-ish).
export const colors = {
  navy: '#28328c',
  navyHover: '#222a75',
  cyan: '#199fd9',
  ink: '#0f172a',
  muted: '#4b5563',
  faint: '#6b7280',
  line: '#e5e7eb',
  surface: '#f9fafb',
  bg: '#ffffff',
  ok: '#16a34a',
  danger: '#dc2626',
  amber: '#b45309',
  lavender: '#eef1ff',
}

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 }

// 4px spacing scale
export const sp = (n: number) => n * 4

// per-listing-type accent (mirrors web TYPE_META)
export const TYPE_META: Record<
  string,
  { label: string; badge: string; tint: string; ink: string }
> = {
  HOTEL: { label: 'Hotels', badge: 'Hotel', tint: '#eff6ff', ink: '#1d4ed8' },
  HOMESTAY: { label: 'Homestays', badge: 'Homestay', tint: '#ecfdf5', ink: '#047857' },
  CAR: { label: 'Taxi', badge: 'Taxi', tint: '#fffbeb', ink: '#b45309' },
  BIKE: { label: 'Bikes', badge: 'Bike', tint: '#fdf4ff', ink: '#a21caf' },
  SERVICE: { label: 'Services', badge: 'Service', tint: '#f0fdfa', ink: '#0f766e' },
}
