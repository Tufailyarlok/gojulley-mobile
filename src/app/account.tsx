import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../lib/auth'
import { colors, radius, sp } from '../lib/theme'

export default function Account() {
  const router = useRouter()
  const { user, logout } = useAuth()

  // Signed out — prompt to log in.
  if (!user) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>👤</Text>
        </View>
        <Text style={styles.emptyTitle}>You’re not signed in</Text>
        <Text style={styles.emptyBody}>
          Log in to book trips, track your bookings and use offers at checkout.
        </Text>
        <Pressable style={styles.primary} onPress={() => router.push('/login')}>
          <Text style={styles.primaryText}>Log in or create account</Text>
        </Pressable>
      </View>
    )
  }

  const initial = (user.name || user.email).trim().charAt(0).toUpperCase()

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You’ll need to log in again to book.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/') } },
    ])

  return (
    <ScrollView contentContainerStyle={{ padding: sp(5), paddingBottom: sp(12) }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user.name || 'Traveller'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role === 'ADMIN' && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>ADMIN</Text>
          </View>
        )}
      </View>

      <View style={styles.group}>
        <Row label="My bookings" sub="View and manage your trips" onPress={() => router.push('/bookings')} />
        <Row label="Your cart" sub="Items you’re ready to book" onPress={() => router.push('/cart')} />
        <Row label="Trip packages" sub="Ready-made Ladakh trips" onPress={() => router.push('/trips')} last />
      </View>

      <View style={styles.group}>
        <View style={styles.infoRow}>
          <Text style={styles.rowLabel}>Offers &amp; payment</Text>
          <Text style={styles.rowSub}>
            Coupons apply at checkout. Pay in full, or reserve with a 10% advance and settle the balance at Leh.
          </Text>
        </View>
      </View>

      <Pressable style={styles.logout} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  )
}

function Row({ label, sub, onPress, last }: { label: string; sub: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable style={[styles.row, !last && styles.rowBorder]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: sp(6) },
  avatar: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: colors.navy,
    alignItems: 'center', justifyContent: 'center', marginBottom: sp(3),
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 30 },
  avatarGlyph: { fontSize: 34 },
  name: { color: colors.ink, fontWeight: '900', fontSize: 22 },
  email: { color: colors.faint, fontSize: 14, marginTop: 2 },
  roleBadge: {
    marginTop: sp(2), backgroundColor: colors.lavender, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  roleText: { color: colors.navy, fontWeight: '800', fontSize: 11, letterSpacing: 1 },

  group: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg,
    overflow: 'hidden', marginBottom: sp(4),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp(3), paddingVertical: sp(4), paddingHorizontal: sp(4) },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  infoRow: { paddingVertical: sp(4), paddingHorizontal: sp(4) },
  rowLabel: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  rowSub: { color: colors.faint, fontSize: 13, marginTop: 2, lineHeight: 18 },
  chevron: { color: colors.faint, fontSize: 24, fontWeight: '300' },

  logout: {
    borderWidth: 1.5, borderColor: colors.danger, borderRadius: radius.md,
    paddingVertical: sp(3.5), alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '800', fontSize: 15 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp(6) },
  emptyTitle: { color: colors.ink, fontWeight: '900', fontSize: 20, marginBottom: sp(2) },
  emptyBody: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: sp(5) },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3.5), paddingHorizontal: sp(6), alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
})
