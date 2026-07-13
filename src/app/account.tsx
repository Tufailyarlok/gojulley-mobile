import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { deleteAccount } from '../lib/api'
import { useAuth } from '../lib/auth'
import { colors, radius, sp } from '../lib/theme'

// Public site hosting the legal/support pages (same content as the web app).
// TODO: switch to https://gojulley.com once the domain's DNS is pointed.
const SITE = 'https://gojulley-frontend.onrender.com'
const openPage = (path: string) => WebBrowser.openBrowserAsync(SITE + path)

// Legal & support links — must be reachable in-app for store review (privacy
// especially), signed in or out.
function LegalLinks() {
  return (
    <View style={styles.group}>
      <Row label="Privacy Policy" sub="How we handle your data" onPress={() => openPage('/privacy')} />
      <Row label="Terms of Service" sub="The rules of using GoJulley" onPress={() => openPage('/terms')} />
      <Row label="Support" sub="Get help or contact us" onPress={() => openPage('/support')} last />
    </View>
  )
}

export default function Account() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [deleting, setDeleting] = useState(false)

  // Signed out — prompt to log in, but still expose legal & support links.
  if (!user) {
    return (
      <ScrollView contentContainerStyle={{ padding: sp(5), paddingBottom: sp(12) }}>
        <View style={styles.signedOutTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarGlyph}>👤</Text>
          </View>
          <Text style={styles.emptyTitle}>You’re not signed in</Text>
          <Text style={styles.emptyBody}>
            Log in to book trips, track your bookings and use offers at checkout.
          </Text>
          <Pressable style={[styles.primary, { alignSelf: 'stretch' }]} onPress={() => router.push('/login')}>
            <Text style={styles.primaryText}>Log in or create account</Text>
          </Pressable>
        </View>

        <Text style={styles.legalHeading}>Legal &amp; support</Text>
        <LegalLinks />
      </ScrollView>
    )
  }

  const initial = (user.name || user.email).trim().charAt(0).toUpperCase()

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You’ll need to log in again to book.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/') } },
    ])

  async function reallyDelete() {
    setDeleting(true)
    try {
      await deleteAccount(user!.token)
      logout()
      router.replace('/')
    } catch (e) {
      Alert.alert('Couldn’t delete account', (e as Error).message)
    } finally {
      setDeleting(false)
    }
  }
  const confirmDelete = () =>
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account, bookings and reviews. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: reallyDelete },
      ],
    )

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

      <Text style={styles.legalHeading}>Legal &amp; support</Text>
      <LegalLinks />

      <Pressable style={styles.logout} onPress={confirmLogout} disabled={deleting}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <Pressable style={styles.deleteBtn} onPress={confirmDelete} disabled={deleting}>
        <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Delete account'}</Text>
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
  deleteBtn: { alignItems: 'center', paddingVertical: sp(4), marginTop: sp(1) },
  deleteText: { color: colors.faint, fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },

  signedOutTop: { alignItems: 'center', marginTop: sp(4), marginBottom: sp(6) },
  legalHeading: { color: colors.faint, fontSize: 12, fontWeight: '800', marginBottom: sp(2), marginLeft: sp(1) },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp(6) },
  emptyTitle: { color: colors.ink, fontWeight: '900', fontSize: 20, marginBottom: sp(2) },
  emptyBody: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: sp(5) },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3.5), paddingHorizontal: sp(6), alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
})
