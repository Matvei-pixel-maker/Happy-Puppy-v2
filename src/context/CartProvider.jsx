import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext'

const STORAGE_KEY = 'happy-puppy-order'

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // приватный режим — просто не сохраняем
    }
  }, [items])

  const addItem = useCallback((entry) => {
    const key = `${entry.code}-${entry.volume}-${entry.iceIndex}-${entry.sweetIndex}`
    setItems((prev) => {
      const existing = prev.find((item) => item.key === key)
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [...prev, { ...entry, key, qty: 1 }]
    })
  }, [])

  const changeQty = useCallback((key, diff) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, qty: item.qty + diff } : item,
        )
        .filter((item) => item.qty > 0),
    )
  }, [])

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      addItem,
      changeQty,
      removeItem,
      clear,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [items, count, total, addItem, changeQty, removeItem, clear, isDrawerOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
