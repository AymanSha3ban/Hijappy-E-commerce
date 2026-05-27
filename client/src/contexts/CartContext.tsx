import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  stock: number
  image?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hijappy_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('hijappy_cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: Math.min(i.stock, i.quantity + newItem.quantity) }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(i.stock, Math.max(1, quantity)) } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
