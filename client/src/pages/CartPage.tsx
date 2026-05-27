import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { useCart } from '../contexts/CartContext'
import Navbar from '../components/Navbar'
import { Trash2, Plus, Minus, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createOrder } from '../services/api'

export default function CartPage() {
  const { t, i18n } = useTranslation()
  const { isDark } = useTheme()
  const { items, removeItem, updateQuantity, clearCart, cartTotal } = useCart()
  const isAr = i18n.language === 'ar'

  const [formState, setFormState] = useState<'form' | 'loading' | 'success'>('form')
  const [form, setForm] = useState({ customerName: '', address: '', whatsapp: '', phone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.customerName.trim()) e.customerName = t('lead.error_name', 'Name is required')
    if (!form.address.trim() || form.address.length < 5) e.address = t('lead.error_address', 'Address is too short')
    
    const phoneRegex = /^01[0125][0-9]{8}$/
    if (!form.whatsapp.trim() || !phoneRegex.test(form.whatsapp.trim())) e.whatsapp = t('lead.invalid_phone', 'Please enter a valid 11-digit Egyptian number.')
    if (!form.phone.trim() || !phoneRegex.test(form.phone.trim())) e.phone = t('lead.invalid_phone', 'Please enter a valid 11-digit Egyptian number.')
    
    return e
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    
    setFormState('loading')
    try {
      // The backend only supports 1 product per order, so we create an order for each cart item
      await Promise.all(items.map(item => 
        createOrder({ ...form, productId: item.productId, quantity: item.quantity })
      ))
      setFormState('success')
      clearCart()
    } catch {
      setErrors({ general: t('lead.error_general', 'An error occurred') })
      setFormState('form')
    }
  }

  const inpStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '0.875rem 1.1rem',
    borderRadius: '0.875rem', fontSize: '0.875rem', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
    background: errors[field] ? 'rgba(254,226,226,0.6)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)'),
    border: errors[field] ? '1.5px solid rgba(239,68,68,0.4)' : (isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(200,169,154,0.3)'),
    color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)',
  })

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-dark-bg' : 'bg-cream'}`} style={{ background: isDark ? 'var(--color-dark-bg)' : 'var(--color-cream)' }}>
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-5 pt-28 pb-36">
        <h1 className="text-3xl font-display mb-10" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>
          {isAr ? 'عربة التسوق' : 'Shopping Cart'}
        </h1>

        {items.length === 0 && formState !== 'success' ? (
          <div className="text-center py-20 flex flex-col items-center">
            <ShoppingBag size={48} className="mb-4" style={{ color: 'var(--color-rose-sand)', opacity: 0.5 }} />
            <p className="text-lg mb-6" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'عربة التسوق فارغة' : 'Your cart is empty'}</p>
            <Link to="/shop" className="btn-primary inline-flex">{isAr ? 'تصفح المنتجات' : 'Continue Shopping'}</Link>
          </div>
        ) : formState === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, var(--color-nude-pink), var(--color-pastel-rose))' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--color-charcoal)' }} />
            </div>
            <h2 className="text-2xl font-display mb-4" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>{isAr ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}</h2>
            <p className="mb-8" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'سنتواصل معك قريباً لتأكيد الطلب.' : 'We will contact you shortly to confirm your order.'}</p>
            <Link to="/shop" className="btn-primary inline-flex">{isAr ? 'العودة للمتجر' : 'Return to Shop'}</Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{ 
                      background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(200,169,154,0.15)',
                    }}
                  >
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <Link to={`/products/${item.productId}`} className="font-display text-lg no-underline hover:opacity-80 transition-opacity" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>
                          {item.name}
                        </Link>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center rounded-full border px-2 py-1" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,169,154,0.3)', background: isDark ? 'transparent' : 'rgba(255,255,255,0.5)' }}>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="font-display font-semibold text-lg" style={{ color: 'var(--color-warm-taupe)' }}>
                          {(item.price * item.quantity).toFixed(2)} <span className="text-xs">EGP</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div 
                className="p-6 rounded-2xl sticky top-28"
                style={{ 
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(200,169,154,0.15)',
                }}
              >
                <h3 className="text-xl font-display mb-6" style={{ color: isDark ? 'var(--color-dark-text)' : 'var(--color-charcoal)' }}>{isAr ? 'ملخص الطلب' : 'Order Summary'}</h3>
                
                <div className="flex justify-between items-center mb-6 pb-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,169,154,0.15)' }}>
                  <span style={{ color: 'var(--color-mocha)' }}>{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-2xl font-display font-semibold" style={{ color: 'var(--color-warm-taupe)' }}>
                    {cartTotal.toFixed(2)} <span className="text-sm">EGP</span>
                  </span>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  {errors.general && (
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm mb-4">{errors.general}</div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'الاسم' : 'Name'}</label>
                    <input type="text" value={form.customerName} onChange={e => setForm(f => ({...f, customerName: e.target.value}))} style={inpStyle('customerName')} />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'العنوان' : 'Address'}</label>
                    <textarea value={form.address} rows={2} onChange={e => setForm(f => ({...f, address: e.target.value}))} style={{...inpStyle('address'), resize: 'none'}} />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'واتساب' : 'WhatsApp'}</label>
                      <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))} style={inpStyle('whatsapp')} />
                      {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'الهاتف' : 'Phone'}</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={inpStyle('phone')} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formState === 'loading'}
                    className="btn-primary w-full mt-4 py-3"
                  >
                    {formState === 'loading' ? <Loader2 size={18} className="animate-spin mx-auto" /> : (isAr ? 'تأكيد الطلب' : 'Place Order')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
