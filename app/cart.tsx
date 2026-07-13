import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { cartCheckout, createTripPaymentOrder, verifyTripPayment } from '../src/lib/api'
import { useAuth } from '../src/lib/auth'
import { useCart } from '../src/lib/cart'
import { inr, todayISO } from '../src/lib/money'
import { payOrder } from '../src/lib/pay'
import { colors, radius, sp, TYPE_META } from '../src/lib/theme'

const ISO = /^\d{4}-\d{2}-\d{2}$/

export default function Cart() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, setQty, remove, clear } = useCart()
  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState(2)
  const [mode, setMode] = useState<'full' | 'advance'>('full')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const perDay = items.reduce((s, i) => s + i.pricePerDay * i.quantity, 0)
  const total = perDay * days
  const advance = Math.round(total * 0.1)
  const balance = total - advance
  const payNow = mode === 'advance' ? advance : total

  async function checkout() {
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
      const order = await cartCheckout(user.token, {
        startDate,
        days,
        items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
      })
      const pay = await createTripPaymentOrder(user.token, order.id, undefined, mode === 'advance')
      await payOrder(pay, (r) => verifyTripPayment(user.token, r))
      clear()
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
          <Text style={{ color: '#065f46', fontWeight: '700' }}>Booked &amp; confirmed! Everything in your cart is reserved.</Text>
        </View>
        <Pressable style={styles.primary} onPress={() => router.push('/search')}>
          <Text style={styles.primaryText}>Plan another</Text>
        </Pressable>
      </View>
    )
  }

  if (items.length === 0) {
    return (
      <View style={{ padding: sp(6), alignItems: 'center' }}>
        <Text style={{ color: colors.faint, marginBottom: sp(4) }}>Your cart is empty.</Text>
        <Pressable style={styles.primary} onPress={() => router.push('/search')}>
          <Text style={styles.primaryText}>Browse stays, rides &amp; services</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(12) }}>
      {items.map((i) => {
        const meta = TYPE_META[i.type]
        return (
          <View key={i.listingId} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: meta.ink, fontWeight: '800', fontSize: 12 }}>{meta.badge}</Text>
              <Text style={styles.itemTitle}>{i.title}</Text>
              <Text style={styles.perDay}>{inr(i.pricePerDay)}/day</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: sp(2) }}>
              <View style={styles.stepper}>
                <Pressable onPress={() => setQty(i.listingId, i.quantity - 1)} style={styles.stepBtn}><Text style={styles.stepTxt}>−</Text></Pressable>
                <Text style={styles.qty}>{i.quantity}</Text>
                <Pressable onPress={() => setQty(i.listingId, i.quantity + 1)} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></Pressable>
              </View>
              <Pressable onPress={() => remove(i.listingId)}><Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13 }}>Remove</Text></Pressable>
            </View>
          </View>
        )
      })}

      <View style={styles.card}>
        <Text style={styles.label}>Trip start date</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.faint}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={[styles.label, { marginTop: sp(3) }]}>Number of days</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setDays(Math.max(1, days - 1))} style={styles.stepBtn}><Text style={styles.stepTxt}>−</Text></Pressable>
          <Text style={styles.qty}>{days}</Text>
          <Pressable onPress={() => setDays(days + 1)} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={{ color: colors.muted }}>{inr(perDay)} / day × {days} day{days > 1 ? 's' : ''}</Text>
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

        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={[styles.primary, busy && { opacity: 0.6 }]} disabled={busy} onPress={checkout}>
          <Text style={styles.primaryText}>{busy ? 'Processing…' : user ? `Book & pay ${inr(payNow)}` : 'Log in to book'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: sp(3), backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: sp(4), marginBottom: sp(3) },
  itemTitle: { color: colors.ink, fontWeight: '800', fontSize: 15, marginTop: 2 },
  perDay: { color: colors.faint, fontSize: 13, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: sp(3) },
  stepBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 18, color: colors.ink, fontWeight: '700' },
  qty: { fontSize: 15, fontWeight: '800', color: colors.ink, minWidth: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4), marginTop: sp(3) },
  label: { color: colors.faint, fontSize: 12, fontWeight: '700', marginBottom: sp(1) },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: sp(3), fontSize: 15, color: colors.ink },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: sp(3), marginBottom: sp(3) },
  total: { color: colors.ink, fontWeight: '800', fontSize: 18 },
  mode: { flexDirection: 'row', gap: sp(2), alignItems: 'center', borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2) },
  modeSel: { borderColor: colors.navy, backgroundColor: '#f5f7ff' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.faint },
  radioSel: { borderColor: colors.navy, backgroundColor: colors.navy },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3.5), alignItems: 'center', marginTop: sp(3) },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  success: { backgroundColor: '#ecfdf5', borderRadius: radius.md, padding: sp(4), marginBottom: sp(4) },
  error: { color: colors.danger, marginTop: sp(2) },
})
