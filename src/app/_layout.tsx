import { type ReactNode } from 'react'
import { Stack, useRouter, usePathname } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { SymbolView } from 'expo-symbols'
import { LinearGradient } from 'expo-linear-gradient'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { AuthProvider, useAuth } from '../lib/auth'
import { CartProvider, useCart } from '../lib/cart'
import RazorpayCheckout from '../components/RazorpayCheckout'
import { colors } from '../lib/theme'

// Liquid-glass chips when the platform supports it (iOS 26+), frosted fallback otherwise.
const GLASS = isLiquidGlassAvailable()

function HeaderGradient() {
  return <LinearGradient colors={['#28328c', '#1f6fb2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
}

// A round header chip — real liquid glass where available, translucent view otherwise.
// `selected` marks the chip for the screen you're currently on (bright white ring).
// Header chip sizing: the chip for the screen you're on grows, the other shrinks.
const CHIP = { md: 32, big: 38, sm: 28 }
const chipSize = (mine: boolean, either: boolean) => (mine ? CHIP.big : either ? CHIP.sm : CHIP.md)
const chipStyle = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.4)',
})

// A round header chip — real liquid glass where available, translucent otherwise.
// A navy tint darkens the glass so the white icons stay readable over the gradient.
function Chip({ children, selected, size }: { children: ReactNode; selected?: boolean; size: number }) {
  const base = chipStyle(size)
  const ring = selected ? { borderColor: '#fff', borderWidth: 2 } : null
  if (GLASS) {
    return (
      <GlassView style={[base, ring]} glassEffectStyle="regular" tintColor="rgba(22,30,92,0.5)">
        {children}
      </GlassView>
    )
  }
  return <View style={[base, ring, { backgroundColor: 'rgba(22,30,92,0.5)' }]}>{children}</View>
}

const cartBadge = {
  position: 'absolute' as const,
  top: -3,
  right: -2,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: colors.danger,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 4,
  borderWidth: 1.5,
  borderColor: colors.navy,
}

function CartButton() {
  const { count } = useCart()
  const router = useRouter()
  const path = usePathname()
  const onCart = path === '/cart'
  const size = chipSize(onCart, onCart || path === '/account')
  const icon = Math.round(size * 0.52)
  const active = count > 0
  // Open as a top-level destination: reset to home first so Back returns to
  // GoJulley in one tap instead of retracing every Cart/Account toggle.
  const open = () => {
    if (onCart) return
    if (path !== '/') router.dismissAll()
    router.push('/cart')
  }
  return (
    <Pressable onPress={open} hitSlop={8} style={{ paddingHorizontal: 4 }} accessibilityLabel="Cart">
      <Chip selected={onCart} size={size}>
        <SymbolView
          name={active ? 'cart.fill' : 'cart'}
          size={icon}
          tintColor="#fff"
          weight="semibold"
          fallback={<Text style={{ fontSize: icon }}>🛒</Text>}
        />
      </Chip>
      {active && (
        <View style={cartBadge}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 10 }}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </Pressable>
  )
}

// Account control in the header → opens the Account screen. Signed in shows a
// cyan brand chip with the user's initial; signed out shows a frosted person icon.
function AccountButton() {
  const { user } = useAuth()
  const router = useRouter()
  const path = usePathname()
  const onAccount = path === '/account'
  const size = chipSize(onAccount, onAccount || path === '/cart')
  const icon = Math.round(size * 0.52)
  const initial = user ? (user.name || user.email).trim().charAt(0).toUpperCase() : null
  const open = () => {
    if (onAccount) return
    if (path !== '/') router.dismissAll()
    router.push('/account')
  }

  return (
    <Pressable onPress={open} hitSlop={8} style={{ paddingHorizontal: 4 }} accessibilityLabel="Account">
      {initial ? (
        <View
          style={[
            chipStyle(size),
            { backgroundColor: colors.cyan, borderColor: 'rgba(255,255,255,0.7)' },
            onAccount && { borderColor: '#fff', borderWidth: 2 },
          ]}
        >
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: Math.round(size * 0.42) }}>{initial}</Text>
        </View>
      ) : (
        <Chip selected={onAccount} size={size}>
          <SymbolView name="person.fill" size={icon} tintColor="#fff" weight="semibold" fallback={<Text style={{ fontSize: icon }}>👤</Text>} />
        </Chip>
      )}
    </Pressable>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.navy },
              headerBackground: () => <HeaderGradient />,
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '800' },
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AccountButton />
                  <CartButton />
                </View>
              ),
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'GoJulley' }} />
            <Stack.Screen name="search" options={{ title: 'Browse' }} />
            <Stack.Screen name="trips" options={{ title: 'Trip packages' }} />
            <Stack.Screen name="trip/[id]" options={{ title: 'Trip' }} />
            <Stack.Screen name="cart" options={{ title: 'Your cart' }} />
            <Stack.Screen name="account" options={{ title: 'Account' }} />
            <Stack.Screen name="bookings" options={{ title: 'My bookings' }} />
            <Stack.Screen name="explore" options={{ title: 'Explore Ladakh' }} />
            <Stack.Screen name="login" options={{ title: 'Log in' }} />
            <Stack.Screen name="listing/[id]" options={{ title: 'Details' }} />
          </Stack>
          <RazorpayCheckout />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
