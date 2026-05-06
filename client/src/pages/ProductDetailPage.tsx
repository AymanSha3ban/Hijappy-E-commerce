import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getProduct } from '../services/api'
import LeadFormModal from '../components/LeadFormModal'
import Navbar from '../components/Navbar'
import {
  ArrowLeft, ArrowRight, Truck, RefreshCcw, Sparkles,
  Phone, Plus, Minus, ShieldCheck, Star,
} from 'lucide-react'

/** Resolves any image path/URL to a displayable src.
 *  - Full URLs (http/https) → used as-is (Cloudinary, external, direct server URLs)
 *  - Server-relative paths  → prepend API base origin
 *  - Plain filenames        → assumed to live at /uploads/ on the server
 */
const API_BASE = (import.meta.env.VITE_API_URL as string ?? '').replace(/\/api\/?$/, '')

function resolveImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return `${API_BASE}/uploads/${url}`
}

interface Product {
  id: number; name: string; description: string; price: number
  images: string[]; colors: string[]; stock: number; category?: { name: string }
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const
const SLIDE_INTERVAL = 3000

export default function ProductDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation()

  const [product, setProduct]       = useState<Product | null>(null)
  const [loading, setLoading]       = useState(true)
  const [activeImg, setActiveImg]   = useState(0)
  const [direction, setDirection]   = useState(1)
  const [activeColor, setActiveColor] = useState(0)
  const [quantity, setQuantity]     = useState(1)
  const [modalOpen, setModalOpen]   = useState(false)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const dragStartX = useRef(0)
  const isAr = i18n.language === 'ar'

  useEffect(() => {
    if (!id) return
    getProduct(Number(id))
      .then((r) => { setProduct(r.data); document.title = `${r.data.name} | حجابي` })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const fallback = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80'
  // Safe: returns [fallback] when product is null (during loading)
  const raw    = product?.images?.length ? product.images : [fallback]
  const images = raw.map(resolveImageUrl)
  const imagesLen = images.length

  const goTo = useCallback((idx: number, dir?: number) => {
    const next = (idx + imagesLen) % imagesLen
    setDirection(dir ?? (idx > activeImg ? 1 : -1))
    setActiveImg(next)
  }, [activeImg, imagesLen])

  /* Auto-slide every 3s — only starts once product loads */
  useEffect(() => {
    if (imagesLen < 2) return
    timerRef.current = setInterval(() => {
      setActiveImg((prev) => {
        setDirection(1)
        return (prev + 1) % imagesLen
      })
    }, SLIDE_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [imagesLen])

  const handleThumb = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    goTo(i, i > activeImg ? 1 : -1)
    timerRef.current = setInterval(() => {
      setActiveImg((prev) => { setDirection(1); return (prev + 1) % imagesLen })
    }, SLIDE_INTERVAL)
  }

  /* Swipe */
  const onPointerDown = (e: React.PointerEvent) => { dragStartX.current = e.clientX }
  const onPointerUp   = (e: React.PointerEvent) => {
    const diff = dragStartX.current - e.clientX
    if (Math.abs(diff) > 50) {
      if (timerRef.current) clearInterval(timerRef.current)
      if (diff > 0) goTo(activeImg + 1, 1); else goTo(activeImg - 1, -1)
      timerRef.current = setInterval(() => {
        setActiveImg((prev) => { setDirection(1); return (prev + 1) % imagesLen })
      }, SLIDE_INTERVAL)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream)' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2"
        style={{ borderColor: 'var(--color-rose-gold)', borderTopColor: 'transparent' }}
      />
    </div>
  )
  if (!product) return null

  const BackArrow = isAr ? ArrowRight : ArrowLeft
  const features = [
    { icon: Truck,       label: t('product.fast_delivery'),   cls: 'icon-pill-gold'  },
    { icon: RefreshCcw,  label: t('product.easy_returns'),    cls: 'icon-pill-rose'  },
    { icon: Sparkles,    label: t('product.premium_quality'), cls: 'icon-pill-sage'  },
    { icon: ShieldCheck, label: 'ضمان الجودة',               cls: 'icon-pill-taupe' },
  ]

  const changeQty = (delta: number) =>
    setQuantity((q) => Math.min(product.stock, Math.max(1, q + delta)))

  return (
    <div className="page-wrapper" style={{ background: 'var(--color-cream)', position: 'relative', overflow: 'hidden' }}>
      {/* ── Ambient parallax orbs ── */}
      <div className="ambient-orb" style={{
        width: 420, height: 420, top: '5%', left: '-8%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
      }} />
      <div className="ambient-orb ambient-orb-2" style={{
        width: 350, height: 350, top: '30%', right: '-6%',
        background: 'radial-gradient(circle, rgba(192,127,110,0.10) 0%, transparent 70%)',
      }} />

      <Navbar />

      <div className="max-w-6xl mx-auto px-5 pt-28 pb-20">

        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: isAr ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          whileHover={{ x: isAr ? 4 : -4 }}
          className="flex items-center gap-2 mb-10 text-sm cursor-pointer bg-transparent border-none"
          style={{ color: 'var(--color-warm-taupe)' }}
        >
          <BackArrow size={15} strokeWidth={1.5} />
          {t('product.back')}
        </motion.button>

        <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* ════════════════════════════════════════════
              GALLERY — Main image left, thumbs right
          ════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
          >
            {/* Main Image */}
            <div
              style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                borderRadius: '1.75rem', aspectRatio: '4/5',
                background: 'var(--color-blush)',
                userSelect: 'none', cursor: images.length > 1 ? 'grab' : 'default',
              }}
              className="product-card-glow"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={activeImg}
                  custom={direction}
                  src={images[activeImg]}
                  alt={product.name}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 30, scale: 1.03 }),
                    center: { opacity: 1, x: 0, scale: 1 },
                    exit:  (d: number) => ({ opacity: 0, x: d * -20, scale: 0.98 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: EASE }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </AnimatePresence>

              {/* Subtle gradient scrim at bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
                background: 'linear-gradient(to top, rgba(44,34,34,0.22), transparent)',
                borderRadius: '0 0 1.75rem 1.75rem', pointerEvents: 'none',
              }} />

              {/* Dot progress indicators */}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: '0.9rem', left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', gap: '0.3rem', zIndex: 4,
                }}>
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleThumb(i)}
                      style={{
                        width: i === activeImg ? 22 : 6, height: 6,
                        borderRadius: 9999, border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0,
                        background: i === activeImg ? 'var(--color-gold)' : 'rgba(255,255,255,0.55)',
                        transition: 'all 0.35s ease',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Category chip */}
              {product.category && (
                <div style={{
                  position: 'absolute', top: '1rem', left: '1rem',
                  padding: '0.25rem 0.75rem', borderRadius: 9999,
                  background: 'rgba(201,168,76,0.16)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(201,168,76,0.42)',
                  color: 'var(--color-gold-light)', fontSize: '0.62rem',
                  fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  {product.category.name}
                </div>
              )}

              {/* Auto-slide shimmer bar */}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: 'rgba(255,255,255,0.15)',
                }}>
                  <motion.div
                    key={activeImg}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
                    style={{
                      height: '100%', transformOrigin: isAr ? 'right' : 'left',
                      background: 'linear-gradient(90deg, var(--color-gold), var(--color-rose-gold))',
                    }}
                  />
                </div>
              )}
            </div>

            {/* ── Vertical Thumbnail Strip (right side of main image) ── */}
            {images.length > 1 && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '0.55rem',
                width: 72, flexShrink: 0, paddingTop: 4,
              }}>
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleThumb(i)}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: 72, height: 72, padding: 0, border: 'none', cursor: 'pointer',
                      borderRadius: '0.85rem', overflow: 'hidden', flexShrink: 0,
                      background: 'var(--color-blush)',
                    }}
                    className={activeImg === i ? 'thumb-active' : ''}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  >
                    <motion.img
                      src={img} alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      animate={{ scale: activeImg === i ? 1.08 : 1 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ════════════════════════════════════════════
              DETAILS PANEL
          ════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="flex flex-col gap-6"
          >
            {/* Category + Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {product.category && (
                <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-rose-gold)', letterSpacing: '0.18em' }}>
                  {product.category.name}
                </span>
              )}
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} strokeWidth={1.5} style={{ color: i < 4 ? 'var(--color-gold)' : 'var(--color-blush-mid)', fill: i < 4 ? 'var(--color-gold)' : 'none' }} />
                ))}
              </div>
            </div>

            {/* Name */}
            <h1 style={{
              fontSize: 'clamp(1.85rem, 4vw, 3rem)',
              fontWeight: isAr ? 700 : 300,
              color: 'var(--color-charcoal)',
              lineHeight: 1.18,
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: '2rem',
                fontWeight: 600, color: 'var(--color-warm-taupe)', margin: 0,
              }}>
                {product.price.toFixed(2)}
              </p>
              <span style={{ color: 'var(--color-rose-sand)', fontSize: '1rem' }}>ج.م</span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-mocha)', lineHeight: 1.95 }}>
              {product.description}
            </p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.18em' }}>
                  {t('product.color')} —&nbsp;
                  <span style={{ color: 'var(--color-charcoal)', textTransform: 'none', letterSpacing: 0 }}>{product.colors[activeColor]}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, i) => (
                    <motion.button
                      key={i}
                      id={`color-swatch-${i}`}
                      onClick={() => setActiveColor(i)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.92 }}
                      className="rounded-full cursor-pointer"
                      title={color}
                      style={{
                        width: 34, height: 34, background: color,
                        border: activeColor === i ? '2.5px solid var(--color-gold)' : '2px solid transparent',
                        boxShadow: activeColor === i ? '0 0 0 3px var(--color-cream), 0 0 0 5.5px var(--color-gold), 0 4px 12px rgba(201,168,76,0.3)' : '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'all 0.25s ease',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 1rem', borderRadius: '9999px',
              background: product.stock > 0 ? 'rgba(122,148,112,0.1)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${product.stock > 0 ? 'rgba(122,148,112,0.25)' : 'rgba(239,68,68,0.18)'}`,
              width: 'fit-content',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: product.stock > 0 ? 'var(--color-sage-dark)' : '#EF4444',
                boxShadow: product.stock > 0 ? '0 0 0 3px rgba(122,148,112,0.2)' : '0 0 0 3px rgba(239,68,68,0.15)',
              }} />
              <span className="text-xs font-medium" style={{ color: product.stock > 0 ? 'var(--color-sage-dark)' : '#DC2626' }}>
                {product.stock > 0 ? t('product.in_stock', { count: product.stock }) : t('product.out_of_stock')}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.18em' }}>
                  {t('product.quantity')}
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  borderRadius: '9999px', overflow: 'hidden',
                  border: '1.5px solid var(--color-blush-mid)',
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 12px rgba(44,34,34,0.06)',
                }}>
                  <button id="qty-minus" onClick={() => changeQty(-1)} disabled={quantity <= 1} style={{
                    width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', background: 'transparent',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    color: 'var(--color-charcoal)', opacity: quantity <= 1 ? 0.35 : 1, transition: 'opacity 0.2s',
                  }}>
                    <Minus size={16} strokeWidth={1.5} />
                  </button>
                  <span style={{
                    minWidth: 44, textAlign: 'center', fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-charcoal)',
                    borderInline: '1.5px solid var(--color-blush-mid)', lineHeight: '46px',
                  }}>
                    {quantity}
                  </span>
                  <button id="qty-plus" onClick={() => changeQty(1)} disabled={quantity >= product.stock} style={{
                    width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', background: 'transparent',
                    cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                    color: 'var(--color-charcoal)', opacity: quantity >= product.stock ? 0.35 : 1, transition: 'opacity 0.2s',
                  }}>
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 pt-2">
              <motion.button
                id="buy-now-btn"
                className="btn-primary w-full text-base py-4"
                onClick={() => setModalOpen(true)}
                whileTap={{ scale: 0.97 }}
                disabled={product.stock === 0}
                style={{ fontSize: '0.88rem' }}
              >
                {t('product.buy_now')}
              </motion.button>
              <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: 'var(--color-rose-gold)' }}>
                <Phone size={12} strokeWidth={1.5} />
                {t('product.contact_note')}
              </p>
            </div>

            {/* Feature icons — 4 colorful pills */}
            <div className="border-t pt-6" style={{ borderColor: 'var(--color-blush)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                {features.map(({ icon: Icon, label, cls }) => (
                  <motion.div
                    key={label}
                    className="flex flex-col items-center gap-2"
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div
                      className={`icon-pill ${cls}`}
                      style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-warm-taupe)', lineHeight: 1.3 }}>{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={{ id: product.id, name: product.name, price: product.price, stock: product.stock }}
        initialQuantity={quantity}
      />
    </div>
  )
}
