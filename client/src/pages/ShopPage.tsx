import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProducts, getCategories } from '../services/api'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Search, SlidersHorizontal, Package, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface Product  { id: number; name: string; price: number; images: string[]; colors: string[]; category?: { id: number; name: string } }
interface Category { id: number; name: string; slug: string }

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const PLACEHOLDERS: Product[] = [
  { id: -1, name: 'Premium Silk Hijab',   price: 299, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'], colors: ['#C4A882','#8B7355','#F5E6D3'], category: { id: 1, name: 'Silk' } },
  { id: -2, name: 'Cotton Cloud Scarf',   price: 189, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'], colors: ['#F0E6DA','#C8A99A','#DBBFAA'], category: { id: 2, name: 'Cotton' } },
  { id: -3, name: 'Luxury Chiffon Wrap',  price: 349, images: ['https://images.unsplash.com/photo-1617332628604-80a97c85d42c?w=600&q=80'], colors: ['#B08880','#6B4F3A','#E8D5C4'], category: { id: 3, name: 'Chiffon' } },
  { id: -4, name: 'Velvet Evening Hijab', price: 420, images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80'], colors: ['#2C2424','#8B7355','#C9A84C'], category: { id: 4, name: 'Velvet' } },
  { id: -5, name: 'Pashmina Dream Wrap',  price: 259, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'], colors: ['#E8D5C4','#C8A99A','#B08880'], category: { id: 1, name: 'Silk' } },
  { id: -6, name: 'Organza Sheer Scarf',  price: 229, images: ['https://images.unsplash.com/photo-1483985988338-f6b04f3f5f1b?w=600&q=80'], colors: ['#F5E6D3','#DBBFAA','#C4A882'], category: { id: 3, name: 'Chiffon' } },
  { id: -7, name: 'Linen Casual Wrap',    price: 159, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'], colors: ['#A8B5A0','#7A9470','#C8A99A'], category: { id: 2, name: 'Cotton' } },
  { id: -8, name: 'Embroidered Hijab',    price: 389, images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80'], colors: ['#C9A84C','#8B7355','#2C2424'], category: { id: 4, name: 'Velvet' } },
]

type SortKey = 'newest' | 'price_asc' | 'price_desc'

function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
}

export default function ShopPage() {
  const { t, i18n }                         = useTranslation()
  const { isDark }                          = useTheme()
  const location                            = useLocation()
  const navigate                            = useNavigate()
  const searchInputRef                      = useRef<HTMLInputElement>(null)
  const isAr                                = i18n.language === 'ar'
  const [products,   setProducts]           = useState<Product[]>([])
  const [categories, setCategories]         = useState<Category[]>([])
  const [loading,    setLoading]            = useState(true)
  const [activeCategory, setActiveCategory] = useState<number | null>(null) // null = All
  const [search,     setSearch]             = useState('')
  const [sort,       setSort]               = useState<SortKey>('newest')
  const [searchExpanded, setSearchExpanded] = useState(false)

  useEffect(() => {
    document.title = isAr ? 'حجابي | المتجر' : 'Hijappy | Shop'
    Promise.all([getProducts(), getCategories()])
      .then(([pr, cr]) => { setProducts(pr.data); setCategories(cr.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAr])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('searchFocus') === 'true') {
      setSearchExpanded(true)
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 150)
      
      params.delete('searchFocus')
      const newSearch = params.toString()
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true })
    }
  }, [location.search, navigate, location.pathname])

  const displayProducts = products.length > 0 ? products : PLACEHOLDERS
  const displayCategories: Category[] = categories.length > 0
    ? categories
    : [{ id: 1, name: 'Silk', slug: 'silk' }, { id: 2, name: 'Cotton', slug: 'cotton' }, { id: 3, name: 'Chiffon', slug: 'chiffon' }, { id: 4, name: 'Velvet', slug: 'velvet' }]

  const filtered = useMemo(() => {
    let list = [...displayProducts]
    if (activeCategory !== null) list = list.filter(p => p.category?.id === activeCategory)
    if (search.trim()) {
      const q = normalizeText(search)
      list = list.filter(p => normalizeText(p.name).includes(q))
    }
    if (sort === 'price_asc')  list.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    return list
  }, [displayProducts, activeCategory, search, sort])

  const clearFilters = () => { setActiveCategory(null); setSearch(''); setSort('newest') }
  const hasFilters   = activeCategory !== null || search.trim() || sort !== 'newest'

  return (
    <div className="page-wrapper" style={{ background: isDark ? 'var(--color-dark-bg)' : 'var(--color-cream)' }}>
      <Navbar />

      {/* ── Page Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: '25vh', paddingTop: '80px', paddingBottom: '2rem',
          background: 'linear-gradient(160deg, var(--color-nude-pink) 0%, var(--color-pastel-rose) 60%, var(--color-cream) 100%)' }}
      >
        {/* bg blobs */}
        <div className="absolute rounded-full pointer-events-none float-blob"
          style={{ width: 500, height: 500, top: -120, right: -80, opacity: 0.2,
            background: 'radial-gradient(circle, var(--color-rose-sand), transparent 70%)' }} />
        <div className="absolute rounded-full pointer-events-none float-blob-slow"
          style={{ width: 300, height: 300, bottom: -60, left: -60, opacity: 0.12,
            background: 'radial-gradient(circle, var(--color-pastel-rose), transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="relative z-10">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-rose-sand)', letterSpacing: '0.22em' }}>
            {isAr ? 'مجموعتنا الكاملة' : 'Our Full Collection'}
          </p>
          <h1 className="text-4xl md:text-5xl mb-4" style={{ color: 'var(--color-charcoal)' }}>{t('shop.page_title')}</h1>
          <p className="text-sm max-w-md mx-auto px-4" style={{ color: 'var(--color-mocha)', lineHeight: 1.9 }}>{t('shop.subtitle')}</p>
          <div className="divider-gold" />
        </motion.div>
      </section>

      {/* ── Filters & Search bar ── */}
      <div className="sticky top-[60px] md:top-16 z-30" style={{
        background: isDark ? 'rgba(26,15,16,0.92)' : 'rgba(244,224,225,0.92)',
        backdropFilter: 'blur(64px) saturate(200%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(64px) saturate(200%) brightness(1.04)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,169,154,0.18)',
        boxShadow: '0 4px 24px rgba(44,34,34,0.06)',
      }}>
        <div className="max-w-7xl mx-auto px-5 py-2.5 md:py-3 flex flex-col gap-2.5">
          {/* Top Row: Categories + Mobile Search Icon */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Category pills — horizontally scrollable */}
            <div className="flex flex-nowrap gap-2 flex-1 overflow-x-auto scrollbar-hide py-1 items-center" style={{ WebkitOverflowScrolling: 'touch' }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`filter-pill touch-target whitespace-nowrap flex-shrink-0${activeCategory === null ? ' active' : ''}`}
                style={activeCategory === null ? { background: 'var(--color-charcoal)', color: 'var(--color-pastel-rose)', borderColor: 'var(--color-charcoal)' } : {}}
                onClick={() => setActiveCategory(null)}
              >
                {t('shop.filter_all')}
              </motion.button>
              {displayCategories.map(cat => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  className={`filter-pill touch-target whitespace-nowrap flex-shrink-0${activeCategory === cat.id ? ' active' : ''}`}
                  style={activeCategory === cat.id ? { background: 'var(--color-charcoal)', color: 'var(--color-pastel-rose)', borderColor: 'var(--color-charcoal)' } : {}}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                >
                  {cat.name}
                </motion.button>
              ))}
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearFilters}
                  className="filter-pill touch-target whitespace-nowrap flex-shrink-0"
                  style={{ borderColor: 'var(--color-rose-sand)', color: 'var(--color-dusty-rose)' }}
                >
                  <X size={14} strokeWidth={2} style={{ marginInlineEnd: '4px' }} />
                  {isAr ? 'مسح' : 'Clear'}
                </motion.button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <motion.button 
              className="md:hidden flex-shrink-0 touch-target rounded-full flex items-center justify-center transition-colors"
              style={{ background: searchExpanded ? 'var(--color-charcoal)' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(200,169,154,0.3)', width: 44, height: 44 }}
              onClick={() => setSearchExpanded(!searchExpanded)}
              whileTap={{ scale: 0.9 }}
            >
              {searchExpanded ? <X size={18} style={{ color: '#fff' }} /> : <Search size={18} style={{ color: 'var(--color-charcoal)' }} />}
            </motion.button>
          </div>

          {/* Search Input (Desktop or Expanded Mobile) + Sort + Count */}
          <AnimatePresence initial={false}>
            <motion.div 
              className={`flex flex-col md:flex-row gap-3 items-start md:items-center justify-between w-full overflow-hidden ${!searchExpanded ? 'hidden md:flex' : 'flex'}`}
              initial={{ height: searchExpanded ? 'auto' : 0, opacity: searchExpanded ? 1 : 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: searchExpanded ? 4 : 0 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
            >
              <div className="flex gap-2 items-center w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-52">
                  <Search size={14} strokeWidth={1.5} className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" style={{ color: 'var(--color-rose-sand)' }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('shop.search_placeholder')}
                    className="w-full ps-8 pe-3 py-2 rounded-full text-sm outline-none"
                    style={{ background: 'var(--color-parchment)', border: '1.5px solid rgba(200,169,154,0.2)', color: 'var(--color-charcoal)',
                      fontFamily: 'inherit', transition: 'border-color 0.2s ease' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--color-warm-taupe)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(200,169,154,0.2)')}
                  />
                </div>

                {/* Sort */}
                <div className="relative">
                  <SlidersHorizontal size={13} strokeWidth={1.5} className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" style={{ color: 'var(--color-rose-sand)' }} />
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortKey)}
                    className="ps-8 pe-4 py-2 rounded-full text-sm cursor-pointer appearance-none outline-none"
                    style={{ background: 'var(--color-parchment)', border: '1.5px solid rgba(200,169,154,0.2)',
                      color: 'var(--color-charcoal)', fontFamily: 'inherit', transition: 'border-color 0.2s ease' }}
                  >
                    <option value="newest">{t('shop.sort_newest')}</option>
                    <option value="price_asc">{t('shop.sort_price_asc')}</option>
                    <option value="price_desc">{t('shop.sort_price_desc')}</option>
                  </select>
                </div>
              </div>

              {/* Product Count */}
              <div className="text-xs font-medium md:px-2 pt-1 md:pt-0 pb-1 md:pb-0" style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.02em' }}>
                {isAr ? `${filtered.length} منتج` : `${filtered.length} products`}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section className="max-w-7xl mx-auto px-5 py-14">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--color-blush)' }}>
              <Package size={32} strokeWidth={1} style={{ color: 'var(--color-warm-taupe)' }} />
            </div>
            <div>
              <h3 className="text-2xl mb-2" style={{ color: 'var(--color-charcoal)' }}>{t('shop.no_results')}</h3>
              <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>{t('shop.no_results_sub')}</p>
            </div>
            <button onClick={clearFilters} className="btn-outline">{isAr ? 'مسح الفلاتر' : 'Clear Filters'}</button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: EASE }}
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>

      <Footer />
    </div>
  )
}
