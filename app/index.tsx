import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, radius, sp } from '../src/lib/theme'

export default function Home() {
  const router = useRouter()
  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(10) }}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>STAYS · RIDES · WHOLE TRIPS · 11,500 FT</Text>
        <Text style={styles.heroTitle}>Your whole Ladakh trip, handled.</Text>
        <Text style={styles.heroBody}>
          Curated packages or individual stays and rides across Leh, Nubra and Pangong — permits, driver and support,
          booked and paid in one place.
        </Text>
      </View>

      <Text style={styles.eyebrow}>ONE PLATFORM · EVERYTHING IN ONE PLACE</Text>
      <Text style={styles.h2}>Two ways to plan your trip</Text>

      <Pressable style={styles.card} onPress={() => router.push('/search')}>
        <Text style={[styles.badge, { backgroundColor: '#f0fdfa', color: '#0f766e' }]}>Your way</Text>
        <Text style={styles.cardTitle}>Build your own trip</Text>
        <Text style={styles.cardBody}>Pick your own stays, taxis, bikes and services — and book them together.</Text>
        <Text style={styles.cta}>Browse stays, rides &amp; services →</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/search')}>
        <Text style={styles.badge}>Popular</Text>
        <Text style={styles.cardTitle}>Explore the catalogue</Text>
        <Text style={styles.cardBody}>Hotels, homestays, taxis with drivers, self-drive bikes and add-on services across Ladakh.</Text>
        <Text style={styles.cta}>Start browsing →</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.navy, borderRadius: radius.lg, padding: sp(6), marginBottom: sp(5) },
  heroEyebrow: { color: '#c7d0f0', fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 26, marginTop: sp(2), lineHeight: 32 },
  heroBody: { color: '#c7d0f0', marginTop: sp(2), lineHeight: 20, fontSize: 14 },
  eyebrow: { color: colors.cyan, fontWeight: '800', fontSize: 11, letterSpacing: 1, marginBottom: sp(1) },
  h2: { color: colors.ink, fontWeight: '800', fontSize: 22, marginBottom: sp(4) },
  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg,
    padding: sp(5), marginBottom: sp(4),
  },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: 'hidden', marginBottom: sp(2),
  },
  cardTitle: { color: colors.ink, fontWeight: '800', fontSize: 18, marginBottom: sp(1) },
  cardBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  cta: { color: colors.navy, fontWeight: '800', marginTop: sp(3) },
})
