import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import type { AuthUser } from './types'

const KEY = 'gojulley_auth'

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
    SecureStore.getItemAsync(KEY)
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
    void SecureStore.setItemAsync(KEY, JSON.stringify(u))
  }
  function logout() {
    setUser(null)
    void SecureStore.deleteItemAsync(KEY)
  }

  return <Ctx.Provider value={{ user, ready, signIn, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
