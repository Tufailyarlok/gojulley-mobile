import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { createTripBooking, createTripPaymentOrder, getTrip, verifyTripPayment } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'
import { inr, todayISO } from '../../src/lib/money'
import { payOrder } from '../../src/lib/pay'
import { colors, radius, sp } from '../../src/lib/theme'
import type { TripPackage } from '../../src/lib/types'

const ISO = /^\d{4}-\d{2}-\d{2}$/

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [trip, setTrip] = useState<TripPackage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [mode, setMode] = useState<'full' | 'advance'>('full')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!id) return
    getTrip(Number(id))
      .then(setTrip)
      .catch((e) => setError((e as Error).message))
  }, [id])

  if (error) return <Text style={styles.error}>{error}</Text>
  if (!trip) return <ActivityIndicator color={colors.navy} style={{ marginTop: sp(10) }} />

  const total = trip.pricePerPerson * travelers
  const advance = Math.round(total * 0.1)
  const balance = total - advance
  const payNow = mode === 'advance' ? advance : total

  async function book() {
    if (!trip) return
    if (!user) {
      router.push('/login')
      return
    }
    if (!ISO.test(startDate) || startDate < todayISO()) {
      setError('Enter a start date (YYYY-MM-DD) that isn’t in the past.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const booking = await createTripBooking(user.token, { packageId: trip.id, startDate, travelers })
      const order = await createTripPaymentOrder(user.token, booking.id, undefined, mode === 'advance')
      await payOrder(order, (r) => verifyTripPayment(user.token, r))
      setDone(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <View style={{ padding: sp(5) }}>
        <View style={styles.success}>
          <Text style={{ color: '#065f46', fontWeight: '700' }}>Trip booked &amp; confirmed! See it under My bookings.</Text>
        </View>
        <Pressable style={styles.primary} onPress={() => router.push('/bookings')}>
          <Text style={styles.primaryText}>My bookings</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(12) }}>
      <Text style={styles.route}>{trip.durationDays} days · {trip.route}</Text>
      <Text style={styles.title}>{trip.title}</Text>
      <Text style={styles.summary}>{trip.summary}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Day by day</Text>
        {trip.itinerary.map((d, i) => (
          <Text key={i} style={styles.li}>{`${i + 1}.  ${d}`}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Included</Text>
        {trip.included.map((x, i) => (
          <Text key={i} style={styles.li}>{'✓  ' + x}</Text>
        ))}
      </View>

      {trip.notIncluded.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Not included</Text>
          {trip.notIncluded.map((x, i) => (
            <Text key={i} style={[styles.li, { color: colors.faint }]}>{'✗  ' + x}</Text>
          ))}
        </View>
      )}

      {trip.items.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What&rsquo;s inside</Text>
          <View style={styles.chips}>
            {trip.items.map((it) => (
              <View key={it.listingId} style={styles.chip}>
                <Text style={styles.chipText}>{it.listingTitle}{it.quantity > 1 ? ` ×${it.quantity}` : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Book this trip</Text>
        <Text style={styles.label}>Start date</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.faint}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={[styles.label, { marginTop: sp(3) }]}>Travellers</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setTravelers(Math.max(1, travelers - 1))} style={styles.stepBtn}><Text style={styles.stepTxt}>−</Text></Pressable>
          <Text style={styles.qty}>{travelers}</Text>
          <Pressable onPress={() => setTravelers(travelers + 1)} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></Pressable>
        </View>

        <View style={styles.totalRow}>
          <Text style={{ color: colors.muted }}>{inr(trip.pricePerPerson)} × {travelers}</Text>
          <Text style={styles.total}>{inr(total)}</Text>
        </View>

        {(['full', 'advance'] as const).map((m) => {
          const sel = mode === m
          return (
            <Pressable key={m} onPress={() => setMode(m)} style={[styles.mode, sel && styles.modeSel]}>
              <View style={[styles.radio, sel && styles.radioSel]} />
              <Text style={{ color: colors.ink, fontSize: 13.5, flex: 1 }}>
                {m === 'full'
                  ? `Pay in full now — ${inr(total)}`
                  : `Reserve with 10% advance — pay ${inr(advance)} now, ${inr(balance)} at Leh`}
              </Text>
            </Pressable>
          )
        })}

        {error && <Text style={styles.errInline}>{error}</Text>}
        <Pressable style={[styles.primary, busy && { opacity: 0.6 }]} disabled={busy} onPress={book}>
          <Text style={styles.primaryText}>{busy ? 'Processing…' : user ? `Book & pay ${inr(payNow)}` : 'Log in to book'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  route: { color: colors.cyan, fontWeight: '800', fontSize: 12, letterSpacing: 0.3 },
  title: { color: colors.ink, fontWeight: '900', fontSize: 22, marginTop: sp(1) },
  summary: { color: colors.muted, fontSize: 14.5, lineHeight: 21, marginTop: sp(2) },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4), marginTop: sp(4) },
  cardTitle: { color: colors.ink, fontWeight: '800', fontSize: 16, marginBottom: sp(2) },
  li: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2) },
  chip: { backgroundColor: colors.lavender, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.navy, fontWeight: '700', fontSize: 12.5 },
  label: { color: colors.faint, fontSize: 12, fontWeight: '700', marginBottom: sp(1) },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: sp(3), fontSize: 15, color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  stepBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 18, color: colors.ink, fontWeight: '700' },
  qty: { fontSize: 15, fontWeight: '800', color: colors.ink, minWidth: 20, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: sp(3), marginBottom: sp(3), marginTop: sp(3) },
  total: { color: colors.ink, fontWeight: '800', fontSize: 18 },
  mode: { flexDirection: 'row', gap: sp(2), alignItems: 'center', borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2) },
  modeSel: { borderColor: colors.navy, backgroundColor: '#f5f7ff' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.faint },
  radioSel: { borderColor: colors.navy, backgroundColor: colors.navy },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3.5), alignItems: 'center', marginTop: sp(3) },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  success: { backgroundColor: '#ecfdf5', borderRadius: radius.md, padding: sp(4), marginBottom: sp(4) },
  error: { color: colors.danger, padding: sp(4) },
  errInline: { color: colors.danger, marginTop: sp(2) },
})
