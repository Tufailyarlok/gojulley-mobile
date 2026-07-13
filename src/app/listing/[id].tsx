import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getListing } from '../../lib/api'
import { useCart } from '../../lib/cart'
import { inr } from '../../lib/money'
import { colors, radius, sp, TYPE_META } from '../../lib/theme'
import type { Listing } from '../../lib/types'

const DETAILS: Record<string, string[]> = {
  HOTEL: ['Check-in 10:00 AM · check-out next-day 10:00 AM', 'Daily breakfast included', 'Rate is per room, per night'],
  HOMESTAY: ['Check-in 10:00 AM · check-out next-day 10:00 AM', 'Home-cooked meals with the host', 'Rate is per room, per night'],
  CAR: ['Comes with a driver — driver & fuel included', 'Pickup from your Leh stay or airport', 'Charged per day (10 AM → next-day 10 AM)'],
  BIKE: ['Self-drive rental — helmet included', 'Fuel not included', 'Pickup in Leh · licence + deposit required'],
  SERVICE: ['Charged per day of your trip', 'Available across Leh, Nubra & Pangong', 'Book alongside a stay, taxi, bike or package'],
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { add, has } = useCart()
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getListing(Number(id))
      .then(setListing)
      .catch((e) => setError((e as Error).message))
  }, [id])

  if (error) return <Text style={styles.error}>{error}</Text>
  if (!listing) return <ActivityIndicator color={colors.navy} style={{ marginTop: sp(10) }} />

  const meta = TYPE_META[listing.type]
  const soldOut = listing.quantity === 0
  const inCart = has(listing.id)

  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(12) }}>
      <View style={[styles.badge, { backgroundColor: meta.tint }]}>
        <Text style={{ color: meta.ink, fontWeight: '800', fontSize: 12 }}>{meta.badge}</Text>
      </View>
      <Text style={styles.loc}>{listing.location}</Text>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.desc}>{listing.description}</Text>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>
            {inr(listing.pricePerDay)}
            <Text style={styles.perDay}> /day</Text>
          </Text>
          <Text style={{ color: soldOut ? colors.danger : colors.ok, fontWeight: '700', fontSize: 13, marginTop: 2 }}>
            {soldOut ? 'Sold out' : `${listing.quantity} available`}
          </Text>
        </View>
      </View>

      <Pressable
        disabled={soldOut}
        onPress={() => add(listing)}
        style={[styles.btn, { backgroundColor: inCart ? colors.ok : colors.navy }, soldOut && { opacity: 0.5 }]}
      >
        <Text style={styles.btnText}>{soldOut ? 'Sold out' : inCart ? 'Added ✓ · add another' : 'Add to cart'}</Text>
      </Pressable>
      {inCart && (
        <Pressable onPress={() => router.push('/cart')} style={{ marginTop: sp(3), alignItems: 'center' }}>
          <Text style={{ color: colors.navy, fontWeight: '800' }}>View cart →</Text>
        </Pressable>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Good to know</Text>
        {(DETAILS[listing.type] ?? []).map((d, i) => (
          <Text key={i} style={styles.li}>{'•  ' + d}</Text>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginBottom: sp(2) },
  loc: { color: colors.faint, fontSize: 13 },
  title: { color: colors.ink, fontWeight: '900', fontSize: 24, marginTop: 2 },
  desc: { color: colors.muted, fontSize: 14.5, lineHeight: 21, marginTop: sp(2) },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: sp(4) },
  price: { color: colors.ink, fontWeight: '900', fontSize: 24 },
  perDay: { color: colors.faint, fontWeight: '400', fontSize: 13 },
  btn: { marginTop: sp(4), borderRadius: radius.md, paddingVertical: sp(3.5), alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4), marginTop: sp(5) },
  cardTitle: { color: colors.ink, fontWeight: '800', fontSize: 16, marginBottom: sp(2) },
  li: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  error: { color: colors.danger, padding: sp(4) },
})
