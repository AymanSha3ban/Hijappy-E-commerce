import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

// ── Inline brand SVGs (lucide-react has no brand icons) ───────────────────────
type IconProps = { size?: number; strokeWidth?: number }

function IgIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
function FbIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function YtIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

const socialLinks = [
  { icon: IgIcon, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FbIcon,  href: 'https://facebook.com',  label: 'Facebook'  },
  { icon: YtIcon,   href: 'https://youtube.com',   label: 'YouTube'  },
]

const quickLinks = [
  { label: { ar: 'المجموعة',   en: 'Collection'  }, to: '/'        },
  { label: { ar: 'منتجاتنا',  en: 'Products'    }, to: '/shop'    },
  { label: { ar: 'عن العلامة', en: 'About Brand' }, to: '#about'  },
  { label: { ar: 'لوحة التحكم', en: 'Admin'      }, to: '/admin'   },
]

// ── Newsletter sub-component ──────────────────────────────────────────────────
function NewsletterForm({ isRTL }: { isRTL: boolean }) {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) { setSubmitted(true); setEmail('') }
  }

  if (submitted) {
    return (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm"
        style={{ color: 'var(--color-pastel-rose)' }}
      >
        {isRTL ? '✓ شكراً! ستصلك أحدث أخبارنا.' : '✓ Thank you! Updates coming your way.'}
      </motion.p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={isRTL ? 'بريدك الإلكتروني' : 'your@email.com'}
        className="footer-input"
        required
      />
      <button type="submit" className="footer-input-btn">
        {isRTL ? 'اشتركي' : 'Join'}
      </button>
    </form>
  )
}

// ── Main Footer ───────────────────────────────────────────────────────────────
export default function Footer() {
  const { t, i18n } = useTranslation()
  const { isDark } = useTheme()
  const isRTL        = i18n.language === 'ar'
  const ArrowIcon    = isRTL ? ArrowLeft : ArrowRight

  return (
    <footer
      style={{
        background: isDark ? 'var(--color-dark-bg)' : 'var(--color-nude-pink)',
        color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)',
        transition: 'background 0.45s ease, color 0.45s ease',
      }}
    >
      {/* Pink accent border */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--color-nude-pink), var(--color-pastel-rose), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 pt-16 pb-10">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Col 1 — Brand */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-12 h-12">
                <div 
                  className="absolute inset-0 rounded-full blur-md opacity-30"
                  style={{ background: 'var(--color-pastel-rose)' }}
                />
                <img 
                  src="/hijappy.png" 
                  alt="Hijappy" 
                  className="relative z-10 w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span style={{ 
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '1.65rem', 
                  color: isDark ? '#fff' : 'var(--color-charcoal)',
                  lineHeight: 1
                }}>
                  Hijappy
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.25em] opacity-50 mt-1">Luxury Collection</span>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{
                lineHeight: 1.9,
                color: isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-body)',
              }}
            >
              {isRTL
                ? 'مجموعة مختارة من الحجابات والأوشحة الفاخرة — صُممت للمرأة العصرية التي تُقدّر الأناقة والراحة.'
                : 'A curated collection of premium hijabs and scarves — crafted for the modern woman who values elegance and comfort.'}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center no-underline"
                  style={{
                    background:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.5)',
                    color:        isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)',
                    border:       isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(244, 224, 225, 0.6)',
                    transition:   'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background   = 'rgba(244,224,225,0.15)'
                    e.currentTarget.style.borderColor  = 'rgba(244,224,225,0.4)'
                    e.currentTarget.style.color        = 'var(--color-pastel-rose)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background   = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color        = 'rgba(255,255,255,0.62)'
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Col 2 — Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <h3
              className="text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: isDark ? 'var(--color-dark-muted)' : 'var(--color-rose-sand)', letterSpacing: '0.18em' }}
            >
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
              {quickLinks.map((link) => (
                <li key={link.to + link.label.en}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-sm no-underline"
                    style={{ color: isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-rose-gold)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)'
                    }}
                  >
                    <ArrowIcon size={12} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    {isRTL ? link.label.ar : link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3 — Contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            <h3
              className="text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: isDark ? 'var(--color-dark-muted)' : 'var(--color-rose-sand)', letterSpacing: '0.18em' }}
            >
              {isRTL ? 'تواصل معنا' : 'Contact'}
            </h3>
            <a
              href="mailto:hello@hijappy.com"
              className="flex items-center gap-2.5 text-sm no-underline mb-4"
              style={{ color: isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-rose-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? 'var(--color-dark-muted)' : 'var(--color-mocha)')}
            >
              <Mail size={14} strokeWidth={1.5} />
              hello@hijappy.com
            </a>
            <p
              className="text-xs leading-relaxed"
              style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--color-rose-sand)', lineHeight: 1.85 }}
            >
              {isRTL
                ? 'نرد على جميع الرسائل خلال 24 ساعة. يمكنك أيضاً التواصل عبر واتساب.'
                : 'We reply within 24 hours. You can also reach us via WhatsApp.'}
            </p>
          </motion.div>

          {/* Col 4 — Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.3 }}
          >
            <h3
              className="text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: isDark ? 'var(--color-dark-muted)' : 'var(--color-rose-sand)', letterSpacing: '0.18em' }}
            >
              {isRTL ? 'النشرة الإخبارية' : 'Newsletter'}
            </h3>
            <p
              className="text-xs mb-5"
              style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'var(--color-mocha)', lineHeight: 1.85 }}
            >
              {isRTL
                ? 'اشتركي للحصول على أحدث العروض والمجموعات.'
                : 'Subscribe for exclusive offers and new collections.'}
            </p>
            <NewsletterForm isRTL={isRTL} />
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.5rem' }} />

        {/* ── Bottom bar ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: isDark ? 'rgba(255,255,255,0.32)' : 'var(--color-mocha)' }}
        >
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <motion.p
            className="flex items-center gap-1.5"
            whileHover={{ color: 'var(--color-gold-light)' }}
            style={{ transition: 'color 0.25s ease', cursor: 'default' }}
          >
            {isRTL ? 'صُنع بـ' : 'Made with'}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', color: 'var(--color-rose-sand)' }}
            >
              <Heart size={11} strokeWidth={1.5} fill="currentColor" />
            </motion.span>
            {isRTL ? 'بواسطة أيمن' : 'by Ayman'}
          </motion.p>
        </div>
      </div>
    </footer>
  )
}
