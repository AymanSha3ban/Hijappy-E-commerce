import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Home, ShoppingBag, LayoutDashboard, Globe, Menu, X } from 'lucide-react'

const ICON_PROPS = { size: 15, strokeWidth: 1.4 }

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location                    = useLocation()
  const { t, i18n }                 = useTranslation()
  const isRTL                       = i18n.language === 'ar'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const toggleLang = () => i18n.changeLanguage(isRTL ? 'en' : 'ar')

  const navItems = [
    { label: t('nav.collection'), to: '/',      icon: <Home           {...ICON_PROPS} /> },
    { label: t('nav.shop'),       to: '/shop',  icon: <ShoppingBag    {...ICON_PROPS} /> },
    { label: t('nav.admin'),      to: '/admin', icon: <LayoutDashboard {...ICON_PROPS} /> },
  ]

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: scrolled
          ? 'rgba(251,247,244,0.82)'
          : 'rgba(251,247,244,0.42)',
        backdropFilter:       'blur(48px) saturate(220%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.04)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.72)'
          : '1px solid rgba(255,255,255,0.28)',
        boxShadow: scrolled
          ? '0 4px 32px rgba(44,34,34,0.07), inset 0 1px 0 rgba(255,255,255,0.8)'
          : 'none',
        transition: 'background 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',
      }}
    >
      <motion.nav
        className="max-w-7xl mx-auto px-5 flex items-center justify-between"
        animate={{
          paddingTop:    scrolled ? '0.5rem' : '0.875rem',
          paddingBottom: scrolled ? '0.5rem' : '0.875rem',
        }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3.5 no-underline group" aria-label="Hijappy Home">
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            className="relative w-11 h-11 flex items-center justify-center overflow-hidden rounded-xl flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.72)',
              boxShadow: '0 4px 16px rgba(44,34,34,0.1)',
            }}
          >
            <img
              src="/hijappy.png"
              alt="Hijappy Logo"
              className="w-full h-full object-cover"
              style={{ filter: 'drop-shadow(0 0 6px rgba(161,89,19,0.22))' }}
            />
          </motion.div>

          <div className="flex flex-col leading-none">
            <span style={{
              fontFamily:    isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              fontWeight:    isRTL ? 700 : 500,
              fontSize:      '1.35rem',
              color:         'var(--color-charcoal)',
              letterSpacing: isRTL ? 0 : '-0.025em',
              lineHeight:    '1',
            }}>
              Hijappy
            </span>
            <span style={{
              fontSize:      '0.58rem',
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              color:         'var(--color-warm-taupe)',
              opacity:       0.72,
              marginTop:     '3px',
              fontFamily:    'var(--font-body)',
              fontWeight:    400,
            }}>
              {isRTL ? 'للفخامة عنوان' : 'Luxury Hijab'}
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex items-center gap-1.5 text-sm font-medium no-underline group py-2"
              style={{
                color:         isActive(item.to) ? 'var(--color-rose-gold)' : 'var(--color-charcoal)',
                letterSpacing: '0.025em',
                transition:    'color 0.22s ease',
              }}
            >
              <span style={{
                color:      isActive(item.to) ? 'var(--color-gold)' : 'var(--color-rose-sand)',
                transition: 'color 0.22s ease',
              }}>
                {item.icon}
              </span>
              {item.label}
              {/* Underline indicator */}
              <motion.span
                className="absolute -bottom-0.5 left-0 right-0 h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--color-gold), var(--color-rose-gold))' }}
                initial={{ scaleX: isActive(item.to) ? 1 : 0, opacity: isActive(item.to) ? 1 : 0 }}
                animate={{ scaleX: isActive(item.to) ? 1 : 0, opacity: isActive(item.to) ? 1 : 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              />
            </Link>
          ))}

          {/* Language Toggle */}
          <motion.button
            id="lang-toggle-btn"
            onClick={toggleLang}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            className="touch-target flex items-center gap-1.5 px-3.5 rounded-full text-xs font-medium cursor-pointer border-none"
            style={{
              background:    'rgba(255,255,255,0.55)',
              color:         'var(--color-mocha)',
              letterSpacing: '0.06em',
              fontFamily:    'var(--font-body)',
              border:        '1px solid rgba(200,169,154,0.3)',
              boxShadow:     '0 2px 8px rgba(44,34,34,0.06)',
              transition:    'background 0.22s ease, border-color 0.22s ease',
            }}
          >
            <Globe size={13} strokeWidth={1.4} style={{ color: 'var(--color-rose-gold)' }} />
            <AnimatePresence mode="wait">
              <motion.span
                key={i18n.language}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
              >
                {isRTL ? 'EN' : 'AR'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── Mobile Controls ── */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="touch-target flex items-center gap-1 px-3 rounded-full text-xs font-medium border-none cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.55)',
              color:      'var(--color-mocha)',
              border:     '1px solid rgba(200,169,154,0.25)',
            }}
          >
            <Globe size={12} strokeWidth={1.4} style={{ color: 'var(--color-rose-gold)' }} />
            {isRTL ? 'EN' : 'AR'}
          </button>
          <motion.button
            id="mobile-menu-btn"
            className="touch-target rounded-full cursor-pointer border-none"
            style={{
              background:     'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              color:          'var(--color-charcoal)',
              border:         '1px solid rgba(255,255,255,0.62)',
              boxShadow:      '0 2px 8px rgba(44,34,34,0.08)',
            }}
            onClick={() => setMobileOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.16 }}>
                  <X size={17} strokeWidth={1.5} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.16 }}>
                  <Menu size={17} strokeWidth={1.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden overflow-hidden"
            style={{
              background:          'rgba(251,247,244,0.92)',
              backdropFilter:      'blur(48px) saturate(220%)',
              WebkitBackdropFilter:'blur(48px) saturate(220%)',
              borderTop:           '1px solid rgba(200,169,154,0.18)',
            }}
          >
            <div className="flex flex-col px-5 py-2">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 py-4 text-sm no-underline border-b"
                    style={{
                      color:       isActive(item.to) ? 'var(--color-rose-gold)' : 'var(--color-charcoal)',
                      borderColor: 'rgba(200,169,154,0.12)',
                      fontWeight:  isActive(item.to) ? 600 : 400,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <span style={{ color: isActive(item.to) ? 'var(--color-gold)' : 'var(--color-rose-sand)' }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
