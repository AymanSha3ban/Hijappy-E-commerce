import { createContext, useContext, useState, type ReactNode, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Info, AlertCircle, X, ShoppingBag } from 'lucide-react'
import { useTheme } from './ThemeContext'

interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'error' | 'cart'
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'info' | 'error' | 'cart') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_DURATION = 4200

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    accent: 'var(--color-gold)',
    iconColor: '#C9A84C',
    glow: 'rgba(201,168,76,0.25)',
  },
  info: {
    icon: Info,
    accent: 'var(--color-rose-gold)',
    iconColor: '#C07F6E',
    glow: 'rgba(192,127,110,0.22)',
  },
  error: {
    icon: AlertCircle,
    accent: '#ef4444',
    iconColor: '#ef4444',
    glow: 'rgba(239,68,68,0.22)',
  },
  cart: {
    icon: ShoppingBag,
    accent: 'var(--color-sage-dark)',
    iconColor: '#7A9470',
    glow: 'rgba(122,148,112,0.22)',
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const { isDark } = useTheme()
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.88, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="toast"
      style={{
        minWidth: 300,
        maxWidth: 380,
        padding: '0',
        overflow: 'hidden',
        borderLeft: `3.5px solid ${config.accent}`,
        ...(isDark ? {
          background: 'rgba(18,18,18,0.97)',
          borderColor: config.accent,
          boxShadow: `0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), 0 0 24px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
          color: 'var(--color-dark-text)',
        } : {
          background: 'rgba(255,255,255,0.95)',
          borderColor: config.accent,
          boxShadow: `0 8px 40px rgba(44,34,34,0.12), 0 2px 8px rgba(44,34,34,0.06), 0 0 20px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
          color: 'var(--color-charcoal)',
        }),
      }}
    >
      {/* Content row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
        {/* Icon with soft glow background */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24, delay: 0.08 }}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? `rgba(255,255,255,0.04)` : `rgba(201,168,76,0.08)`,
            boxShadow: `0 0 12px ${config.glow}`,
          }}
        >
          <Icon size={18} strokeWidth={1.8} style={{ color: config.iconColor }} />
        </motion.div>

        <p style={{
          margin: 0, fontSize: '0.84rem', fontWeight: 500, flex: 1,
          lineHeight: 1.45, letterSpacing: '0.01em',
          color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)',
        }}>
          {toast.message}
        </p>

        <motion.button
          onClick={onRemove}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          style={{
            background: 'none', border: 'none', padding: '4px',
            cursor: 'pointer', opacity: 0.45, flexShrink: 0,
            color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={14} strokeWidth={2} />
        </motion.button>
      </div>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ scaleX: 1, transformOrigin: 'left' }}
        animate={{ scaleX: 0 }}
        transition={{ duration: TOAST_DURATION / 1000 - 0.2, ease: 'linear', delay: 0.12 }}
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${config.accent}, transparent)`,
          transformOrigin: 'left',
          marginTop: '-1px',
          opacity: isDark ? 0.7 : 0.5,
        }}
      />
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'cart' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
