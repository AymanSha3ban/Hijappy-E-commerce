import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import ProtectedRoute from './components/ProtectedRoute'
import FavoritesPage from './pages/FavoritesPage'
import { FavoritesProvider } from './contexts/FavoritesContext'

// ── Stagger children variants ─────────────────────────────────────────────────
const pageContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
  },
}

const pageContentVariants = {
  initial: { opacity: 0, y: 28, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', minHeight: '100vh' }}
    >
      <motion.div variants={pageContentVariants}>
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <FavoritesProvider>
      <ScrollToTop />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public Storefront ── */}
        <Route path="/"            element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/shop"         element={<PageWrapper><ShopPage /></PageWrapper>} />
        <Route path="/favorites"    element={<PageWrapper><FavoritesPage /></PageWrapper>} />
        <Route path="/products/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />

        {/* ── Admin Auth ── */}
        <Route path="/admin/login" element={<PageWrapper><AdminLoginPage /></PageWrapper>} />

        {/* ── Protected Admin Routes ── */}
        <Route path="/admin"            element={<ProtectedRoute><PageWrapper><AdminDashboardPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/products"   element={<ProtectedRoute><PageWrapper><AdminProductsPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><PageWrapper><AdminCategoriesPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/orders"     element={<ProtectedRoute><PageWrapper><AdminOrdersPage /></PageWrapper></ProtectedRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={
          <div
            className="min-h-screen flex flex-col items-center justify-center gap-6"
            style={{ background: 'var(--color-cream)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="text-center"
            >
              <p
                style={{
                  fontSize:   '7rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 300,
                  color:      'var(--color-blush)',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}
              >
                404
              </p>
              <p className="text-xl mb-6" style={{ color: 'var(--color-charcoal)' }}>
                الصفحة غير موجودة
              </p>
              <a href="/" className="btn-primary inline-flex items-center gap-2">
                ← العودة للرئيسية
              </a>
            </motion.div>
          </div>
        } />
      </Routes>
    </AnimatePresence>
    </FavoritesProvider>
  )
}
