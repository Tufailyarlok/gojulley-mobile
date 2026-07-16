// Shared types that mirror the backend's data shapes (same as the web app).

export type ListingType = 'HOTEL' | 'HOMESTAY' | 'CAR' | 'BIKE' | 'SERVICE'

export interface Listing {
  id: number
  type: ListingType
  title: string
  location: string
  pricePerDay: number
  quantity: number
  description: string
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Booking {
  id: number
  listingId: number
  listingTitle: string
  userEmail: string
  startDate: string
  endDate: string
  quantity: number
  totalPrice: number
  status: BookingStatus
}

export interface PackageItem {
  listingId: number
  listingTitle: string
  type: ListingType
  quantity: number
}

export interface TripPackage {
  id: number
  title: string
  route: string
  summary: string
  durationDays: number
  pricePerPerson: number
  active: boolean
  itinerary: string[]
  included: string[]
  notIncluded: string[]
  items: PackageItem[]
}

export interface TripBooking {
  id: number
  packageId: number | null
  packageTitle: string
  userEmail: string
  startDate: string
  travelers: number
  totalPrice: number
  balanceDue: number
  status: BookingStatus
}

export interface ReviewSummary {
  listingId: number
  average: number
  count: number
}

export interface PaymentOrder {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
  bookingId: number
  real: boolean
  originalAmount: number
  discount: number
  couponCode: string | null
}

// Offers shown in the checkout coupon picker (public-safe fields only).
export interface PublicCoupon {
  code: string
  description: string
  firstBookingOnly: boolean
}

// Live preview of what a coupon saves on a given amount (amount + discount in ₹).
export interface CouponPreview {
  code: string
  discount: number
  finalAmount: number
  message: string
}

export interface AuthUser {
  token: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
}

// Login returns either a completed session (token present) or a 2FA challenge
// (token null, twoFactorRequired true), completed via verifyLoginOtp.
export interface LoginResponse {
  token: string | null
  email: string
  name: string | null
  role: 'CUSTOMER' | 'ADMIN' | null
  twoFactorRequired: boolean
}

export interface SignupResponse {
  email: string
  message: string
}

// Signed-in user's profile (for the account screen / 2FA toggle).
export interface Me {
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
  verified: boolean
  twoFactorEnabled: boolean
}
