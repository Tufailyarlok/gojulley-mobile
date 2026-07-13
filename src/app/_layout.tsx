import { Stack, useRouter } from 'expo-router'
import { Pressable, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../lib/auth'
import { CartProvider, useCart } from '../lib/cart'
import { colors } from '../lib/theme'

function CartButton() {
  const { count } = useCart()
  const router = useRouter()
  return (
    <Pressable onPress={() => router.push('/cart')} hitSlop={8} style={{ paddingHorizontal: 6 }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Cart{count ? ` (${count})` : ''}</Text>
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
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '800' },
              headerRight: () => <CartButton />,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'GoJulley' }} />
            <Stack.Screen name="search" options={{ title: 'Browse' }} />
            <Stack.Screen name="trips" options={{ title: 'Trip packages' }} />
            <Stack.Screen name="trip/[id]" options={{ title: 'Trip' }} />
            <Stack.Screen name="cart" options={{ title: 'Your cart' }} />
            <Stack.Screen name="bookings" options={{ title: 'My bookings' }} />
            <Stack.Screen name="explore" options={{ title: 'Explore Ladakh' }} />
            <Stack.Screen name="login" options={{ title: 'Log in' }} />
            <Stack.Screen name="listing/[id]" options={{ title: 'Details' }} />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
