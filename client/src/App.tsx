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

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0   },
  exit:    { opacity: 0, y: -12 },
}

const pageTransition = {
  duration: 0.38,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public Storefront ── */}
        <Route path="/"            element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/shop"         element={<PageWrapper><ShopPage /></PageWrapper>} />
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
    </>
  )
}
