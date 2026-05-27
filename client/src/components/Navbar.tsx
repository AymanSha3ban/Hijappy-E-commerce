import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Home, ShoppingBag, LayoutDashboard, Globe, Menu, X, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

import { useCart } from '../contexts/CartContext'
import Magnetic from './Magnetic'
import Logo from "../assets/Logo.png"

const ICON_PROPS = { size: 15, strokeWidth: 1.4 }

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [favOpen, setFavOpen]       = useState(false)
  const [isMobile, setIsMobile]     = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const location                    = useLocation()
  const { t, i18n }                 = useTranslation()
  const { isDark, toggleTheme }     = useTheme()
  const { cartCount }               = useCart()
  const isRTL                       = i18n.language === 'ar'

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
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
    { label: isRTL ? 'عربة التسوق' : 'Cart',    to: '/cart',  icon: (
      <div className="relative">
        <ShoppingBag {...ICON_PROPS} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white flex items-center justify-center text-[8px] text-white font-bold">
            {cartCount}
          </span>
        )}
      </div>
    ) },
    { label: t('nav.admin'),      to: '/admin', icon: <LayoutDashboard {...ICON_PROPS} /> },
  ]

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={
        isMobile
          ? {
              background: '#FBF7F4',
              borderBottom: '1px solid #D4AF37',
              transition: 'background 0.3s ease',
            }
          : {
              background: scrolled
                ? (isDark ? 'rgba(26,15,16,0.92)' : '#F3E6E3')
                : (isDark ? 'rgba(26,15,16,0.55)' : '#F3E6E3'),
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
            }
      }
    >
      {/* ── Mobile Nav Wrapper ── */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 w-full relative">
        {/* Left: Hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-[#D4AF37] border-none bg-transparent p-0 cursor-pointer flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center: Branding */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 no-underline" onClick={() => setMobileOpen(false)}>
          <img src={Logo} alt="Louli" className="h-9 object-contain" />
          <div className="flex flex-col justify-center text-left">
            <span className="text-[#0f172a] font-bold font-serif text-xl leading-none m-0 p-0" style={{ letterSpacing: '-0.02em' }}>Louli</span>
            <span className="text-[#D4AF37] text-[10px] leading-none mt-1 m-0 p-0 font-medium uppercase tracking-widest">{t('luxuryHijabs')}</span>
          </div>
        </Link>

        {/* Right Icons: Search + Cart */}
        <div className="flex items-center gap-3">
          <Link to="/shop?searchFocus=true" className="text-[#D4AF37] border-none bg-transparent p-0 cursor-pointer flex items-center justify-center">
            <Search size={22} />
          </Link>
          <Link to="/cart" className="text-[#D4AF37] flex items-center justify-center relative">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <motion.nav
        className="hidden md:flex max-w-7xl mx-auto px-5 items-center justify-between w-full"
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
                src={Logo}
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
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 
                `relative flex items-center gap-1.5 text-sm no-underline group py-2 transition-all duration-300 ease-in-out ${
                  isActive 
                    ? 'text-[#0a1e36] font-bold' 
                    : isDark ? 'text-gray-400 font-medium hover:text-gray-300' : 'text-[#475569] font-medium hover:text-[#0a1e36]'
                }`
              }
              style={{ letterSpacing: '0.025em' }}
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors duration-300 ${isActive ? 'text-[#0a1e36]' : 'text-current'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {/* Gold dot indicator */}
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37] transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
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
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 py-4 text-sm no-underline border-b transition-all duration-300 ease-in-out ${
                        isActive
                          ? 'text-[#0a1e36] font-bold'
                          : isDark ? 'text-gray-400 font-medium' : 'text-[#475569] font-medium'
                      }`
                    }
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,169,154,0.12)',
                      letterSpacing: '0.02em',
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-current'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}

              {/* Theme & Language Toggles for Mobile Menu */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 py-5"
              >
                <button
                  onClick={toggleLang}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border-none cursor-pointer"
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,169,154,0.1)', color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}
                >
                  <Globe size={16} style={{ color: 'var(--color-rose-gold)' }} />
                  {isRTL ? 'English' : 'العربية'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border-none cursor-pointer"
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,169,154,0.1)', color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}
                >
                  {isDark ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-slate-600" />}
                  {isDark ? (isRTL ? 'وضع النهار' : 'Light Mode') : (isRTL ? 'الوضع الليلي' : 'Dark Mode')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
