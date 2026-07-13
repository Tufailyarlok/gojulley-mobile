import type {
  AuthUser,
  Booking,
  Listing,
  PaymentOrder,
  ReviewSummary,
  SignupResponse,
  TripBooking,
  TripPackage,
} from './types'

// The backend is the same one the web app uses — a mobile app is just another
// client. Override for local dev by pointing at your machine's LAN IP.
export const BASE = 'https://gojulley-backend.onrender.com/api/v1'

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (body?.message) return body.message
    if (body?.error) return body.error
  } catch {
    // not json
  }
  return `Request failed (${res.status})`
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as T
}

async function handleNoBody(res: Response): Promise<void> {
  if (!res.ok) throw new Error(await readError(res))
}

// --- Auth ---
export async function login(email: string, password: string): Promise<AuthUser> {
  return handle<AuthUser>(
    await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  )
}

export async function signup(email: string, password: string, name: string): Promise<SignupResponse> {
  return handle<SignupResponse>(
    await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }),
  )
}

export async function verifyOtp(email: string, code: string): Promise<AuthUser> {
  return handle<AuthUser>(
    await fetch(`${BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    }),
  )
}

export async function resendOtp(email: string): Promise<SignupResponse> {
  return handle<SignupResponse>(
    await fetch(`${BASE}/auth/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  )
}

// --- Catalog (public) ---
export async function getListings(): Promise<Listing[]> {
  return handle<Listing[]>(await fetch(`${BASE}/listings`))
}
export async function getListing(id: number): Promise<Listing> {
  return handle<Listing>(await fetch(`${BASE}/listings/${id}`))
}
export async function getTrips(): Promise<TripPackage[]> {
  return handle<TripPackage[]>(await fetch(`${BASE}/trips`))
}
export async function getTrip(id: number): Promise<TripPackage> {
  return handle<TripPackage>(await fetch(`${BASE}/trips/${id}`))
}
export async function getReviewSummaries(): Promise<ReviewSummary[]> {
  return handle<ReviewSummary[]>(await fetch(`${BASE}/reviews/summary`))
}

// --- Bookings (auth) ---
export async function getMyBookings(token: string): Promise<Booking[]> {
  return handle<Booking[]>(await fetch(`${BASE}/bookings`, { headers: authHeaders(token) }))
}
export async function getMyTrips(token: string): Promise<TripBooking[]> {
  return handle<TripBooking[]>(await fetch(`${BASE}/trip-bookings`, { headers: authHeaders(token) }))
}
export async function cancelBooking(token: string, id: number): Promise<Booking> {
  return handle<Booking>(await fetch(`${BASE}/bookings/${id}/cancel`, { method: 'POST', headers: authHeaders(token) }))
}
export async function cancelTripBooking(token: string, id: number): Promise<TripBooking> {
  return handle<TripBooking>(await fetch(`${BASE}/trip-bookings/${id}/cancel`, { method: 'POST', headers: authHeaders(token) }))
}

// --- Cart checkout (auth) — books all items as one custom order ---
export async function cartCheckout(
  token: string,
  data: { startDate: string; days: number; items: { listingId: number; quantity: number }[] },
): Promise<TripBooking> {
  return handle<TripBooking>(
    await fetch(`${BASE}/cart/checkout`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) }),
  )
}

// --- Trip / cart payment (auth) ---
export async function createTripPaymentOrder(
  token: string,
  tripBookingId: number,
  couponCode?: string,
  deposit = false,
): Promise<PaymentOrder> {
  return handle<PaymentOrder>(
    await fetch(`${BASE}/trip-payments/order`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ tripBookingId, couponCode, deposit }),
    }),
  )
}
export async function verifyTripPayment(
  token: string,
  data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<void> {
  return handleNoBody(
    await fetch(`${BASE}/trip-payments/verify`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) }),
  )
}
