import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

/* ── Animated floating particle ─────────────────────────────────────────────── */
function Particle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size,
        background: 'rgba(201,168,76,0.18)', backdropFilter: 'blur(2px)' }}
      animate={{ y: [0, -24, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.18, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export default function AdminLoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const { t, i18n } = useTranslation()
  const isAr        = i18n.language === 'ar'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/admin') }
    catch { setError(t('admin.login.error')) }
    finally { setLoading(false) }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '1rem 1.25rem',
    paddingInlineEnd: field === 'password' ? '3.5rem' : '1.25rem',
    borderRadius: '0.875rem',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.28s ease',
    background: focusedField === field ? 'rgba(255,255,255,0.9)' : 'rgba(250,246,242,0.7)',
    border: focusedField === field
      ? '1.5px solid var(--color-warm-taupe)'
      : '1.5px solid rgba(200,169,154,0.3)',
    color: 'var(--color-charcoal)',
    boxShadow: focusedField === field
      ? '0 0 0 4px rgba(139,112,85,0.1), 0 2px 12px rgba(44,34,34,0.06)'
      : '0 2px 8px rgba(44,34,34,0.04)',
  })

  return (
    <div className="min-h-screen flex overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ══════════════════════════════════════════
          LEFT PANEL — Brand Identity (hidden on mobile)
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: isAr ? 60 : -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1a1010 0%, var(--color-charcoal) 45%, #2a1a14 100%)' }}
      >
        {/* Animated particles */}
        <Particle x="12%" y="18%" size={8}  delay={0}   />
        <Particle x="78%" y="8%"  size={5}  delay={1.2} />
        <Particle x="35%" y="72%" size={10} delay={0.7} />
        <Particle x="65%" y="55%" size={6}  delay={2.1} />
        <Particle x="88%" y="82%" size={7}  delay={0.4} />
        <Particle x="22%" y="44%" size={4}  delay={1.8} />

        {/* Radial glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: 'absolute', width: 520, height: 520,
            top: '-15%', left: '-10%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400,
            bottom: '-10%', right: '-5%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,127,110,0.1) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 60%, rgba(201,168,76,0.06) 0%, transparent 60%)',
          }} />
        </div>

        {/* Gold border line at end */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          [isAr ? 'left' : 'right']: 0,
          width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.3) 30%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 70%, transparent)',
        }} />

        {/* Top — Logo */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3 no-underline group">
            <div style={{
              width: 48, height: 48, borderRadius: '0.75rem', overflow: 'hidden',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(201,168,76,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <img src="/weblogo.png" alt="Hijappy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                Hijappy
              </span>
              <span style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-gold)', marginTop: 3 }}>
                {isAr ? 'للفخامة عنوان' : 'Luxury Hijab'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center — Hero text */}
        <div className="relative z-10 px-10 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
          >
            {/* Decorative line */}
            <div style={{
              width: 48, height: 2, marginBottom: '1.5rem',
              background: 'linear-gradient(90deg, var(--color-gold), var(--color-rose-sand))',
              borderRadius: 99,
            }} />

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.2vw, 3rem)',
              fontWeight: isAr ? 700 : 300,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}>
              {isAr ? 'بوابة الإدارة' : 'Admin'}<br />
              <em style={{ color: 'var(--color-gold)', fontStyle: isAr ? 'normal' : 'italic' }}>
                {isAr ? 'الفخامة تُدار بأناقة' : 'Portal'}
              </em>
            </h1>

            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, maxWidth: '26rem' }}>
              {isAr
                ? 'أدِر منتجاتك وطلباتك وفئاتك من مكان واحد بتصميم يليق بعلامتك الفاخرة.'
                : 'Manage your products, orders and categories from one elegant dashboard built for your luxury brand.'}
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2.5rem' }}>
              {[
                { icon: ShieldCheck, text: isAr ? 'دخول آمن ومشفّر' : 'Secure encrypted access' },
                { icon: Sparkles,    text: isAr ? 'لوحة تحكم ذكية وأنيقة' : 'Smart & elegant dashboard' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '0.6rem', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.2)',
                  }}>
                    <Icon size={14} strokeWidth={1.5} style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.52)' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom — storefront link */}
        <div className="relative z-10 p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 no-underline group"
            style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
          >
            <ArrowLeft size={13} strokeWidth={1.5} style={{ transform: isAr ? 'scaleX(-1)' : 'none' }} />
            {isAr ? 'العودة إلى الواجهة' : 'Back to Storefront'}
          </Link>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10 relative"
        style={{ background: 'linear-gradient(160deg, var(--color-cream) 0%, var(--color-parchment) 100%)' }}
      >
        {/* Soft background orb */}
        <div className="absolute pointer-events-none" style={{
          width: 340, height: 340, top: '5%', right: '5%', borderRadius: '50%', opacity: 0.35,
          background: 'radial-gradient(circle, var(--color-blush), transparent 70%)',
        }} />
        <div className="absolute pointer-events-none" style={{
          width: 220, height: 220, bottom: '8%', left: '8%', borderRadius: '50%', opacity: 0.22,
          background: 'radial-gradient(circle, var(--color-gold-pale), transparent 70%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Mobile logo (only shows on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div style={{
              width: 64, height: 64, borderRadius: '1rem', overflow: 'hidden', margin: '0 auto 1rem',
              background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(200,169,154,0.3)',
              boxShadow: '0 8px 32px rgba(107,79,58,0.14)',
            }}>
              <img src="/weblogo.png" alt="Hijappy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-rose-gold)' }}>
              {isAr ? 'للفخامة عنوان' : 'Luxury Admin Portal'}
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <motion.p
              initial={{ opacity: 0, x: isAr ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{ fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-rose-gold)', marginBottom: '0.6rem' }}
            >
              {isAr ? 'دخول المشرف' : 'Secure Login'}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5, ease: EASE }}
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: 'var(--color-charcoal)', fontFamily: 'var(--font-display)', fontWeight: isAr ? 700 : 300, lineHeight: 1.2, marginBottom: '0.5rem' }}
            >
              {t('admin.login.title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52 }}
              style={{ fontSize: '0.85rem', color: 'var(--color-warm-taupe)', lineHeight: 1.7 }}
            >
              {t('admin.login.subtitle')}
            </motion.p>
            {/* Decorative underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
              style={{
                width: 40, height: 2, marginTop: '1rem',
                background: 'linear-gradient(90deg, var(--color-gold), var(--color-rose-sand))',
                borderRadius: 99, transformOrigin: isAr ? 'right' : 'left',
              }}
            />
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-4 rounded-2xl text-sm flex items-start gap-3"
                style={{ background: 'rgba(254,226,226,0.8)', color: '#991B1B', border: '1px solid rgba(153,27,27,0.12)', backdropFilter: 'blur(8px)' }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form id="admin-login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45, ease: EASE }}
            >
              <label
                htmlFor="admin-email"
                style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.55rem',
                  textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-warm-taupe)' }}
              >
                {t('admin.login.email')}
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hijappy.com"
                required
                autoComplete="email"
                style={inputStyle('email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.45, ease: EASE }}
            >
              <label
                htmlFor="admin-password"
                style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.55rem',
                  textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-warm-taupe)' }}
              >
                {t('admin.login.password')}
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={inputStyle('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  whileTap={{ scale: 0.88 }}
                  className="absolute top-1/2 -translate-y-1/2 end-4 flex items-center justify-center p-1 bg-transparent border-none cursor-pointer"
                  style={{ color: 'var(--color-rose-sand)' }}
                  aria-label="Toggle password"
                >
                  <AnimatePresence mode="wait">
                    <motion.span key={showPwd ? 'off' : 'on'} initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      {showPwd ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.66, duration: 0.45, ease: EASE }}
              style={{ marginTop: '0.5rem' }}
            >
              <motion.button
                id="admin-login-btn"
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                style={{
                  width: '100%', padding: '1.05rem 2rem',
                  borderRadius: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  background: loading ? 'rgba(139,112,85,0.55)' : 'linear-gradient(135deg, var(--color-warm-taupe) 0%, var(--color-mocha) 55%, #3a1f14 100%)',
                  color: '#fff',
                  boxShadow: loading ? 'none' : '0 8px 28px rgba(107,79,58,0.38), 0 2px 8px rgba(107,79,58,0.22)',
                  transition: 'box-shadow 0.3s ease, background 0.3s ease',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Shimmer sweep */}
                {!loading && (
                  <motion.div
                    style={{
                      position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.22), transparent)',
                      transform: 'skewX(-20deg)',
                    }}
                    animate={{ left: ['−100%', '180%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                  />
                )}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Loader2 size={15} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                      {t('admin.login.submitting')}
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {t('admin.login.submit')}
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                        <ArrowRight size={15} strokeWidth={2} />
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Mobile back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="lg:hidden text-center mt-8"
          >
            <Link to="/" style={{ fontSize: '0.78rem', color: 'var(--color-warm-taupe)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              ← {isAr ? 'العودة إلى الواجهة' : 'Back to Storefront'}
            </Link>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.7rem', color: 'rgba(139,112,85,0.45)', letterSpacing: '0.05em' }}
          >
            {isAr ? '© 2025 حجابي — جميع الحقوق محفوظة' : '© 2025 Hijappy — All rights reserved'}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
