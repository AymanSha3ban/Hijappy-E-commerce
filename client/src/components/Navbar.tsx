import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Home, ShoppingBag, LayoutDashboard, Globe, Menu, X, Sun, Moon, Heart } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useFavorites } from '../contexts/FavoritesContext'
import Magnetic from './Magnetic'

const ICON_PROPS = { size: 15, strokeWidth: 1.4 }

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [favOpen, setFavOpen]       = useState(false)
  const location                    = useLocation()
  const { t, i18n }                 = useTranslation()
  const { isDark, toggleTheme }     = useTheme()
  const { favorites, toggleFavorite, clearFavorites } = useFavorites()
  const isRTL                       = i18n.language === 'ar'

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close favorites on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFavOpen(false)
      }
    }
    if (favOpen) document.addEventListener('mousedown', handleClickOutside)
    else document.removeEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [favOpen])

  useEffect(() => { setMobileOpen(false) }, [location])

  const toggleLang = () => i18n.changeLanguage(isRTL ? 'en' : 'ar')

  const navItems = [
    { label: t('nav.collection'), to: '/',      icon: <Home           {...ICON_PROPS} /> },
    { label: t('nav.shop'),       to: '/shop',  icon: <ShoppingBag    {...ICON_PROPS} /> },
    { label: t('nav.favorites'),  to: '/favorites', icon: (
      <div className="relative">
        <Heart {...ICON_PROPS} fill={favorites.length > 0 ? '#ef4444' : 'none'} className={favorites.length > 0 ? 'text-red-500' : ''} />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
        )}
      </div>
    ), isFavorites: true },
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
          ? (isDark ? 'rgba(26,15,16,0.92)' : '#F3E6E3')
          : (isDark ? 'rgba(26,15,16,0.55)' : '#F3E6E3'),
        // backdropFilter:       'blur(64px) saturate(220%) brightness(1.04)',
        // WebkitBackdropFilter: 'blur(64px) saturate(220%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(64px) saturate(220%) brightness(1.04)',
        borderBottom: scrolled
          ? (isDark ? '1px solid rgba(244,224,225,0.12)' : '1px solid rgba(255,255,255,0.3)')
          : (isDark ? '1px solid rgba(244,224,225,0.08)' : '1px solid rgba(255,255,255,0.2)'),
        boxShadow: scrolled
          ? (isDark
              ? '0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(244,224,225,0.06)'
              : '0 4px 32px rgba(244,224,225,0.07), inset 0 1px 0 rgba(255,255,255,0.8)')
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
        <Magnetic>
          <Link to="/" className="flex items-center gap-4 no-underline group relative z-10 transition-opacity hover:opacity-90" aria-label="Louli Home">
          {/* Logo Container - Made it more compact with a larger image focus */}
      
              <img 
                src="/weblogo.png" 
                alt="Louli" 
                className="w-20 h-20 object-contain transform transition-transform duration-300 group-hover:scale-150" 
              />

            {/* Brand Text */}
            <div className="flex flex-col justify-center leading-tight">
            <h1 style={{
             fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
             fontWeight: 700,
             fontSize: '1.7rem', // تكبير الخط شوية عشان يوازي اللوجو
             color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)',
             letterSpacing: isRTL ? '0' : '-0.04em',
             }}>
               Louli
            </h1>
           <span style={{
             fontSize: '0.6rem',
             textTransform: 'uppercase',
             letterSpacing: isRTL ? '0' : '0.4em',
             color: 'var(--color-rose-sand)',
             opacity: 0.9,
             marginTop: '-2px'
             }}>
            {isRTL ? 'للفخامة عنوان' : 'Luxury Hijab'}
            </span>
            </div>
          </Link>
        </Magnetic>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex items-center gap-1.5 text-sm font-medium no-underline group py-2"
              style={{
                color: isActive(item.to) 
                  ? 'var(--color-pastel-rose)' 
                  : (isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)'),
                letterSpacing: '0.025em',
                transition:    'color 0.22s ease',
              }}
            >
              <span style={{
                color: isActive(item.to) 
                  ? 'var(--color-pastel-rose)' 
                  : (isDark ? 'var(--color-dark-muted)' : 'var(--color-rose-sand)'),
                transition: 'color 0.22s ease',
              }}>
                {item.icon}
              </span>
              {item.label}
              {/* Underline indicator */}
              <motion.span
                className="absolute -bottom-0.5 left-0 right-0 h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--color-pastel-rose), var(--color-nude-pink))' }}
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
              background:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
              color:         isDark ? 'var(--color-dark-text)' : 'var(--color-mocha)',
              letterSpacing: '0.06em',
              fontFamily:    'var(--font-body)',
              border:        isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,169,154,0.3)',
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

          {/* Favorites Desktop */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setFavOpen(!favOpen)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,169,154,0.3)',
                color: favorites.length > 0 ? '#ef4444' : (isDark ? 'var(--color-dark-text)' : 'var(--color-mocha)'),
                transition: 'all 0.3s ease'
              }}
            >
              <Heart size={16} strokeWidth={2} fill={favorites.length > 0 ? '#ef4444' : 'none'} />
              <AnimatePresence>
                {favorites.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold"
                    style={{ fontSize: '0.65rem', border: '2px solid var(--color-cream)' }}
                  >
                    {favorites.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {favOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-12 end-0 w-80 rounded-2xl overflow-hidden z-50 glass-strong"
                  style={{ 
                    boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(44,34,34,0.12)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,169,154,0.2)'
                  }}
                >
                  <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,169,154,0.1)' }}>
                    <h3 className="text-sm font-medium m-0">{isRTL ? 'المفضلة' : 'My Favorites'}</h3>
                    {favorites.length > 0 && (
                      <button 
                        onClick={clearFavorites}
                        className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity border-none bg-none cursor-pointer"
                      >
                        {isRTL ? 'مسح الكل' : 'Clear All'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto scrollbar-hide py-2 px-3">
                    {favorites.length === 0 ? (
                      <div className="py-10 text-center opacity-40">
                        <Heart size={24} strokeWidth={1} className="mb-2 mx-auto" />
                        <p className="text-xs">{isRTL ? 'القائمة فارغة' : 'Your list is empty'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {favorites.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                            <img src={item.images[0]} alt="" className="w-12 h-16 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium truncate mb-0.5">{item.name}</h4>
                              <p className="text-[10px] opacity-60 m-0">{item.price} EGP</p>
                            </div>
                            <button 
                              onClick={() => toggleFavorite(item)}
                              className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all border-none cursor-pointer"
                            >
                              <X size={12} className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {favorites.length > 0 && (
                    <div className="p-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,169,154,0.1)' }}>
                      <Link 
                        to="/favorites" 
                        onClick={() => setFavOpen(false)}
                        className="btn-primary py-2.5 text-xs w-full flex items-center justify-center gap-2"
                      >
                        {isRTL ? 'عرض الكل' : 'View All'}
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Dark Mode Toggle — premium pill */}
          <motion.button
            id="theme-toggle-desktop"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="theme-toggle"
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <span className="theme-toggle__track" />
            <motion.span
              className="theme-toggle__thumb"
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.span key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={12} strokeWidth={2} style={{ color: '#0a0a0a' }} />
                  </motion.span>
                ) : (
                  <motion.span key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={12} strokeWidth={2} style={{ color: '#fff' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
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
            id="mobile-theme-btn"
            onClick={toggleTheme}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            className="touch-target w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))'
                : 'rgba(255,255,255,0.55)',
              color:  isDark ? 'var(--color-gold)' : 'var(--color-mocha)',
              border: isDark ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(200,169,154,0.25)',
              boxShadow: isDark ? '0 0 14px rgba(201,168,76,0.15)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span key="sun-m"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Sun size={16} strokeWidth={1.8} />
                </motion.span>
              ) : (
                <motion.span key="moon-m"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Moon size={16} strokeWidth={1.8} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          
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
              background:          isDark ? 'rgba(26,15,16,0.95)' : 'rgba(244,224,225,0.92)',
              backdropFilter:      'blur(64px) saturate(220%)',
              WebkitBackdropFilter:'blur(64px) saturate(220%)',
              borderTop:           isDark ? '1px solid rgba(244,224,225,0.08)' : '1px solid rgba(244,224,225,0.18)',
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
                      color:       isActive(item.to) ? 'var(--color-rose-gold)' : (isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)'),
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,169,154,0.12)',
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
