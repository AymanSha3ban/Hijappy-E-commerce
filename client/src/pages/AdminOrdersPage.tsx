import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useToast } from '../contexts/ToastContext'
import { getOrders, updateOrderStatus, deleteOrder, clearOrders } from '../services/api'
import { AdminSidebar } from './AdminDashboardPage'
import { Loader2, Inbox, Trash2 } from 'lucide-react'

interface Order {
  id: number; customerName: string; address: string
  whatsapp: string; phone: string; productName: string
  quantity: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; createdAt: string
}

const statusCls: Record<string, string> = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
}

export default function AdminOrdersPage() {
  const navigate                        = useNavigate()
  const { t, i18n }                     = useTranslation()
  const { addToast }                    = useToast()
  const [orders, setOrders]             = useState<Order[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('ALL')
  const [updating, setUpdating]         = useState<number | null>(null)

  const load = (status?: string) => {
    setLoading(true)
    const params = status && status !== 'ALL' ? { status } : undefined
    getOrders(params).then((r) => setOrders(r.data)).catch(() => addToast(t('admin.orders.error_loading', 'Failed to load orders'), 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { document.title = `${t('admin.orders.title')} | Louli`; load() }, [t])

  const handleFilter = (f: string) => { setFilter(f); load(f) }

  const handleStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o))
    } catch { addToast(t('admin.orders.update_error', 'Failed to update status.'), 'error') }
    finally { setUpdating(null) }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm(t('admin.orders.confirm_delete'))) {
      try {
        await deleteOrder(id)
        load(filter)
        addToast(t('admin.orders.delete_success', 'Order deleted'), 'success')
      } catch { addToast(t('admin.orders.delete_error', 'Failed to delete order.'), 'error') }
    }
  }

  const handleClearAll = async () => {
    const statusText = filter === 'ALL' ? '' : t(`admin.orders.status_${filter.toLowerCase()}`)
    if (window.confirm(t('admin.orders.confirm_clear_all', { status: statusText }))) {
      try {
        await clearOrders(filter)
        load(filter)
        addToast(t('admin.orders.clear_success', 'Orders cleared'), 'success')
      } catch { addToast(t('admin.orders.clear_error', 'Failed to clear orders.'), 'error') }
    }
  }

  const filters = [
    { key: 'ALL',       label: t('admin.orders.filter_all')       },
    { key: 'PENDING',   label: t('admin.orders.filter_pending')   },
    { key: 'CONFIRMED', label: t('admin.orders.filter_confirmed') },
    { key: 'CANCELLED', label: t('admin.orders.filter_cancelled') },
  ]

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  return (
    <div style={{ background: 'var(--color-parchment)', minHeight: '100vh' }}>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h1 className="text-3xl" style={{ color: 'var(--color-charcoal)' }}>
                {t('admin.orders.title')}
              </h1>
              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap">
                {filters.map((f) => (
                  <motion.button
                    key={f.key}
                    id={`filter-${f.key.toLowerCase()}`}
                    onClick={() => handleFilter(f.key)}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer"
                    style={{
                      background:  filter === f.key ? 'var(--color-warm-taupe)' : 'transparent',
                      color:       filter === f.key ? '#fff' : 'var(--color-warm-taupe)',
                      borderColor: filter === f.key ? 'var(--color-warm-taupe)' : 'var(--color-rose-sand)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {f.label}
                  </motion.button>
                ))}
                
                {orders.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all"
                    style={{
                      marginInlineStart: 'auto',
                      borderColor: '#DC2626', color: '#DC2626', background: 'transparent'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {t('admin.orders.clear_all', { status: filter === 'ALL' ? '' : t(`admin.orders.status_${filter.toLowerCase()}`) })}
                  </button>
                )}
              </div>
            </div>

            {/* Table card */}
            <div className="admin-card overflow-hidden">
              {loading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--color-rose-sand)' }} />
                </div>
              ) : orders.length === 0 ? (
                /* Elegant empty state */
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--color-parchment)' }}
                  >
                    <Inbox size={32} strokeWidth={1} style={{ color: 'var(--color-warm-taupe)' }} />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-1.5" style={{ color: 'var(--color-charcoal)' }}>
                      {t('admin.orders.no_orders')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>
                      {t('admin.orders.no_orders_sub')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--color-parchment)' }}>
                        {[
                          t('admin.orders.col_id'),       t('admin.orders.col_customer'),
                          t('admin.orders.col_product'),  'Qty',
                          t('admin.orders.col_whatsapp'), t('admin.orders.col_phone'),
                          t('admin.orders.col_address'),  t('admin.orders.col_status'),
                          t('admin.orders.col_date'),     t('admin.orders.col_actions'),
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: 'var(--color-warm-taupe)', letterSpacing: '0.12em' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, i) => (
                        <motion.tr
                          key={order.id}
                          layout
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="border-t table-row-hover cursor-pointer"
                          style={{
                            borderColor: 'rgba(200,169,154,0.12)',
                            background:  i % 2 === 0 ? '#fff' : 'rgba(250,246,242,0.45)',
                          }}
                        >
                          <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--color-warm-taupe)' }}>#{order.id}</td>
                          <td className="px-5 py-4 text-sm font-medium whitespace-nowrap" style={{ color: 'var(--color-charcoal)' }}>{order.customerName}</td>
                          <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--color-charcoal)' }}>{order.productName}</td>
                          <td className="px-5 py-4 text-sm text-center font-semibold" style={{ color: 'var(--color-warm-taupe)', fontFamily: 'var(--font-display)' }}>{order.quantity ?? 1}</td>
                          <td className="px-5 py-4 text-sm">
                            <a
                              href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}`}
                              target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="no-underline font-medium"
                              style={{ color: 'var(--color-sage-dark)' }}
                            >
                              {order.whatsapp}
                            </a>
                          </td>
                          <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--color-charcoal)' }}>{order.phone}</td>
                          <td className="px-5 py-4 text-sm max-w-xs truncate" style={{ color: 'var(--color-charcoal)' }} title={order.address}>{order.address}</td>
                          <td className="px-5 py-4"><span className={`badge ${statusCls[order.status] ?? ''}`}>{order.status}</span></td>
                          <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--color-warm-taupe)' }}>
                            {new Date(order.createdAt).toLocaleDateString(locale)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <select
                                id={`status-select-${order.id}`}
                                value={order.status}
                                disabled={updating === order.id}
                                onChange={(e) => handleStatus(order.id, e.target.value)}
                                className="text-xs rounded-lg px-3 py-2 outline-none border cursor-pointer"
                                style={{
                                  borderColor: 'var(--color-blush)',
                                  background:  'var(--color-parchment)',
                                  color:       'var(--color-charcoal)',
                                  fontFamily:  'inherit',
                                }}
                              >
                                <option value="PENDING">{t('admin.orders.status_pending')}</option>
                                <option value="CONFIRMED">{t('admin.orders.status_confirmed')}</option>
                                <option value="CANCELLED">{t('admin.orders.status_cancelled')}</option>
                              </select>
                              <button 
                                onClick={() => handleDelete(order.id)}
                                title={t('admin.orders.delete_order')}
                                className="p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors border-none bg-transparent cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
