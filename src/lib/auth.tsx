import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { AuthUser } from './types'

const KEY = 'gojulley_auth'

// expo-secure-store is native-only. On web (the browser preview) fall back to
// localStorage so the app still runs; on a real device we use SecureStore.
const store = {
  get(k: string): Promise<string | null> {
    if (Platform.OS === 'web') return Promise.resolve(globalThis.localStorage?.getItem(k) ?? null)
    return SecureStore.getItemAsync(k)
  },
  set(k: string, v: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(k, v)
      return Promise.resolve()
    }
    return SecureStore.setItemAsync(k, v)
  },
  del(k: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(k)
      return Promise.resolve()
    }
    return SecureStore.deleteItemAsync(k)
  },
}

interface AuthCtx {
  user: AuthUser | null
  ready: boolean
  signIn: (user: AuthUser) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    store
      .get(KEY)
      .then((raw) => {
        if (raw) {
          try {
            setUser(JSON.parse(raw) as AuthUser)
          } catch {
            // ignore corrupt value
          }
        }
      })
      .finally(() => setReady(true))
  }, [])

  function signIn(u: AuthUser) {
    setUser(u)
    void store.set(KEY, JSON.stringify(u))
  }
  function logout() {
    setUser(null)
    void store.del(KEY)
  }

  return <Ctx.Provider value={{ user, ready, signIn, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
