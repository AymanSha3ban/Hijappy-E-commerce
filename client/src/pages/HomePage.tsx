import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/api'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Truck, RefreshCcw, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product { id: number; name: string; price: number; images: string[]; colors: string[]; category?: { name: string } }

const EASE = [0.25, 0.46, 0.45, 0.94] as const

// ── Framer Motion stagger container for product grids ─────────────────────────
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const gridItemVariants = {
  hidden:  { opacity: 0, y: 36, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

// ── Hero Slides ────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: 'https://wallpapercave.com/wp/wp4004155.jpg',
    badge:  { en: 'New Collection 2025', ar: 'مجموعة 2025' },
    title1: { en: 'Grace in Every',      ar: 'أناقة في كل' },
    title2: { en: 'Thread',              ar: 'خيط' },
    sub:    { en: 'Discover premium hijabs crafted for the modern woman who values elegance.', ar: 'اكتشفي حجابات فاخرة صُممت للمرأة العصرية التي تُقدّر الأناقة.' },
    cta:    { en: 'Shop Now',            ar: 'تسوقي الآن' },
    accent: 'var(--color-pastel-rose)',
  },
  {
    image: 'https://modestpath.com/cdn/shop/products/cotton-voile-hijab-in-cinnamon-stick-brown-color-3_800x.jpg',
    badge:  { en: 'Premium Fabrics',     ar: 'أقمشة فاخرة' },
    title1: { en: 'Crafted with',        ar: 'صُنع بـ' },
    title2: { en: 'Elegance',            ar: 'أناقة' },
    sub:    { en: 'From pure silk to breathable cotton — each piece tells a story of luxury.', ar: 'من الحرير إلى القطن — كل قطعة تحكي قصة من الفخامة.' },
    cta:    { en: 'Explore',             ar: 'استكشفي' },
    accent: 'var(--color-nude-pink)',
  },
  {
    image: 'https://cdn.shopify.com/s/files/1/2786/4100/products/glazed-ginger-brown-poly-georgette-hijab-regular-glazed-ginger-brown_2000x.jpg',
    badge:  { en: 'Limited Edition',     ar: 'إصدار محدود' },
    title1: { en: 'Timeless',            ar: 'جمال' },
    title2: { en: 'Beauty',              ar: 'خالد' },
    sub:    { en: 'A curated selection for the woman who wears her values with pride.', ar: 'مجموعة منتقاة للمرأة التي ترتدي قيمها بكل فخر.' },
    cta:    { en: 'View Collection',     ar: 'عرض المجموعة' },
    accent: 'var(--color-blush-mid)',
  },
]

// ── Placeholder products (when DB is empty) ────────────────────────────────────
const PLACEHOLDERS: Product[] = [
  { id: -1, name: 'Premium Silk Hijab',   price: 299, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'], colors: ['#C4A882','#8B7355','#F5E6D3'], category: { name: 'Silk' } },
  { id: -2, name: 'Cotton Cloud Scarf',   price: 189, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'], colors: ['#F0E6DA','#C8A99A','#DBBFAA'], category: { name: 'Cotton' } },
  { id: -3, name: 'Luxury Chiffon Wrap',  price: 349, images: ['https://images.unsplash.com/photo-1617332628604-80a97c85d42c?w=600&q=80'], colors: ['#B08880','#6B4F3A','#E8D5C4'], category: { name: 'Chiffon' } },
  { id: -4, name: 'Velvet Evening Hijab', price: 420, images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80'], colors: ['#2C2424','#8B7355','#C9A84C'], category: { name: 'Velvet' } },
]

const FEATURES = (t: (k: string) => string) => [
  { icon: Truck,       label: t('product.fast_delivery'),   desc: '2–5 days' },
  { icon: RefreshCcw,  label: t('product.easy_returns'),    desc: '14 days'  },
  { icon: Sparkles,    label: t('product.premium_quality'), desc: '100%'     },
  { icon: ShieldCheck, label: t('features.secure'),         desc: '256-bit'  },
]

// ── Most Wanted editorial card ─────────────────────────────────────────────────
function FeaturedCard({ product, index, isRTL }: { product: Product; index: number; isRTL: boolean }) {
  const img = product.images?.[0] ?? PLACEHOLDERS[0].images[0]
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: EASE }}
      className="relative overflow-hidden rounded-3xl group cursor-pointer"
      style={{ aspectRatio: '3/4' }}
    >
      <Link to={product.id > 0 ? `/products/${product.id}` : '/shop'} style={{ textDecoration: 'none' }}>
        <motion.img
          src={img}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        {/* dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(44,36,36,0.85) 0%, rgba(44,36,36,0.15) 55%, transparent 100%)' }} />
        {/* category badge */}
        {product.category && (
          <div className="absolute top-4 start-4 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(250,246,242,0.85)', backdropFilter: 'blur(8px)', color: 'var(--color-warm-taupe)', border: '1px solid rgba(200,169,154,0.2)' }}>
            {product.category.name}
          </div>
        )}
        {/* info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl mb-1 text-white" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold" style={{ color: 'var(--color-pastel-rose)', fontFamily: 'var(--font-display)' }}>
              {product.price.toFixed(2)} <span className="text-sm font-normal opacity-75">EGP</span>
            </span>
            <motion.span
              className="flex items-center gap-1.5 text-white text-xs uppercase tracking-widest px-4 py-2 rounded-full"
              style={{ background: 'rgba(244,224,225,0.14)', backdropFilter: 'blur(8px)', border: '1px solid rgba(244,224,225,0.3)', letterSpacing: '0.12em' }}
              whileHover={{ background: 'rgba(255,209,220,0.35)', borderColor: 'rgba(255,209,220,0.6)' }}
            >
              {isRTL ? 'اشتري' : 'Shop'}
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Section header helper ──────────────────────────────────────────────────────
function SectionHeader({ label, title }: { label: string; title: string }) {
  const { isDark } = useTheme()
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.p
        className="text-xs uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-rose-sand)', letterSpacing: '0.22em' }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        {label}
      </motion.p>
      <motion.h2
        className="text-3xl md:text-4xl"
        style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {title}
      </motion.h2>
      <div className="divider-gold" />
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, i18n }     = useTranslation()
  const { isDark }      = useTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [slide, setSlide]       = useState(0)
  const [paused, setPaused]     = useState(false)
  const isAr = i18n.language === 'ar'

  // Mouse parallax
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const smX = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const smY = useSpring(mouseY, { stiffness: 40, damping: 18 })
  const b1x = useTransform(smX, [0, 1], [-35, 35])
  const b1y = useTransform(smY, [0, 1], [-25, 25])
  const b2x = useTransform(smX, [0, 1], [28, -28])
  const b2y = useTransform(smY, [0, 1], [18, -18])

  const heroRef = useRef<HTMLElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set((e.clientX - r.left) / r.width)
    mouseY.set((e.clientY - r.top) / r.height)
  }, [mouseX, mouseY])

  // Auto-advance slides
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [paused])

  useEffect(() => {
    document.title = isAr ? 'حجابي | حجابات وأوشحة فاخرة' : 'Hijappy | Luxury Hijabs & Scarves'
    getProducts().then(r => setProducts(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [isAr])

  const displayProducts = products.length > 0 ? products : PLACEHOLDERS
  const newArrivals     = displayProducts.slice(0, 4)
  const mostWanted      = displayProducts.slice(0, 2)
  const s               = HERO_SLIDES[slide]
  const lang            = isAr ? 'ar' : 'en'

  const prevSlide = () => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  const nextSlide = () => setSlide(s => (s + 1) % HERO_SLIDES.length)

  return (
    <div className={`page-wrapper transition-colors duration-500 ${isDark ? 'dark bg-dark-bg' : 'bg-cream'}`} style={{ background: isDark ? 'var(--color-dark-bg)' : 'var(--color-cream)' }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          HERO SLIDER
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden"
        style={{ height: '100vh', minHeight: '620px' }}
      >
        {/* Slides */}
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
          >
            {/* Ken Burns image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={s.image}
                alt={s.title2[lang]}
                className="w-full h-full object-cover hero-img-kb"
              />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(105deg, rgba(44,36,36,0.72) 0%, rgba(44,36,36,0.35) 50%, rgba(44,36,36,0.1) 100%)',
            }} />
          </motion.div>
        </AnimatePresence>

        {/* Parallax blobs */}
        <motion.div className="absolute rounded-full pointer-events-none float-blob"
          style={{ width: 600, height: 600, top: -120, right: -100, opacity: 0.12,
            background: 'radial-gradient(circle, var(--color-rose-sand), transparent 70%)', x: b2x, y: b2y }} />
        <motion.div className="absolute rounded-full pointer-events-none float-blob-slow"
          style={{ width: 400, height: 400, bottom: -60, left: -80, opacity: 0.1,
            background: 'radial-gradient(circle, var(--color-gold), transparent 70%)', x: b1x, y: b1y }} />

        {/* Text content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${slide}`}
            className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <div className="max-w-xl">
              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6"
                style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)',
                  color: '#fff', letterSpacing: '0.2em', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Sparkles size={11} strokeWidth={1.5} />
                {s.badge[lang]}
              </motion.span>

              {/* Title */}
              <motion.h1
                className="mb-5 leading-tight text-white"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5.2rem)', fontWeight: isAr ? 700 : 300 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              >
                {s.title1[lang]}
                <br />
                <em style={{ color: s.accent, fontStyle: isAr ? 'normal' : 'italic' }}>{s.title2[lang]}</em>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="mb-8 text-base"
                style={{ color: 'rgba(255,255,255,0.76)', fontWeight: 300, lineHeight: 'var(--lh-relaxed)', maxWidth: '34rem' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
              >
                {s.sub[lang]}
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
              >
                <Link to="/shop" className="btn-primary btn-liquid">{s.cta[lang]}</Link>
                <Link to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium"
                  style={{ background: 'rgba(244,224,225,0.12)', backdropFilter: 'blur(8px)',
                    color: '#fff', border: '1.5px solid rgba(244,224,225,0.3)', textDecoration: 'none',
                    letterSpacing: '0.05em', transition: 'all 0.25s ease' }}>
                  {isAr ? 'عرض الكل' : 'View All →'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-5">
          {/* Progress dots */}
          <div className="flex gap-2.5">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className="relative overflow-hidden rounded-full border-none cursor-pointer p-0"
                style={{ width: i === slide ? 28 : 8, height: 8, background: 'rgba(255,255,255,0.3)', transition: 'width 0.35s ease' }}
                onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
              >
                {i === slide && <span className="absolute inset-0 rounded-full slide-progress" style={{ background: '#fff' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button onClick={prevSlide}
          className="absolute top-1/2 -translate-y-1/2 start-5 z-20 w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button onClick={nextSlide}
          className="absolute top-1/2 -translate-y-1/2 end-5 z-20 w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 end-8 flex flex-col items-center gap-2 z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          <motion.div className="w-px h-10 rounded-full"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)' }}
            animate={{ scaleY: [0, 1, 0], originY: 'top' }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES RIBBON
      ══════════════════════════════════════════════════════════ */}
      <section style={{ 
        background: isDark ? 'var(--color-dark-surface)' : 'var(--color-nude-pink)', 
        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(244,224,225,0.3)', 
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(244,224,225,0.3)' 
      }}>
        <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {FEATURES(t).map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(200,169,154,0.18)', boxShadow: '0 2px 12px rgba(44,34,34,0.05)' }}
                whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(201,168,76,0.18)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <Icon size={24} strokeWidth={1.4} style={{ color: 'var(--color-warm-taupe)' }} />
              </motion.div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--color-charcoal)', letterSpacing: '0.01em' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--color-rose-sand)', letterSpacing: '0.03em' }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 py-24 md:py-32">
        <SectionHeader label={t('home.new_arrivals_label')} title={t('home.new_arrivals_title')} />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {newArrivals.map((p, i) => (
              <motion.div key={p.id} variants={gridItemVariants}>
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          MOST WANTED — dark editorial section
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: isDark ? 'var(--color-midnight-plum)' : 'var(--color-charcoal)' }}>
        <div className="max-w-7xl mx-auto px-5">
          {/* Header */}
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold)', letterSpacing: '0.22em' }}>{t('home.most_wanted_label')}</p>
            <h2 className="text-3xl md:text-4xl text-white">{t('home.most_wanted_title')}</h2>
            <div className="divider-gold" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 mb-10 ">
            {mostWanted.map((p, i) => <FeaturedCard key={p.id} product={p} index={i} isRTL={isAr} />)}
          </div>

          <div className="text-center">
            <Link to="/shop" className="btn-primary btn-liquid" style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-warm-taupe))' }}>
              {t('home.view_shop')}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SHOP ALL CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden" style={{ background: isDark ? 'var(--color-dark-bg)' : 'var(--color-cream)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(200,169,154,0.18) 0%, transparent 70%)' }} />
        <motion.div className="text-center relative z-10 max-w-2xl mx-auto px-6"
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: '-100px' }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--color-rose-sand)', letterSpacing: '0.2em' }}>
            {isAr ? 'مجموعتنا الكاملة' : 'Full Collection'}
          </p>
          <h2 className="text-3xl md:text-5xl mb-5" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>
            {isAr ? 'اكتشفي كل ما لدينا' : 'Explore Everything'}
          </h2>
          <p className="mb-8 text-base" style={{ color: isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)', lineHeight: 1.9 }}>
            {isAr ? 'تصفّحي مجموعتنا الكاملة بفلاتر ذكية للعثور على قطعتك المثالية.' : 'Browse our complete collection with smart filters to find your perfect piece.'}
          </p>

          {/* ── Category Pills ── */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}
          >
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.18em' }}>
              {t('home.category_pill_label')}
            </span>
            {[
              { en: t('home.category_silk'),    ar: t('home.category_silk'),    slug: 'silk'    },
              { en: t('home.category_cotton'),  ar: t('home.category_cotton'),  slug: 'cotton'  },
              { en: t('home.category_chiffon'), ar: t('home.category_chiffon'), slug: 'chiffon' },
            ].map((cat) => (
              <motion.div key={cat.slug} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 340, damping: 22 }}>
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium no-underline"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(12px)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(244,224,225,0.4)',
                    color: isDark ? 'var(--color-dark-text)' : 'var(--color-mocha)',
                    boxShadow: '0 2px 12px rgba(44,34,34,0.06)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-charcoal)'
                    e.currentTarget.style.color = 'var(--color-gold-light)'
                    e.currentTarget.style.borderColor = 'var(--color-charcoal)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.72)'
                    e.currentTarget.style.color = 'var(--color-mocha)'
                    e.currentTarget.style.borderColor = 'rgba(200,169,154,0.35)'
                  }}
                >
                  {isAr ? cat.ar : cat.en}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="divider-gold" />
          <motion.div className="mt-8" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Link to="/shop" className="btn-primary btn-liquid">{isAr ? 'المتجر الكامل' : 'Visit the Shop'}</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ABOUT US — Split-screen storytelling
      ══════════════════════════════════════════════════════════ */}
      <section id="about" className="relative overflow-hidden" style={{ background: isDark ? 'var(--color-dark-bg)' : 'var(--color-cream)' }}>
        {/* ambient orb */}
        <div className="ambient-orb" style={{ width: 480, height: 480, top: '10%', right: '-10%', opacity: 0.08,
          background: 'radial-gradient(circle, var(--color-gold), transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-5 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Image side ── */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 48 : -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className={isAr ? 'md:order-2' : ''}
            style={{ position: 'relative' }}
          >
            <div style={{
              borderRadius: '2rem', overflow: 'hidden', aspectRatio: '4/5',
              boxShadow: '0 32px 80px -12px rgba(44,34,34,0.22)',
            }}>
              <img
                src="https://images.unsplash.com/photo-1614786269829-d24616faf56d?w=800&q=80"
                alt="Hijappy Brand Story"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* floating gold badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                position: 'absolute',
                bottom: '-1.5rem',
                [isAr ? 'left' : 'right']: '-1.5rem',
                background: 'linear-gradient(135deg, var(--color-warm-taupe), var(--color-mocha))',
                borderRadius: '1.5rem',
                padding: '1.25rem 1.75rem',
                boxShadow: '0 12px 40px rgba(107,79,58,0.35)',
                color: '#fff',
                minWidth: 130,
              }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, lineHeight: 1, margin: 0 }}>
                {t('home.about_stat1_num')}
              </p>
              <p style={{ fontSize: '0.72rem', opacity: 0.82, marginTop: '0.3rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {t('home.about_stat1_label')}
              </p>
            </motion.div>
          </motion.div>

          {/* ── Text side ── */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -48 : 48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-rose-gold)', letterSpacing: '0.22em' }}>
                {t('home.about_label')}
              </p>
              <h2 className="text-3xl md:text-4xl mb-4" style={{ color: 'var(--color-charcoal)' }}>
                {t('home.about_title')}
              </h2>
              <div className="divider-gold" style={{ margin: '0 0 1.5rem' }} />
            </div>

            <p className="text-base leading-relaxed" style={{ color: 'var(--color-mocha)', lineHeight: 2, maxWidth: '34rem' }}>
              {t('home.about_body')}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y" style={{ borderColor: 'var(--color-blush)' }}>
              {[
                { num: t('home.about_stat1_num'), label: t('home.about_stat1_label') },
                { num: t('home.about_stat2_num'), label: t('home.about_stat2_label') },
                { num: t('home.about_stat3_num'), label: t('home.about_stat3_label') },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-warm-taupe)', lineHeight: 1, marginBottom: '0.35rem' }}>
                    {stat.num}
                  </p>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-rose-sand)', letterSpacing: '0.12em' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Link to="/shop" className="btn-primary">{t('home.about_cta')}</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
