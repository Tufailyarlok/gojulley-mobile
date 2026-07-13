import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  cancelBooking,
  cancelTripBooking,
  createPaymentOrder,
  createTripPaymentOrder,
  getCoupons,
  getMyBookings,
  getMyTrips,
  previewCoupon,
  verifyPayment,
  verifyTripPayment,
} from '../lib/api'
import { useAuth } from '../lib/auth'
import { inr } from '../lib/money'
import { payOrder } from '../lib/pay'
import { colors, radius, sp } from '../lib/theme'
import type { Booking, BookingStatus, PublicCoupon, TripBooking } from '../lib/types'

const badgeColor: Record<BookingStatus, string> = {
  PENDING: colors.amber,
  CONFIRMED: colors.ok,
  CANCELLED: colors.faint,
}

// Per-pending-item coupon picker: choose an offer, preview the saving live.
function CouponRow({
  offers,
  code,
  discount,
  message,
  onSelect,
}: {
  offers: PublicCoupon[]
  code: string
  discount: number
  message: string
  onSelect: (code: string) => void
}) {
  if (offers.length === 0) return null
  return (
    <View style={styles.coupon}>
      <Text style={styles.couponLabel}>Offers</Text>
      <View style={styles.chipRow}>
        <Pressable onPress={() => onSelect('')} style={[styles.chip, !code && styles.chipOn]}>
          <Text style={[styles.chipText, !code && styles.chipTextOn]}>No coupon</Text>
        </Pressable>
        {offers.map((o) => {
          const on = code === o.code
          return (
            <Pressable key={o.code} onPress={() => onSelect(o.code)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.code}</Text>
            </Pressable>
          )
        })}
      </View>
      {discount > 0 && <Text style={styles.save}>−{inr(discount)} applied</Text>}
      {!!message && discount <= 0 && <Text style={styles.couponErr}>{message}</Text>}
    </View>
  )
}

export default function Bookings() {
  const router = useRouter()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trips, setTrips] = useState<TripBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  // Coupon state, keyed by `trip-<id>` / `bk-<id>`.
  const [offers, setOffers] = useState<PublicCoupon[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [discounts, setDiscounts] = useState<Record<string, number>>({})
  const [couponMsg, setCouponMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([getMyBookings(user.token), getMyTrips(user.token), getCoupons(user.token)])
      .then(([b, t, c]) => {
        setBookings(b)
        setTrips(t)
        setOffers(c)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <View style={{ padding: sp(6), alignItems: 'center' }}>
        <Text style={{ color: colors.faint, marginBottom: sp(4) }}>Log in to see your bookings.</Text>
        <Pressable style={styles.primary} onPress={() => router.push('/login')}>
          <Text style={styles.primaryText}>Log in</Text>
        </Pressable>
      </View>
    )
  }

  // Pick a coupon -> preview the saving so the total updates before paying.
  async function applyCoupon(key: string, code: string, amount: number) {
    setSelected((s) => ({ ...s, [key]: code }))
    setCouponMsg((m) => ({ ...m, [key]: '' }))
    if (!code) {
      setDiscounts((d) => ({ ...d, [key]: 0 }))
      return
    }
    try {
      const p = await previewCoupon(user!.token, code, amount)
      setDiscounts((d) => ({ ...d, [key]: p.discount }))
      setCouponMsg((m) => ({ ...m, [key]: p.message }))
    } catch (e) {
      setDiscounts((d) => ({ ...d, [key]: 0 }))
      setCouponMsg((m) => ({ ...m, [key]: (e as Error).message }))
    }
  }

  async function payTrip(t: TripBooking) {
    const key = `trip-${t.id}`
    setBusyKey(key)
    setError(null)
    setNotice(null)
    try {
      const order = await createTripPaymentOrder(user!.token, t.id, selected[key]?.trim() || undefined)
      await payOrder(order, (r) => verifyTripPayment(user!.token, r))
      setTrips((ts) => ts.map((x) => (x.id === t.id ? { ...x, status: 'CONFIRMED' } : x)))
      if (order.discount > 0) setNotice(`Paid — saved ${inr(order.discount / 100)} with ${order.couponCode}.`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyKey(null)
    }
  }
  async function payBooking(b: Booking) {
    const key = `bk-${b.id}`
    setBusyKey(key)
    setError(null)
    setNotice(null)
    try {
      const order = await createPaymentOrder(user!.token, b.id, selected[key]?.trim() || undefined)
      await payOrder(order, (r) => verifyPayment(user!.token, r))
      setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: 'CONFIRMED' } : x)))
      if (order.discount > 0) setNotice(`Paid — saved ${inr(order.discount / 100)} with ${order.couponCode}.`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyKey(null)
    }
  }
  async function dropTrip(t: TripBooking) {
    setBusyKey(`trip-${t.id}`)
    try {
      const u = await cancelTripBooking(user!.token, t.id)
      setTrips((ts) => ts.map((x) => (x.id === t.id ? { ...x, status: u.status } : x)))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyKey(null)
    }
  }
  async function dropBooking(b: Booking) {
    setBusyKey(`bk-${b.id}`)
    try {
      const u = await cancelBooking(user!.token, b.id)
      setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: u.status } : x)))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(10) }}>
      {loading && <ActivityIndicator color={colors.navy} style={{ marginTop: sp(6) }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {notice && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {trips.length > 0 && <Text style={styles.section}>Trips</Text>}
      {trips.map((t) => {
        const key = `trip-${t.id}`
        const disc = discounts[key] || 0
        return (
          <View key={key} style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.name}>{t.packageTitle}</Text>
              <Text style={[styles.status, { color: badgeColor[t.status] }]}>{t.status}</Text>
            </View>
            <Text style={styles.meta}>Starts {t.startDate} · {t.travelers} traveller(s) · {inr(t.totalPrice)}</Text>
            {t.balanceDue > 0 && (
              <Text style={styles.balance}>Advance paid · {inr(t.balanceDue)} due on arrival at Leh</Text>
            )}
            {t.status === 'PENDING' && (
              <CouponRow
                offers={offers}
                code={selected[key] ?? ''}
                discount={disc}
                message={couponMsg[key] ?? ''}
                onSelect={(c) => applyCoupon(key, c, t.totalPrice)}
              />
            )}
            <View style={styles.actions}>
              {t.status === 'PENDING' && (
                <Pressable style={styles.pay} disabled={busyKey === key} onPress={() => payTrip(t)}>
                  <Text style={styles.payText}>{busyKey === key ? '…' : `Pay ${inr(t.totalPrice - disc)}`}</Text>
                </Pressable>
              )}
              {t.status !== 'CANCELLED' && (
                <Pressable style={styles.cancel} disabled={busyKey === key} onPress={() => dropTrip(t)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        )
      })}

      {bookings.length > 0 && <Text style={styles.section}>Individual bookings</Text>}
      {bookings.map((b) => {
        const key = `bk-${b.id}`
        const disc = discounts[key] || 0
        return (
          <View key={key} style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.name}>{b.listingTitle}</Text>
              <Text style={[styles.status, { color: badgeColor[b.status] }]}>{b.status}</Text>
            </View>
            <Text style={styles.meta}>{b.startDate} → {b.endDate} · {b.quantity} unit(s) · {inr(b.totalPrice)}</Text>
            {b.status === 'PENDING' && (
              <CouponRow
                offers={offers}
                code={selected[key] ?? ''}
                discount={disc}
                message={couponMsg[key] ?? ''}
                onSelect={(c) => applyCoupon(key, c, b.totalPrice)}
              />
            )}
            <View style={styles.actions}>
              {b.status === 'PENDING' && (
                <Pressable style={styles.pay} disabled={busyKey === key} onPress={() => payBooking(b)}>
                  <Text style={styles.payText}>{busyKey === key ? '…' : `Pay ${inr(b.totalPrice - disc)}`}</Text>
                </Pressable>
              )}
              {b.status !== 'CANCELLED' && (
                <Pressable style={styles.cancel} disabled={busyKey === key} onPress={() => dropBooking(b)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        )
      })}

      {!loading && !error && trips.length === 0 && bookings.length === 0 && (
        <Text style={{ color: colors.faint }}>No bookings yet.</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  section: { color: colors.ink, fontWeight: '800', fontSize: 16, marginTop: sp(3), marginBottom: sp(2) },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4), marginBottom: sp(3) },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: sp(2) },
  name: { color: colors.ink, fontWeight: '800', fontSize: 15, flex: 1 },
  status: { fontWeight: '800', fontSize: 12 },
  meta: { color: colors.muted, fontSize: 13.5, marginTop: sp(1) },
  balance: { color: colors.amber, fontWeight: '700', fontSize: 13, marginTop: sp(1) },
  actions: { flexDirection: 'row', gap: sp(2), marginTop: sp(3) },
  pay: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(2.5), paddingHorizontal: sp(4) },
  payText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cancel: { borderWidth: 1, borderColor: '#f3c9c4', borderRadius: radius.md, paddingVertical: sp(2.5), paddingHorizontal: sp(4) },
  cancelText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3.5), paddingHorizontal: sp(6), alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  error: { color: colors.danger, marginBottom: sp(2) },

  notice: { backgroundColor: '#ecfdf5', borderRadius: radius.md, padding: sp(3), marginBottom: sp(3) },
  noticeText: { color: '#065f46', fontWeight: '700', fontSize: 13.5 },

  coupon: { marginTop: sp(3), borderTopWidth: 1, borderTopColor: colors.line, paddingTop: sp(3) },
  couponLabel: { color: colors.faint, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: sp(2) },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2) },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: sp(3), paddingVertical: sp(1.5), backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { color: colors.muted, fontWeight: '700', fontSize: 12.5 },
  chipTextOn: { color: '#fff' },
  save: { color: colors.ok, fontWeight: '800', fontSize: 13, marginTop: sp(2) },
  couponErr: { color: colors.danger, fontSize: 12.5, marginTop: sp(2) },
})
