import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { createOrder } from '../services/api'
import { X, CheckCircle2, Loader2, ShoppingBag, Plus, Minus, Sparkles } from 'lucide-react'

interface LeadFormModalProps {
  isOpen:           boolean
  onClose:          () => void
  product:          { id: number; name: string; price: number; stock: number }
  initialQuantity?: number
}

type FormState = 'form' | 'loading' | 'success'

export default function LeadFormModal({ isOpen, onClose, product, initialQuantity = 1 }: LeadFormModalProps) {
  const { t }                     = useTranslation()
  const [formState, setFormState] = useState<FormState>('form')
  const [quantity, setQuantity]   = useState(initialQuantity)
  const [form, setForm]           = useState({ customerName: '', address: '', whatsapp: '', phone: '' })
  const [errors, setErrors]       = useState<Record<string, string>>({})

  const total = product.price * quantity

  const changeQty = (delta: number) =>
    setQuantity((q) => Math.min(product.stock, Math.max(1, q + delta)))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.customerName.trim())                    e.customerName = t('lead.error_name')
    if (!form.address.trim() || form.address.length < 5) e.address  = t('lead.error_address')
    if (!form.whatsapp.trim())                        e.whatsapp     = t('lead.error_whatsapp')
    if (!form.phone.trim())                           e.phone        = t('lead.error_phone')
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setFormState('loading')
    try {
      await createOrder({ ...form, productId: product.id, quantity })
      setFormState('success')
    } catch {
      setErrors({ general: t('lead.error_general') })
      setFormState('form')
    }
  }

  const handleClose = () => {
    setFormState('form')
    setForm({ customerName: '', address: '', whatsapp: '', phone: '' })
    setErrors({})
    setQuantity(initialQuantity)
    onClose()
  }

  const inpStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '0.875rem 1.1rem',
    borderRadius: '0.875rem',
    fontSize: '0.875rem', outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
    background: errors[field] ? 'rgba(254,226,226,0.6)' : 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: errors[field]
      ? '1.5px solid rgba(239,68,68,0.4)'
      : '1.5px solid rgba(255,255,255,0.7)',
    boxShadow: '0 2px 10px rgba(44,34,34,0.04), inset 0 1px 0 rgba(255,255,255,0.72)',
    color: 'var(--color-charcoal)',
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(28,18,18,0.52)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* ── Modal — bottom-sheet on mobile, centered card on desktop ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34, mass: 0.8 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 51,
              display: 'flex',
              alignItems: 'flex-end',       /* bottom-sheet on mobile */
              justifyContent: 'center',
              padding: '0',
              pointerEvents: 'none',
            }}
          >
            {/* Sheet container */}
            <div
              className="modal-scroll"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 480,
                borderRadius: '2rem 2rem 0 0',   /* native bottom-sheet radius */
                overflow: 'hidden',
                pointerEvents: 'auto',
                maxHeight: '94vh',
                overflowY: 'auto',
                /* Glass */
                background: 'rgba(251,247,244,0.88)',
                backdropFilter: 'blur(48px) saturate(220%) brightness(1.04)',
                WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.04)',
                border: '1px solid rgba(255,255,255,0.72)',
                borderBottom: 'none',
                boxShadow: 'var(--shadow-glass-modal)',
              }}
            >
              {/* Drag handle */}
              <div className="drag-handle" />

              {/* Gold gradient accent bar */}
              <div style={{
                height: 2,
                background: 'linear-gradient(90deg, var(--color-warm-taupe), var(--color-gold), var(--color-rose-gold), var(--color-rose-sand))',
                margin: '0.5rem 1.5rem 0',
                borderRadius: 9999,
                opacity: 0.7,
              }} />

              {/* Close button */}
              <motion.button
                onClick={handleClose}
                id="modal-close-btn"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                style={{
                  position: 'absolute', top: '1rem', insetInlineEnd: '1rem',
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: 'none', zIndex: 10,
                  background: 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(12px)',
                  color: 'var(--color-mocha)',
                  boxShadow: '0 2px 8px rgba(44,34,34,0.08)',
                  transition: 'background 0.2s',
                }}
              >
                <X size={13} strokeWidth={1.5} />
              </motion.button>

              <div style={{ padding: '1.5rem 1.75rem 2rem' }}>
                <AnimatePresence mode="wait">

                  {/* ── Success ── */}
                  {formState === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                      style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 240 }}
                        style={{
                          width: 72, height: 72, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, var(--color-blush), var(--color-blush-mid))',
                          boxShadow: '0 8px 24px rgba(192,127,110,0.2)',
                        }}
                      >
                        <CheckCircle2 size={32} strokeWidth={1.5} style={{ color: 'var(--color-rose-gold)' }} />
                      </motion.div>
                      <div>
                        <h3 style={{ fontSize: '1.65rem', color: 'var(--color-charcoal)', marginBottom: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                          {t('lead.success_title')}
                        </h3>
                        <p
                          style={{ fontSize: '0.875rem', color: 'var(--color-warm-taupe)', lineHeight: 'var(--lh-relaxed)' }}
                          dangerouslySetInnerHTML={{ __html: t('lead.success_msg', { name: product.name }) }}
                        />
                      </div>
                      <button onClick={handleClose} className="btn-primary mt-2">{t('lead.continue')}</button>
                    </motion.div>

                  ) : (
                    /* ── Form ── */
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.25rem' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '0.85rem', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, var(--color-blush), var(--color-blush-mid))',
                          boxShadow: '0 4px 12px rgba(192,127,110,0.15)',
                        }}>
                          <ShoppingBag size={17} strokeWidth={1.4} style={{ color: 'var(--color-rose-gold)' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-rose-gold)', marginBottom: '0.2rem', fontFamily: 'var(--font-body)' }}>
                            {t('lead.ordering')}
                          </p>
                          <h2 style={{ fontSize: '1.1rem', color: 'var(--color-charcoal)', lineHeight: 1.3, fontWeight: 500 }}>
                            {product.name}
                          </h2>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div style={{
                        borderRadius: '1.2rem', padding: '1rem 1.15rem',
                        marginBottom: '1.2rem',
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.68)',
                        boxShadow: '0 2px 16px rgba(44,34,34,0.04), inset 0 1px 0 rgba(255,255,255,0.82)',
                      }}>
                        {/* Label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.8rem' }}>
                          <Sparkles size={11} strokeWidth={1.4} style={{ color: 'var(--color-gold)' }} />
                          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-warm-taupe)', fontFamily: 'var(--font-body)' }}>
                            {t('lead.order_summary')}
                          </span>
                        </div>

                        {/* Unit price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-mocha)' }}>{t('lead.unit_price')}</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-charcoal)', fontFamily: 'var(--font-display)' }}>
                            {product.price.toFixed(2)} <span style={{ fontSize: '0.68rem', fontWeight: 400 }}>ج.م</span>
                          </span>
                        </div>

                        {/* Qty row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-mocha)' }}>{t('lead.quantity')}</span>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center',
                            borderRadius: 9999, overflow: 'hidden',
                            border: '1.5px solid rgba(200,169,154,0.3)',
                            background: 'rgba(255,255,255,0.65)',
                            boxShadow: '0 1px 6px rgba(44,34,34,0.05)',
                          }}>
                            <button id="modal-qty-minus" onClick={() => changeQty(-1)} disabled={quantity <= 1} style={{
                              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: 'none', background: 'transparent', cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                              color: 'var(--color-charcoal)', opacity: quantity <= 1 ? 0.3 : 1, transition: 'opacity 0.2s',
                            }}>
                              <Minus size={12} strokeWidth={1.5} />
                            </button>
                            <span style={{
                              minWidth: 28, textAlign: 'center', fontFamily: 'var(--font-display)',
                              fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-charcoal)',
                              borderInline: '1px solid rgba(200,169,154,0.25)', lineHeight: '32px',
                            }}>
                              {quantity}
                            </span>
                            <button id="modal-qty-plus" onClick={() => changeQty(1)} disabled={quantity >= product.stock} style={{
                              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: 'none', background: 'transparent', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                              color: 'var(--color-charcoal)', opacity: quantity >= product.stock ? 0.3 : 1, transition: 'opacity 0.2s',
                            }}>
                              <Plus size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'rgba(200,169,154,0.2)', marginBottom: '0.8rem' }} />

                        {/* Total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>{t('lead.total_price')}</span>
                          <motion.div
                            key={total}
                            initial={{ opacity: 0, y: -6, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                            style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-warm-taupe)' }}
                          >
                            {total.toFixed(2)} <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>ج.م</span>
                          </motion.div>
                        </div>
                      </div>

                      {errors.general && (
                        <p style={{ fontSize: '0.82rem', color: '#DC2626', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(254,226,226,0.6)', borderRadius: '0.75rem', backdropFilter: 'blur(8px)' }}>
                          {errors.general}
                        </p>
                      )}

                      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

                        {/* Name */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-warm-taupe)', fontFamily: 'var(--font-body)' }}>
                            {t('lead.name_label')}
                          </label>
                          <input
                            id="lead-name" type="text" value={form.customerName}
                            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                            placeholder={t('lead.name_placeholder')}
                            style={inpStyle('customerName')}
                          />
                          {errors.customerName && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '0.28rem' }}>{errors.customerName}</p>}
                        </div>

                        {/* Address */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-warm-taupe)', fontFamily: 'var(--font-body)' }}>
                            {t('lead.address_label')}
                          </label>
                          <textarea
                            id="lead-address" value={form.address} rows={2}
                            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                            placeholder={t('lead.address_placeholder')}
                            style={{ ...inpStyle('address'), resize: 'none' }}
                          />
                          {errors.address && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '0.28rem' }}>{errors.address}</p>}
                        </div>

                        {/* WhatsApp + Phone */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-warm-taupe)', fontFamily: 'var(--font-body)' }}>
                              {t('lead.whatsapp_label')}
                            </label>
                            <input
                              id="lead-whatsapp" type="tel" value={form.whatsapp}
                              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                              placeholder={t('lead.whatsapp_placeholder')}
                              style={inpStyle('whatsapp')}
                            />
                            {errors.whatsapp && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '0.28rem' }}>{errors.whatsapp}</p>}
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-warm-taupe)', fontFamily: 'var(--font-body)' }}>
                              {t('lead.phone_label')}
                            </label>
                            <input
                              id="lead-phone" type="tel" value={form.phone}
                              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                              placeholder={t('lead.phone_placeholder')}
                              style={inpStyle('phone')}
                            />
                            {errors.phone && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '0.28rem' }}>{errors.phone}</p>}
                          </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                          id="lead-submit-btn"
                          type="submit"
                          className="btn-primary w-full mt-1"
                          disabled={formState === 'loading'}
                          whileTap={{ scale: formState === 'loading' ? 1 : 0.97 }}
                          style={{ marginTop: '0.5rem', padding: '1rem 2rem' }}
                        >
                          {formState === 'loading' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                              <Loader2 size={14} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                              {t('lead.submitting')}
                            </span>
                          ) : t('lead.submit')}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
