import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useToast } from '../contexts/ToastContext'
import { getOrder, updateOrderStatus } from '../services/api'
import { AdminSidebar } from './AdminDashboardPage'
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'

interface Order {
  id: number; customerName: string; address: string
  whatsapp: string; phone: string; productName: string
  quantity: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; createdAt: string
  notes?: string
  product?: { name: string; price: number; images: string[] }
}

const statusCls: Record<string, string> = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { addToast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [status, setStatus] = useState<Order['status']>('PENDING')
  const [notes, setNotes] = useState('')

  const isAr = i18n.language === 'ar'
  const BackArrow = isAr ? ArrowRight : ArrowLeft

  useEffect(() => {
    if (!id) return
    getOrder(Number(id))
      .then((r) => {
        setOrder(r.data)
        setStatus(r.data.status)
        setNotes(r.data.notes || '')
      })
      .catch(() => {
        addToast(t('admin.orders.error_loading', 'Failed to load order'), 'error')
        navigate('/admin/orders')
      })
      .finally(() => setLoading(false))
  }, [id, navigate, addToast, t])

  const handleSave = async () => {
    if (!order) return
    setSaving(true)
    try {
      await updateOrderStatus(order.id, status, notes)
      setOrder({ ...order, status, notes })
      addToast(t('admin.orders.save_success', 'Order updated successfully'), 'success')
    } catch {
      addToast(t('admin.orders.save_error', 'Failed to update order'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--color-parchment)', minHeight: '100vh' }}>
        <div className="admin-layout">
          <AdminSidebar />
          <main className="p-6 lg:p-10 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </main>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div style={{ background: 'var(--color-parchment)', minHeight: '100vh' }}>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            
            <button 
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-2 mb-6 text-sm font-medium border-none bg-transparent cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-warm-taupe)' }}
            >
              <BackArrow size={16} />
              {t('product.back', 'Back')}
            </button>

            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h1 className="text-3xl" style={{ color: 'var(--color-charcoal)' }}>
                {isAr ? `طلب #${order.id}` : `Order #${order.id}`}
              </h1>
              <span className={`badge ${statusCls[order.status]}`}>{order.status}</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Order Details & Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="admin-card p-6">
                  <h2 className="text-xl font-display mb-4 border-b pb-3" style={{ color: 'var(--color-charcoal)', borderColor: 'rgba(200,169,154,0.15)' }}>
                    {isAr ? 'معلومات العميل' : 'Customer Information'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'الاسم' : 'Name'}</p>
                      <p className="font-medium text-lg mt-1">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'العنوان' : 'Address'}</p>
                      <p className="font-medium text-lg mt-1">{order.address}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'واتساب' : 'WhatsApp'}</p>
                      <a href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-medium text-lg mt-1 text-green-600 no-underline hover:underline">
                        {order.whatsapp}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-warm-taupe)' }}>{isAr ? 'الهاتف' : 'Phone'}</p>
                      <p className="font-medium text-lg mt-1">{order.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="admin-card p-6">
                  <h2 className="text-xl font-display mb-4 border-b pb-3" style={{ color: 'var(--color-charcoal)', borderColor: 'rgba(200,169,154,0.15)' }}>
                    {isAr ? 'المنتجات' : 'Products'}
                  </h2>
                  <div className="flex items-center gap-4">
                    {order.product && order.product.images?.length > 0 && (
                      <div className="w-16 h-20 rounded bg-gray-100 overflow-hidden shrink-0">
                        <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-lg">{order.productName}</p>
                      <p className="text-sm text-gray-500 mt-1">Quantity: {order.quantity}</p>
                    </div>
                    {order.product && (
                      <div className="text-right">
                        <p className="font-display font-semibold text-lg">{order.product.price * order.quantity} EGP</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Fulfillment */}
              <div className="lg:col-span-1">
                <div className="admin-card p-6 sticky top-6">
                  <h2 className="text-xl font-display mb-4 border-b pb-3" style={{ color: 'var(--color-charcoal)', borderColor: 'rgba(200,169,154,0.15)' }}>
                    {isAr ? 'حالة الطلب' : 'Fulfillment'}
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-warm-taupe)' }}>
                        {t('admin.orders.col_status', 'Status')}
                      </label>
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as Order['status'])}
                        className="w-full p-2.5 rounded-lg border outline-none cursor-pointer"
                        style={{ borderColor: 'rgba(200,169,154,0.3)', background: 'rgba(255,255,255,0.5)' }}
                      >
                        <option value="PENDING">{t('admin.orders.status_pending', 'Pending')}</option>
                        <option value="CONFIRMED">{t('admin.orders.status_confirmed', 'Confirmed')}</option>
                        <option value="CANCELLED">{t('admin.orders.status_cancelled', 'Cancelled')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-warm-taupe)' }}>
                        {isAr ? 'ملاحظات (داخلي)' : 'Admin Notes'}
                      </label>
                      <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full p-2.5 rounded-lg border outline-none resize-none"
                        style={{ borderColor: 'rgba(200,169,154,0.3)', background: 'rgba(255,255,255,0.5)' }}
                        placeholder="Private notes for staff..."
                      />
                    </div>

                    <button 
                      onClick={handleSave} 
                      disabled={saving || (status === order.status && notes === (order.notes || ''))}
                      className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
