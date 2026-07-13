import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { getListings } from '../src/lib/api'
import { useCart } from '../src/lib/cart'
import { inr } from '../src/lib/money'
import { colors, radius, sp, TYPE_META } from '../src/lib/theme'
import type { Listing } from '../src/lib/types'

const CATS = [
  { key: 'stays', label: 'Stays', match: (l: Listing) => l.type === 'HOTEL' || l.type === 'HOMESTAY' },
  { key: 'bikes', label: 'Bikes', match: (l: Listing) => l.type === 'BIKE' },
  { key: 'cars', label: 'Taxi', match: (l: Listing) => l.type === 'CAR' },
  { key: 'services', label: 'Services', match: (l: Listing) => l.type === 'SERVICE' },
] as const

export default function Search() {
  const router = useRouter()
  const { has } = useCart()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<(typeof CATS)[number]['key']>('stays')

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const shown = useMemo(() => {
    const cat = CATS.find((c) => c.key === tab)!
    return listings.filter(cat.match)
  }, [listings, tab])

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: sp(3), gap: sp(2) }} style={{ flexGrow: 0 }}>
        {CATS.map((c) => {
          const sel = tab === c.key
          return (
            <Pressable key={c.key} onPress={() => setTab(c.key)} style={[styles.pill, sel && styles.pillActive]}>
              <Text style={[styles.pillText, sel && styles.pillTextActive]}>{c.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {loading && <ActivityIndicator color={colors.navy} style={{ marginTop: sp(8) }} />}
      {error && <Text style={styles.error}>Couldn’t load: {error}</Text>}

      <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(10), gap: sp(3) }}>
        {!loading &&
          shown.map((l) => {
            const meta = TYPE_META[l.type]
            return (
              <Pressable key={l.id} style={styles.card} onPress={() => router.push(`/listing/${l.id}`)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={[styles.badge, { backgroundColor: meta.tint }]}>
                    <Text style={{ color: meta.ink, fontWeight: '800', fontSize: 12 }}>{meta.badge}</Text>
                  </View>
                  {has(l.id) && (
                    <View style={styles.inCart}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>✓ In cart</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.title}>{l.title}</Text>
                <Text style={styles.loc}>{l.location}</Text>
                <Text style={styles.desc} numberOfLines={2}>{l.description}</Text>
                <View style={styles.row}>
                  <Text style={styles.price}>
                    {inr(l.pricePerDay)}
                    <Text style={styles.perDay}> /day</Text>
                  </Text>
                  <Text style={styles.view}>View →</Text>
                </View>
              </Pressable>
            )
          })}
        {!loading && shown.length === 0 && <Text style={{ color: colors.faint }}>Nothing here yet.</Text>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: sp(4), paddingVertical: sp(2), backgroundColor: '#fff' },
  pillActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  pillText: { color: colors.muted, fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4) },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  inCart: { backgroundColor: colors.ok, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  title: { color: colors.ink, fontWeight: '800', fontSize: 16, marginTop: sp(2) },
  loc: { color: colors.faint, fontSize: 13, marginTop: 2 },
  desc: { color: colors.muted, fontSize: 13.5, marginTop: sp(2), lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: sp(3), borderTopWidth: 1, borderTopColor: colors.line, paddingTop: sp(3) },
  price: { color: colors.ink, fontWeight: '800', fontSize: 17 },
  perDay: { color: colors.faint, fontWeight: '400', fontSize: 12 },
  view: { color: colors.navy, fontWeight: '800' },
  error: { color: colors.danger, padding: sp(4) },
})
