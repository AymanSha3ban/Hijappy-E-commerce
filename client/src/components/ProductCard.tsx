import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'

const API_BASE = (import.meta.env.VITE_API_URL as string ?? '').replace(/\/api\/?$/, '')

function resolveImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return `${API_BASE}/uploads/${url}`
}

interface Product {
  id: number
  name: string
  price: number
  images: string[]
  colors: string[]
  category?: { name: string }
}

interface ProductCardProps {
  product: Product
  index?: number
}

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 24 }
const EASE   = [0.25, 0.46, 0.45, 0.94] as const

/* ── Shaped skeleton that mirrors the real card ────────────────────────────── */
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="skeleton-card"
    >
      <div className="skeleton-card__image" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-card__line--wide" />
        <div className="skeleton-card__line skeleton-card__line--short" />
      </div>
    </motion.div>
  )
}

/* ── Product Card ──────────────────────────────────────────────────────────── */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const [hovered, setHovered]       = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const { i18n } = useTranslation()
  const { isDark } = useTheme()
  const isAr = i18n.language === 'ar'

  // 3D Tilt — refined
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set((e.clientX - r.left) / r.width  - 0.5)
    mouseY.set((e.clientY - r.top)  / r.height - 0.5)
  }

  // Auto-gallery on hover
  const raw = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80']
  const images      = raw.map(resolveImageUrl)
  const hasMultiple = images.length > 1

  useEffect(() => {
    if (!hovered || !hasMultiple) { setGalleryIdx(0); return }
    const t = setInterval(() => setGalleryIdx((p) => (p + 1) % images.length), 2600)
    return () => clearInterval(t)
  }, [hovered, hasMultiple, images.length])

  const dest = product.id > 0 ? `/products/${product.id}` : '/shop'

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-56px' }}
      transition={{ ...SPRING, delay: index * 0.07 }}
      style={{ perspective: 1000, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => { setHovered(false); setGalleryIdx(0) }}
    >
      <Link to={dest} style={{ textDecoration: 'none', display: 'block' }}>
        <motion.article
          id={`product-card-${product.id}`}
          className="product-card-inner"
          animate={{
            boxShadow: hovered
              ? (isDark
                  ? '0 28px 56px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(244,224,225,0.35), 0 8px 24px rgba(244,224,225,0.08)'
                  : '0 28px 56px rgba(44,34,34,0.14), 0 0 0 1.5px rgba(244,224,225,0.45), 0 8px 32px rgba(244,224,225,0.12)')
              : (isDark
                  ? '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(244,224,225,0.05)'
                  : 'var(--shadow-product-rest)'),
          }}
          transition={{ duration: 0.38, ease: EASE }}
          style={{
            position: 'relative',
            borderRadius: '1.75rem',
            overflow: 'hidden',
            aspectRatio: '3/4',
            display: 'block',
            cursor: 'pointer',
            background: isDark ? 'rgba(26, 15, 16, 0.92)' : 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: isDark ? '1px solid rgba(244,224,225,0.06)' : '1px solid rgba(255,255,255,0.65)',
          }}
        >
          {/* Gallery cross-fade */}
          <AnimatePresence mode="sync">
            <motion.img
              key={galleryIdx}
              src={images[galleryIdx]}
              alt={product.name}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: hovered ? 1.15 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                filter: hovered ? 'brightness(0.9)' : 'brightness(1)',
                transition: 'filter 0.4s ease',
              }}
            />
          </AnimatePresence>



          {/* Dot indicators */}
          {hovered && hasMultiple && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute', bottom: '5rem', left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', gap: '0.25rem', zIndex: 5,
              }}
            >
              {images.map((_, i) => (
                <span key={i} style={{
                  width: i === galleryIdx ? 16 : 5, height: 5,
                  borderRadius: 9999, flexShrink: 0,
                  background: i === galleryIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </motion.div>
          )}

          {/* Gradient scrim — always present, deepens on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0.82 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(28,18,18,0.88) 0%, rgba(28,18,18,0.28) 42%, transparent 72%)',
            }}
          />

          {/* Gold ring overlay on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '1.75rem',
              boxShadow: 'inset 0 0 0 1.5px rgba(244,224,225,0.45)',
              pointerEvents: 'none', zIndex: 6,
            }}
          />

          {/* Category badge */}
          {product.category && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 + 0.18, ...SPRING }}
              style={{
                position: 'absolute', top: '0.875rem',
                ...(isAr ? { right: '0.875rem' } : { left: '0.875rem' }),
                padding: '0.22rem 0.7rem', borderRadius: 9999,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: '0.6rem', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
              }}
            >
              {product.category.name}
            </motion.div>
          )}

          {/* Bottom info panel */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1.15rem 1.15rem' }}>
            <h3 style={{
              margin: '0 0 0.45rem', color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(0.95rem, 2.2vw, 1.2rem)',
              fontWeight: isAr ? 600 : 300,
              fontStyle: isAr ? 'normal' : 'italic',
              lineHeight: 'var(--lh-snug)',
              letterSpacing: isAr ? 0 : '-0.01em',
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            }}>
              {product.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              {/* Price */}
              <p style={{
                margin: 0, fontFamily: 'var(--font-display)',
                fontWeight: 500, fontSize: '1.05rem',
                color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em',
              }}>
                {product.price.toFixed(2)}
                <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.72, marginInlineStart: '0.28rem' }}>
                  {isAr ? 'ج.م' : 'EGP'}
                </span>
              </p>

              {/* View arrow — appears on hover */}
              <motion.span
                animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
                transition={{ duration: 0.24, ease: EASE }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.35rem 0.8rem', borderRadius: 9999,
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fff', fontSize: '0.65rem', fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {isAr ? 'عرض' : 'View'}
                <ArrowUpRight size={10} strokeWidth={1.8} />
              </motion.span>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}
