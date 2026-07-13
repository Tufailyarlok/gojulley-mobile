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

export interface SignupResponse {
  email: string
  message: string
}
