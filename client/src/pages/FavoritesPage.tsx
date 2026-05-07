import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '../contexts/FavoritesContext'
import { useTheme } from '../contexts/ThemeContext'
import ProductCard from '../components/ProductCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FavoritesPage() {
  const { i18n } = useTranslation()
  const { favorites } = useFavorites()
  const { isDark } = useTheme()
  const isAr = i18n.language === 'ar'

  return (
    <div className="page-wrapper" style={{ background: isDark ? 'var(--color-dark-bg)' : 'var(--color-cream)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 pt-32 pb-24 min-h-[70vh]">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ 
              background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            <Heart size={28} fill="#ef4444" className="text-red-500" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl mb-4"
            style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}
          >
            {isAr ? 'مجموعتي المفضلة' : 'My Favorites'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm uppercase tracking-widest"
            style={{ color: 'var(--color-rose-sand)', letterSpacing: '0.2em' }}
          >
            {isAr ? `${favorites.length} قطعة مختارة` : `${favorites.length} Handpicked Pieces`}
          </motion.p>
          <div className="divider-gold" />
        </header>

        <AnimatePresence mode="wait">
          {favorites.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {favorites.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 flex flex-col items-center"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--color-parchment)' }}
              >
                <ShoppingBag size={40} strokeWidth={1} style={{ color: 'var(--color-rose-sand)' }} />
              </div>
              <h2 className="text-2xl mb-4" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>
                {isAr ? 'قائمة أمنياتك فارغة' : 'Your Wishlist is Empty'}
              </h2>
              <p className="max-w-xs mx-auto mb-8 opacity-70">
                {isAr 
                  ? 'ابدأ بإضافة بعض القطع الفاخرة التي تعجبك لتجدها هنا لاحقاً.' 
                  : 'Start adding luxury pieces you love and they will appear here.'}
              </p>
              <Link to="/shop" className="btn-primary btn-liquid flex items-center gap-2">
                {isAr ? 'اكتشف المجموعة' : 'Discover Collection'}
                <ArrowRight size={16} className={isAr ? 'rotate-180' : ''} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
