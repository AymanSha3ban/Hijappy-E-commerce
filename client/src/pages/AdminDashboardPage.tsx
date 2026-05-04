import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats } from '../services/api'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Home, LogOut,
  TrendingUp, Clock, Layers, Inbox,
} from 'lucide-react'

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
    const duration = 1000
    const start    = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => requestAnimationFrame(tick), delay * 1000)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55 }}
      className="stat-card"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 start-0 end-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-semibold mb-1" style={{ color: 'var(--color-charcoal)', fontFamily: 'var(--font-display)' }}>
            {display}
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.14em' }}>
            {label}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {icon}
        </div>
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
  const { t }             = useTranslation()
  const location          = window.location.pathname

  const navItems = [
    { label: t('admin.sidebar.dashboard'),  to: '/admin',            icon: <LayoutDashboard size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.products'),   to: '/admin/products',   icon: <Package         size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.categories'), to: '/admin/categories', icon: <Tag             size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.orders'),     to: '/admin/orders',     icon: <ShoppingBag     size={17} strokeWidth={1.5} /> },
    { label: t('admin.sidebar.storefront'), to: '/',                 icon: <Home            size={17} strokeWidth={1.5} /> },
  ]

  const isActive = (to: string) => to === '/admin' ? location === '/admin' : location.startsWith(to) && to !== '/'

  return (
    <aside
      className="hidden md:flex flex-col py-8 px-4 gap-1"
      style={{
        background:  'linear-gradient(180deg, var(--color-charcoal) 0%, #1a1010 100%)',
        position:    'sticky',
        top:         0,
        height:      '100vh',
        overflowY:   'auto',
        borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-rose-sand), var(--color-warm-taupe))' }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>H</span>
        </div>
        <span className="text-white text-xl" style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700 }}>حجابي</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
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
    </aside>
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
        <main className="p-6 md:p-10 overflow-auto">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
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
              className="admin-card overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-6 py-5 border-b"
                style={{ borderColor: 'rgba(200,169,154,0.15)' }}
              >
                <h2 className="text-xl" style={{ color: 'var(--color-charcoal)' }}>
                  {t('admin.dashboard.recent_orders')}
                </h2>
                <Link to="/admin/orders" className="text-sm no-underline" style={{ color: 'var(--color-rose-sand)' }}>
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
