import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Home, ShoppingBag, LayoutDashboard, Globe, Menu, X } from 'lucide-react'

const ICON_PROPS = { size: 16, strokeWidth: 1.5 }

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location                    = useLocation()
  const { t, i18n }                 = useTranslation()
  const isRTL                       = i18n.language === 'ar'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
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
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        /* Always glassmorphism, gets stronger on scroll */
        background: scrolled
          ? 'rgba(251, 247, 244, 0.72)'
          : 'rgba(251, 247, 244, 0.45)',
        backdropFilter:       'blur(40px) saturate(220%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(1.05)',
        borderBottom: scrolled
          ? '1px solid rgba(255, 255, 255, 0.65)'
          : '1px solid rgba(255, 255, 255, 0.32)',
        boxShadow: scrolled
          ? '0 4px 40px rgba(44,34,34,0.08), inset 0 1px 0 rgba(255,255,255,0.7)'
          : 'none',
        transition: 'background 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease',
      }}
    >
      <motion.nav
        className="max-w-7xl mx-auto px-5 flex items-center justify-between"
        animate={{
          paddingTop:    scrolled ? '0.55rem' : '1rem',
          paddingBottom: scrolled ? '0.55rem' : '1rem',
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* ── Logo ── */}
       <Link to="/" className="flex items-center gap-4 no-underline group" aria-label="Hijappy Home">
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}
  >
    {/* تأكد من وضع ملف اللوجو في مجلد public باسم logo.png */}
    <img 
      src="/hijappy.png" 
      alt="Hijappy Logo" 
      className="w-full h-full object-cover"
      style={{ filter: 'drop-shadow(0 0 8px rgba(161, 89, 19, 0.3))' }}
    />
    
    {/* تأثير Glow خفيف عند الهوفر */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-tr from-[#a15913]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </motion.div>

  <div className="flex flex-col">
    <span style={{
      fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
      fontWeight: 700,
      fontSize: '1.4rem',
      color: 'var(--color-charcoal)',
      lineHeight: 1,
      letterSpacing: isRTL ? 0 : '-0.02em',
    }}>
      Hijappy
    </span>
    <span style={{
      fontSize: '0.65rem',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color: '#a15913',
      opacity: 0.8,
      marginTop: '2px'
    }}>
      {isRTL ? 'للفخامة عنوان' : 'Luxury Hijab'}
    </span>
  </div>
</Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex items-center gap-1.5 text-sm font-medium no-underline group"
              style={{
                color:         isActive(item.to) ? 'var(--color-rose-gold)' : 'var(--color-charcoal)',
                letterSpacing: '0.03em',
              }}
            >
              <span style={{ color: isActive(item.to) ? 'var(--color-gold)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--color-gold), var(--color-rose-gold))' }}
                initial={{ scaleX: isActive(item.to) ? 1 : 0 }}
                animate={{ scaleX: isActive(item.to) ? 1 : 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.25 }}
              />
            </Link>
          ))}

          {/* Language Toggle */}
          <motion.button
            id="lang-toggle-btn"
            onClick={toggleLang}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer border-none shimmer-btn"
            style={{
              background: 'linear-gradient(135deg, var(--color-blush), var(--color-blush-mid))',
              color:         'var(--color-mocha)',
              letterSpacing: '0.05em',
              fontFamily:    'var(--font-body)',
              boxShadow: '0 2px 8px rgba(200,169,154,0.22)',
            }}
          >
            <Globe size={14} strokeWidth={1.5} style={{ color: 'var(--color-rose-gold)' }} />
            <AnimatePresence mode="wait">
              <motion.span
                key={i18n.language}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.18 }}
              >
                {isRTL ? 'EN' : 'AR'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── Mobile Controls ── */}
        <div className="md:hidden flex items-center gap-2.5">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer"
            style={{ background: 'var(--color-blush)', color: 'var(--color-mocha)' }}
          >
            <Globe size={12} strokeWidth={1.5} style={{ color: 'var(--color-rose-gold)' }} />
            {isRTL ? 'EN' : 'AR'}
          </button>
          <motion.button
            id="mobile-menu-btn"
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              color: 'var(--color-charcoal)',
              border: '1px solid rgba(255,255,255,0.55)',
            }}
            onClick={() => setMobileOpen((v) => !v)}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X size={18} strokeWidth={1.5} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu size={18} strokeWidth={1.5} />
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(251,247,244,0.88)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              borderTop: '1px solid rgba(255,255,255,0.5)',
            }}
          >
            <div className="flex flex-col px-6 py-3 gap-0">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
                >
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 py-4 text-base no-underline border-b"
                    style={{
                      color:       isActive(item.to) ? 'var(--color-rose-gold)' : 'var(--color-charcoal)',
                      borderColor: 'rgba(200,169,154,0.15)',
                      fontWeight:  isActive(item.to) ? 600 : 400,
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
