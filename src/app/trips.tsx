import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { getTrips } from '../lib/api'
import { inr } from '../lib/money'
import { colors, radius, sp } from '../lib/theme'
import type { TripPackage } from '../lib/types'

export default function Trips() {
  const router = useRouter()
  const [trips, setTrips] = useState<TripPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(10), gap: sp(3) }}>
      <Text style={styles.intro}>Whole trips, handled end to end — stays, rides, permits and support in one booking.</Text>

      {loading && <ActivityIndicator color={colors.navy} style={{ marginTop: sp(6) }} />}
      {error && <Text style={styles.error}>Couldn’t load: {error}</Text>}

      {!loading &&
        trips.map((t) => (
          <Pressable key={t.id} style={styles.card} onPress={() => router.push(`/trip/${t.id}`)}>
            <Text style={styles.route}>{t.durationDays} days · {t.route}</Text>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.summary} numberOfLines={3}>{t.summary}</Text>
            <View style={styles.row}>
              <Text style={styles.price}>
                {inr(t.pricePerPerson)}
                <Text style={styles.per}> /person</Text>
              </Text>
              <Text style={styles.view}>View trip →</Text>
            </View>
          </Pressable>
        ))}
      {!loading && !error && trips.length === 0 && <Text style={{ color: colors.faint }}>No trips available yet.</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: sp(1) },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4) },
  route: { color: colors.cyan, fontWeight: '800', fontSize: 12, letterSpacing: 0.3 },
  title: { color: colors.ink, fontWeight: '800', fontSize: 17, marginTop: sp(1) },
  summary: { color: colors.muted, fontSize: 13.5, lineHeight: 19, marginTop: sp(2) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: sp(3), borderTopWidth: 1, borderTopColor: colors.line, paddingTop: sp(3) },
  price: { color: colors.ink, fontWeight: '800', fontSize: 17 },
  per: { color: colors.faint, fontWeight: '400', fontSize: 12 },
  view: { color: colors.navy, fontWeight: '800' },
  error: { color: colors.danger },
})
