import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useToast } from '../contexts/ToastContext'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api'
import { AdminSidebar } from './AdminDashboardPage'

interface Category { id: number; name: string; slug: string; _count?: { products: number } }

const toSlug = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')

export default function AdminCategoriesPage() {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    getCategories().then((r) => setCats(r.data)).catch(() => addToast(t('admin.categories.error_loading', 'Failed to load categories'), 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { document.title = `${t('admin.categories.title')} | Louli`; load() }, [t])

  const openAdd = () => {
    setEditing(null); setForm({ name: '', slug: '' }); setSlugManual(false); setError(''); setModalOpen(true)
    setTimeout(() => nameRef.current?.focus(), 100)
  }
  const openEdit = (c: Category) => {
    setEditing(c); setForm({ name: c.name, slug: c.slug }); setSlugManual(true); setError(''); setModalOpen(true)
    setTimeout(() => nameRef.current?.focus(), 100)
  }

  const handleNameChange = (val: string) => {
    setForm((f) => ({ ...f, name: val, slug: slugManual ? f.slug : toSlug(val) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editing) await updateCategory(editing.id, form)
      else await createCategory(form)
      setModalOpen(false); load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(typeof msg === 'string' ? msg : 'Failed to save category.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    try { await deleteCategory(deleteId); setDeleteId(null); load(); addToast(t('admin.categories.delete_success', 'Category deleted'), 'success') }
    catch { addToast(t('admin.categories.delete_error', 'Could not delete — category may have products.'), 'error') }
  }

  const inp = 'w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all'
  const inpSt = { background: 'var(--color-parchment)', borderColor: 'var(--color-blush)', color: 'var(--color-charcoal)', fontFamily: 'inherit' }

  return (
    <div style={{ background: 'var(--color-parchment)', minHeight: '100vh' }}>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h1 className="text-3xl" style={{ color: 'var(--color-charcoal)' }}>{t('admin.categories.title')}</h1>
              <button id="add-category-btn" className="btn-primary" onClick={openAdd} style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}>
                {t('admin.categories.add')}
              </button>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse h-24" style={{ background: '#fff' }} />
                ))}
              </div>
            ) : cats.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl mb-3">🏷️</p>
                <p className="text-xl mb-1" style={{ color: 'var(--color-charcoal)' }}>{t('admin.categories.no_categories')}</p>
                <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.categories.no_categories_sub')}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {cats.map((c) => (
                  <motion.div key={c.id} layout
                    className="rounded-2xl p-6 flex flex-col gap-4"
                    style={{ background: '#fff', boxShadow: 'var(--shadow-card)' }}
                    whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl mb-1" style={{ color: 'var(--color-charcoal)' }}>{c.name}</h3>
                        <p className="text-xs font-mono" style={{ color: 'var(--color-rose-sand)' }}>{c.slug}</p>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
                        style={{ background: 'var(--color-blush)', color: 'var(--color-mocha)' }}
                      >
                        {t('admin.categories.products_count', { count: c._count?.products ?? 0 })}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1 border-t" style={{ borderColor: 'var(--color-blush)' }}>
                      <button id={`edit-cat-${c.id}`} onClick={() => openEdit(c)}
                        className="btn-outline flex-1" style={{ fontSize: '0.8rem', padding: '0.4rem 0' }}>
                        {t('admin.categories.edit')}
                      </button>
                      <button id={`delete-cat-${c.id}`} onClick={() => setDeleteId(c.id)}
                        className="flex-1 rounded-full border text-sm py-1.5 px-4 cursor-pointer transition-all"
                        style={{ border: '1.5px solid #FCA5A5', color: '#DC2626', background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        {t('admin.categories.delete')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)} className="fixed inset-0 z-50"
              style={{ background: 'rgba(44,36,36,0.5)', backdropFilter: 'blur(6px)' }} />
            <motion.div key="md" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-3xl shadow-2xl" style={{ background: 'var(--color-cream)', boxShadow: 'var(--shadow-modal)' }}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl" style={{ color: 'var(--color-charcoal)' }}>
                      {editing ? t('admin.categories.modal_edit') : t('admin.categories.modal_add')}
                    </h2>
                    <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-lg cursor-pointer border-none"
                      style={{ background: 'var(--color-blush)', color: 'var(--color-mocha)' }}>×</button>
                  </div>
                  {error && <p className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</p>}
                  <form id="category-form" onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="category-name" className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>
                        {t('admin.categories.field_name')}
                      </label>
                      <input id="category-name" name="name" ref={nameRef} className={inp} style={inpSt} value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)} required />
                    </div>
                    <div>
                      <label htmlFor="category-slug" className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>
                        {t('admin.categories.field_slug')}
                        <span className="ms-2 normal-case font-normal opacity-60">{t('admin.categories.slug_auto')}</span>
                      </label>
                      <input id="category-slug" name="slug" className={inp} style={{ ...inpSt, fontFamily: 'monospace' }} value={form.slug}
                        onChange={(e) => { setSlugManual(true); setForm((f) => ({ ...f, slug: e.target.value })) }} required />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">{t('admin.categories.cancel')}</button>
                      <motion.button id="save-category-btn" type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>
                        {saving ? t('admin.categories.saving') : editing ? t('admin.categories.update') : t('admin.categories.save')}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId != null && (
          <>
            <motion.div key="dbd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(44,36,36,0.5)', backdropFilter: 'blur(6px)' }} />
            <motion.div key="dmd" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl" style={{ background: 'var(--color-cream)', boxShadow: 'var(--shadow-modal)' }}>
                <p className="text-4xl mb-4">⚠️</p>
                <h3 className="text-2xl mb-2" style={{ color: 'var(--color-charcoal)' }}>{t('admin.categories.delete_title')}</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.categories.delete_msg')}</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">{t('admin.categories.cancel')}</button>
                  <button id="confirm-delete-cat-btn" onClick={handleDelete} className="flex-1 btn-primary" style={{ background: '#DC2626' }}>
                    {t('admin.categories.confirm_delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
