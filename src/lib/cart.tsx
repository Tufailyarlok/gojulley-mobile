import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Listing, ListingType } from './types'

export interface CartItem {
  listingId: number
  title: string
  type: ListingType
  pricePerDay: number
  quantity: number
}

interface CartCtx {
  items: CartItem[]
  count: number
  add: (listing: Listing, qty?: number) => void
  setQty: (listingId: number, qty: number) => void
  remove: (listingId: number) => void
  clear: () => void
  has: (listingId: number) => boolean
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'gojulley_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          try {
            setItems(JSON.parse(raw) as CartItem[])
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (loaded) void AsyncStorage.setItem(KEY, JSON.stringify(items))
  }, [items, loaded])

  function add(listing: Listing, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.listingId === listing.id)
      if (existing) {
        return prev.map((i) => (i.listingId === listing.id ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [
        ...prev,
        { listingId: listing.id, title: listing.title, type: listing.type, pricePerDay: listing.pricePerDay, quantity: qty },
      ]
    })
  }
  function setQty(listingId: number, qty: number) {
    setItems((prev) => prev.map((i) => (i.listingId === listingId ? { ...i, quantity: Math.max(1, qty) } : i)))
  }
  function remove(listingId: number) {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId))
  }
  function clear() {
    setItems([])
  }
  const count = items.reduce((n, i) => n + i.quantity, 0)
  const has = (listingId: number) => items.some((i) => i.listingId === listingId)

  return <Ctx.Provider value={{ items, count, add, setQty, remove, clear, has }}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used within CartProvider')
  return c
}
