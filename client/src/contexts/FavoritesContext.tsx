import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface Product {
  id: number
  name: string
  price: number
  images: string[]
  colors: string[]
  category?: { name: string }
}

interface FavoritesContextType {
  favorites: Product[]
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: number) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hijappy_favorites')
    return saved ? JSON.parse(saved) : []
  })

  // Sync with LocalStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('hijappy_favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const isFavorite = (productId: number) => {
    return favorites.some((p) => p.id === productId)
  }

  const clearFavorites = () => setFavorites([])

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider')
  return context
}
