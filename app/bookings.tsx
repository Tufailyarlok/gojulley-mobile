import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  cancelBooking,
  cancelTripBooking,
  createPaymentOrder,
  createTripPaymentOrder,
  getMyBookings,
  getMyTrips,
  verifyPayment,
  verifyTripPayment,
} from '../src/lib/api'
import { useAuth } from '../src/lib/auth'
import { inr } from '../src/lib/money'
import { payOrder } from '../src/lib/pay'
import { colors, radius, sp } from '../src/lib/theme'
import type { Booking, BookingStatus, TripBooking } from '../src/lib/types'

const badgeColor: Record<BookingStatus, string> = {
  PENDING: colors.amber,
  CONFIRMED: colors.ok,
  CANCELLED: colors.faint,
}

export default function Bookings() {
  const router = useRouter()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trips, setTrips] = useState<TripBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([getMyBookings(user.token), getMyTrips(user.token)])
      .then(([b, t]) => {
        setBookings(b)
        setTrips(t)
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

  async function payTrip(t: TripBooking) {
    setBusyKey(`trip-${t.id}`)
    setError(null)
    try {
      const order = await createTripPaymentOrder(user!.token, t.id)
      await payOrder(order, (r) => verifyTripPayment(user!.token, r))
      setTrips((ts) => ts.map((x) => (x.id === t.id ? { ...x, status: 'CONFIRMED' } : x)))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyKey(null)
    }
  }
  async function payBooking(b: Booking) {
    setBusyKey(`bk-${b.id}`)
    setError(null)
    try {
      const order = await createPaymentOrder(user!.token, b.id)
      await payOrder(order, (r) => verifyPayment(user!.token, r))
      setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: 'CONFIRMED' } : x)))
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

      {trips.length > 0 && <Text style={styles.section}>Trips</Text>}
      {trips.map((t) => (
        <View key={`trip-${t.id}`} style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.name}>{t.packageTitle}</Text>
            <Text style={[styles.status, { color: badgeColor[t.status] }]}>{t.status}</Text>
          </View>
          <Text style={styles.meta}>Starts {t.startDate} · {t.travelers} traveller(s) · {inr(t.totalPrice)}</Text>
          {t.balanceDue > 0 && (
            <Text style={styles.balance}>Advance paid · {inr(t.balanceDue)} due on arrival at Leh</Text>
          )}
          <View style={styles.actions}>
            {t.status === 'PENDING' && (
              <Pressable style={styles.pay} disabled={busyKey === `trip-${t.id}`} onPress={() => payTrip(t)}>
                <Text style={styles.payText}>{busyKey === `trip-${t.id}` ? '…' : `Pay ${inr(t.totalPrice)}`}</Text>
              </Pressable>
            )}
            {t.status !== 'CANCELLED' && (
              <Pressable style={styles.cancel} disabled={busyKey === `trip-${t.id}`} onPress={() => dropTrip(t)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      {bookings.length > 0 && <Text style={styles.section}>Individual bookings</Text>}
      {bookings.map((b) => (
        <View key={`bk-${b.id}`} style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.name}>{b.listingTitle}</Text>
            <Text style={[styles.status, { color: badgeColor[b.status] }]}>{b.status}</Text>
          </View>
          <Text style={styles.meta}>{b.startDate} → {b.endDate} · {b.quantity} unit(s) · {inr(b.totalPrice)}</Text>
          <View style={styles.actions}>
            {b.status === 'PENDING' && (
              <Pressable style={styles.pay} disabled={busyKey === `bk-${b.id}`} onPress={() => payBooking(b)}>
                <Text style={styles.payText}>{busyKey === `bk-${b.id}` ? '…' : `Pay ${inr(b.totalPrice)}`}</Text>
              </Pressable>
            )}
            {b.status !== 'CANCELLED' && (
              <Pressable style={styles.cancel} disabled={busyKey === `bk-${b.id}`} onPress={() => dropBooking(b)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

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
})
