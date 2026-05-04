import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 22 }
const EASE   = [0.25, 0.46, 0.45, 0.94] as const

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const [hovered, setHovered]   = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  // 3D Tilt
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 240, damping: 28 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 240, damping: 28 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set((e.clientX - r.left) / r.width  - 0.5)
    mouseY.set((e.clientY - r.top)  / r.height - 0.5)
  }

  // Images & auto-gallery
  const images = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80']
  const hasMultiple = images.length > 1

  useEffect(() => {
    if (!hovered || !hasMultiple) { setGalleryIdx(0); return }
    const t = setInterval(() => setGalleryIdx((p) => (p + 1) % images.length), 2500)
    return () => clearInterval(t)
  }, [hovered, hasMultiple, images.length])

  const dest = product.id > 0 ? `/products/${product.id}` : '/shop'

  return (
    <motion.div
      ref={cardRef}
      /* Spring scroll reveal */
      initial={{ opacity: 0, y: 48, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ ...SPRING, delay: index * 0.08 }}
      style={{ perspective: 1000, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => { setHovered(false); setGalleryIdx(0) }}
      className="product-card-glow"
    >
      <Link to={dest} style={{ textDecoration: 'none', display: 'block' }}>
        <motion.article
          id={`product-card-${product.id}`}
          animate={{
            boxShadow: hovered
              ? '0 32px 72px -8px rgba(44,34,34,0.28), 0 12px 32px rgba(192,127,110,0.16), inset 0 1px 0 rgba(255,255,255,0.5)'
              : '0 4px 24px -4px rgba(44,34,34,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
          transition={{ duration: 0.42, ease: EASE }}
          style={{
            position: 'relative', borderRadius: '1.75rem', overflow: 'hidden',
            aspectRatio: '3/4', display: 'block', cursor: 'pointer',
            /* Glassmorphism card */
            background: hovered ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.65)',
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
              animate={{ opacity: 1, scale: hovered ? 1.09 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: EASE }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
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
                display: 'flex', gap: '0.28rem', zIndex: 5,
              }}
            >
              {images.map((_, i) => (
                <span key={i} style={{
                  width: i === galleryIdx ? 18 : 5, height: 5, borderRadius: 9999, flexShrink: 0,
                  background: i === galleryIdx ? 'var(--color-gold-light)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.32s ease',
                }} />
              ))}
            </motion.div>
          )}

          {/* Gradient scrim */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0.88 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(30,20,20,0.9) 0%, rgba(30,20,20,0.36) 45%, transparent 75%)',
            }}
          />

          {/* Rose-gold glow ring on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '1.75rem',
              boxShadow: 'inset 0 0 0 1.5px rgba(201,168,76,0.45)',
              pointerEvents: 'none', zIndex: 6,
            }}
          />

          {/* Category badge */}
          {product.category && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 + 0.2, ...SPRING }}
              style={{
                position: 'absolute', top: '0.9rem',
                ...(isAr ? { right: '0.9rem' } : { left: '0.9rem' }),
                padding: '0.22rem 0.75rem', borderRadius: 9999,
                background: 'rgba(201,168,76,0.15)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(201,168,76,0.42)',
                color: 'var(--color-gold-light)',
                fontSize: '0.62rem', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              {product.category.name}
            </motion.div>
          )}

          {/* Bottom info */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.3rem 1.2rem 1.15rem' }}>
            <h3 style={{
              margin: '0 0 0.5rem', color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 2.4vw, 1.25rem)',
              fontWeight: isAr ? 600 : 300,
              fontStyle: isAr ? 'normal' : 'italic',
              lineHeight: 1.2,
              textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            }}>
              {product.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              {/* Price */}
              <p style={{
                margin: 0, fontFamily: 'var(--font-display)',
                fontWeight: 600, fontSize: '1.1rem',
                color: 'var(--color-gold-light)', letterSpacing: '-0.01em',
              }}>
                {product.price.toFixed(2)}
                <span style={{ fontSize: '0.68rem', fontWeight: 400, opacity: 0.78, marginInlineStart: '0.3rem' }}>
                  {isAr ? 'ج.م' : 'EGP'}
                </span>
              </p>

              {/* Quick buy chip — rises on hover */}
              <motion.span
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12, scale: hovered ? 1 : 0.85 }}
                transition={{ duration: 0.28, ease: EASE }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.32rem',
                  padding: '0.4rem 0.95rem', borderRadius: 9999,
                  background: 'linear-gradient(135deg, var(--color-warm-taupe), var(--color-rose-gold))',
                  color: '#fff', fontSize: '0.68rem', fontWeight: 600,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 18px rgba(192,127,110,0.5)',
                  pointerEvents: 'none',
                }}
              >
                <ShoppingBag size={11} strokeWidth={2} />
                {isAr ? 'اشتر الآن' : 'Quick Buy'}
                <ArrowUpRight size={10} strokeWidth={2} />
              </motion.span>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}
