import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats } from '../services/api'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Home, LogOut,
  TrendingUp, Clock, Layers, Inbox, Menu, X,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

interface Stats {
  totalOrders:      number
  totalProducts:    number
  totalCategories:  number
  pendingOrders:    number
  recentOrders:     Array<{ id: number; customerName: string; productName: string; status: string; createdAt: string }>
}

// ── Count-Up StatCard ─────────────────────────────────────────────────────────
interface StatCardProps {
  label:     string
  value:     number
  icon:      React.ReactNode
  accentColor: string
  delay:     number
}

function StatCard({ label, value, icon, accentColor, delay }: StatCardProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 1200
    const start    = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 4) // ease-out-quart
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => requestAnimationFrame(tick), delay * 1000)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
      className="admin-card group relative overflow-hidden p-6"
    >
      {/* Background Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
        style={{ background: accentColor }}
      />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.18em] mb-4 font-semibold opacity-60" style={{ color: 'var(--color-mocha)' }}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-light tracking-tight" style={{ color: 'var(--color-charcoal)', fontFamily: 'var(--font-display)' }}>
              {display}
            </h2>
            {value > 0 && (
              <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp size={10} /> +{(Math.random() * 5).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
          style={{ 
            background: `${accentColor}15`, 
            color: accentColor,
            boxShadow: `0 8px 16px -4px ${accentColor}33`
          }}
        >
          {icon}
        </div>
      </div>
      
      {/* Simple Mini Sparkline SVG */}
      <div className="mt-6 h-8 w-full opacity-40 group-hover:opacity-100 transition-opacity duration-500">
        <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
          <motion.path
            d="M0,15 Q10,5 20,12 T40,8 T60,15 T80,5 T100,12"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: delay + 0.5, duration: 1.5 }}
          />
        </svg>
      </div>
    </motion.div>
  )
}

const statusCls: Record<string, string> = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
}

// ── Admin Sidebar ─────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const { admin, logout } = useAuth()
  const navigate          = useNavigate()
  const { t, i18n }       = useTranslation()
  const location          = window.location.pathname
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isRTL = i18n.language === 'ar'

  const navItems = [
    { label: t('admin.sidebar.dashboard'),  to: '/admin',            icon: <LayoutDashboard size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.products'),   to: '/admin/products',   icon: <Package         size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.categories'), to: '/admin/categories', icon: <Tag             size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.orders'),     to: '/admin/orders',     icon: <ShoppingBag     size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.storefront'), to: '/',                 icon: <Home            size={17} strokeWidth={1.5} /> },
  ]

  const isActive = (to: string) => to === '/admin' ? location === '/admin' : location.startsWith(to) && to !== '/'

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between mb-10 px-3">
        <Link to="/admin" className="flex items-center gap-3 no-underline group">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all" />
            <img 
              src="/hijappy.png" 
              alt="Logo" 
              className="relative z-10 w-full h-full object-contain p-1"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-lg leading-tight" style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700 }}>حجابي</span>
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-medium">Management</span>
          </div>
        </Link>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm no-underline transition-all relative overflow-hidden"
              style={{
                color:      active ? '#fff' : 'rgba(255,255,255,0.58)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.58)' } }}
            >
              {active && (
                <div
                  className="absolute inset-y-0 start-0 w-0.5 rounded-full"
                  style={{ background: 'var(--color-gold)' }}
                />
              )}
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="px-3 py-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{t('admin.sidebar.logged_as')}</p>
          <p className="text-sm text-white truncate">{admin?.email}</p>
        </div>
        <button
          id="admin-logout-btn"
          onClick={() => { logout(); navigate('/admin/login') }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm cursor-pointer border-none transition-all"
          style={{ background: 'rgba(255,80,80,0.08)', color: '#FCA5A5' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,80,80,0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,80,80,0.08)')}
        >
          <LogOut size={16} strokeWidth={1.5} />
          {t('admin.sidebar.logout')}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile Toggle Button ── */}
      <div className="lg:hidden fixed top-4 start-4 z-40">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl shadow-lg border-none cursor-pointer"
          style={{ 
            background: 'var(--color-charcoal)', 
            color: '#fff',
            boxShadow: '0 8px 24px rgba(44,34,34,0.25)' 
          }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile Overlay & Drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: 'rgba(26,15,16,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 start-0 z-50 w-72 flex flex-col py-8 px-4 gap-1 lg:hidden shadow-2xl"
              style={{ 
                background: 'linear-gradient(180deg, var(--color-charcoal) 0%, #1a1010 100%)',
                boxShadow: isRTL ? '-20px 0 60px rgba(0,0,0,0.5)' : '20px 0 60px rgba(0,0,0,0.5)'
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col py-8 px-4 gap-1 w-64 flex-shrink-0"
        style={{
          background:  'linear-gradient(180deg, var(--color-charcoal) 0%, #1a1010 100%)',
          position:    'sticky',
          top:         0,
          height:      '100vh',
          overflowY:   'auto',
          borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { t, i18n }       = useTranslation()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `${t('admin.sidebar.dashboard')} | Hijappy`
    getDashboardStats().then((r) => setStats(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [t])

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const statCards = [
    { label: t('admin.dashboard.total_orders'),  value: stats?.totalOrders    ?? 0, icon: <ShoppingBag size={20} strokeWidth={1.5} />, accentColor: '#C8A99A', delay: 0     },
    { label: t('admin.dashboard.products'),      value: stats?.totalProducts  ?? 0, icon: <Package     size={20} strokeWidth={1.5} />, accentColor: '#7A9470', delay: 0.08  },
    { label: t('admin.dashboard.categories'),    value: stats?.totalCategories ?? 0, icon: <Layers     size={20} strokeWidth={1.5} />, accentColor: '#C9A84C', delay: 0.16  },
    { label: t('admin.dashboard.pending'),       value: stats?.pendingOrders  ?? 0, icon: <Clock       size={20} strokeWidth={1.5} />, accentColor: '#E07878', delay: 0.24  },
  ]

  return (
    <div style={{ background: 'var(--color-parchment)', minHeight: '100vh' }}>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl mb-1" style={{ color: 'var(--color-charcoal)' }}>
                  {t('admin.dashboard.greeting')}
                </h1>
                <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-warm-taupe)' }}>
                  <TrendingUp size={14} strokeWidth={1.5} />
                  {new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <Link
                to="/admin/products"
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.65rem 1.5rem' }}
              >
                {t('admin.dashboard.add_product')}
              </Link>
            </div>

            {/* Stat Cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-3xl h-36" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>
            )}

            {/* Recent Orders table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="admin-card overflow-hidden border-none shadow-xl"
              style={{ background: '#fff' }}
            >
              <div
                className="flex items-center justify-between px-8 py-6 border-b"
                style={{ borderColor: 'rgba(200,169,154,0.1)' }}
              >
                <div>
                  <h2 className="text-xl font-medium" style={{ color: 'var(--color-charcoal)' }}>
                    {t('admin.dashboard.recent_orders')}
                  </h2>
                  <p className="text-xs opacity-50 mt-1">Real-time order tracking and updates</p>
                </div>
                <Link to="/admin/orders" className="btn-outline text-xs px-4 py-2">
                  {t('admin.dashboard.view_all')}
                </Link>
              </div>

              {!stats?.recentOrders?.length ? (
                /* Empty state */
                <div className="text-center py-16 flex flex-col items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--color-parchment)' }}
                  >
                    <Inbox size={28} strokeWidth={1} style={{ color: 'var(--color-warm-taupe)' }} />
                  </div>
                  <div>
                    <p className="text-base font-medium mb-1" style={{ color: 'var(--color-charcoal)' }}>
                      {t('admin.dashboard.no_orders')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>
                      {i18n.language === 'ar' ? 'الطلبات ستظهر هنا عند وصولها.' : 'Orders will appear here when they arrive.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--color-parchment)' }}>
                        {[t('table.id'), t('table.customer'), t('table.product'), t('table.status'), t('table.date')].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.12em' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((o, i) => (
                        <tr
                          key={o.id}
                          className="border-t table-row-hover"
                          style={{
                            borderColor: 'rgba(200,169,154,0.12)',
                            background:  i % 2 === 0 ? '#fff' : 'rgba(250,246,242,0.45)',
                          }}
                        >
                          <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--color-warm-taupe)' }}>#{o.id}</td>
                          <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>{o.customerName}</td>
                          <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-charcoal)' }}>{o.productName}</td>
                          <td className="px-6 py-4"><span className={`badge ${statusCls[o.status] ?? ''}`}>{o.status}</span></td>
                          <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-warm-taupe)' }}>
                            {new Date(o.createdAt).toLocaleDateString(locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
