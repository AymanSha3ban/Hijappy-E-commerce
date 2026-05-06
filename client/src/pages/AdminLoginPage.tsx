import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const { t }       = useTranslation()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/admin') }
    catch { setError(t('admin.login.error')) }
    finally { setLoading(false) }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{ background: 'linear-gradient(135deg, var(--color-parchment) 0%, var(--color-blush) 100%)' }}
    >
      {/* Decorative blobs — clipped by overflow-hidden on parent */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, top: -100, right: -100, opacity: 0.28,
          background: 'radial-gradient(circle, var(--color-rose-sand), transparent 70%)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, bottom: -60, left: -60, opacity: 0.15,
          background: 'radial-gradient(circle, var(--color-gold), transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md mx-auto"
      >
        <div
          className="rounded-3xl p-6 sm:p-10"
          style={{
            background:    'rgba(250,246,242,0.95)',
            backdropFilter:'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow:     'var(--shadow-modal)',
            border:        '1px solid rgba(200,169,154,0.18)',
          }}
        >
          {/* Gold top stripe — flush with card edges */}
          <div
            className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, var(--color-warm-taupe), var(--color-gold), var(--color-rose-sand))' }}
          />

          {/* Logo */}
          <div className="text-center mb-8 sm:mb-10">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4 sm:mb-5 shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--color-warm-taupe), var(--color-mocha))' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>H</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl mb-1"
              style={{ color: 'var(--color-charcoal)', fontFamily: 'var(--font-display)' }}
            >
              {t('admin.login.title')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>
              {t('admin.login.subtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-sm text-center"
              style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid rgba(153,27,27,0.15)' }}
            >
              {error}
            </motion.div>
          )}

          <form id="admin-login-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>
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
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border"
                style={{
                  background:   'var(--color-parchment)',
                  borderColor:  'var(--color-blush)',
                  color:        'var(--color-charcoal)',
                  fontFamily:   'inherit',
                }}
                onFocus={(e)  => (e.target.style.borderColor = 'var(--color-warm-taupe)')}
                onBlur={(e)   => (e.target.style.borderColor = 'var(--color-blush)')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>
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
                  className="w-full px-4 py-3.5 pe-12 rounded-xl text-sm outline-none transition-all border"
                  style={{
                    background:  'var(--color-parchment)',
                    borderColor: 'var(--color-blush)',
                    color:       'var(--color-charcoal)',
                    fontFamily:  'inherit',
                  }}
                  onFocus={(e)  => (e.target.style.borderColor = 'var(--color-warm-taupe)')}
                  onBlur={(e)   => (e.target.style.borderColor = 'var(--color-blush)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none"
                  style={{ color: 'var(--color-rose-sand)' }}
                >
                  {showPwd
                    ? <EyeOff size={16} strokeWidth={1.5} />
                    : <Eye    size={16} strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              id="admin-login-btn"
              type="submit"
              className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
                  {t('admin.login.submitting')}
                </>
              ) : (
                <>
                  {t('admin.login.submit')}
                  <ArrowRight size={15} strokeWidth={1.5} />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
