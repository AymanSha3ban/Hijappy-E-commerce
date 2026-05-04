import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, uploadImages } from '../services/api'
import { AdminSidebar } from './AdminDashboardPage'

interface Category { id: number; name: string }
interface Product {
  id: number; name: string; slug: string; description: string; price: number
  images: string[]; colors: string[]; stock: number; featured: boolean
  categoryId: number; category?: { name: string }
}

const toSlug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
const emptyForm = { name: '', slug: '', description: '', price: 0, colors: '', stock: 0, featured: false, categoryId: 0 }

export default function AdminProductsPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { document.title = `${t('admin.products.title')} | Hijappy`; load() }, [t])

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setUploadedUrls([]); setError(''); setModalOpen(true)
  }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, slug: p.slug, description: p.description, price: p.price,
      colors: p.colors.join(', '), stock: p.stock, featured: p.featured, categoryId: p.categoryId })
    setUploadedUrls(p.images)
    setError(''); setModalOpen(true)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setUploadProgress(0)
    try {
      const res = await uploadImages(Array.from(files), setUploadProgress)
      setUploadedUrls((prev) => [...prev, ...res.data.urls])
    } catch { setError('Image upload failed. Check Cloudinary credentials.') }
    finally { setUploading(false); setUploadProgress(0) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (i: number) => setUploadedUrls((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    if (uploadedUrls.length === 0) { setError('Please upload at least one image.'); setSaving(false); return }
    const payload = {
      ...form,
      price: Number(form.price), stock: Number(form.stock), categoryId: Number(form.categoryId),
      images: uploadedUrls,
      colors: String(form.colors).split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (editing) await updateProduct(editing.id, payload)
      else await createProduct(payload)
      setModalOpen(false); load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(typeof msg === 'string' ? msg : 'Failed to save product.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    try { await deleteProduct(deleteId); setDeleteId(null); load() }
    catch { alert('Could not delete — product may have orders.') }
  }

  const inp = 'w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all'
  const inpSt = { background: 'var(--color-parchment)', borderColor: 'var(--color-blush)', color: 'var(--color-charcoal)', fontFamily: 'inherit' }

  return (
    <div style={{ background: 'var(--color-parchment)', minHeight: '100vh' }}>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="p-6 md:p-10 overflow-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h1 className="text-3xl" style={{ color: 'var(--color-charcoal)' }}>{t('admin.products.title')}</h1>
            <button id="add-product-btn" className="btn-primary" onClick={openAdd} style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}>
              {t('admin.products.add')}
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-2xl animate-pulse h-52" style={{ background: '#fff' }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">🧣</p>
              <p className="text-lg mb-1" style={{ color: 'var(--color-charcoal)' }}>{t('admin.products.no_products')}</p>
              <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.no_products_sub')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <motion.div key={p.id} layout className="rounded-2xl overflow-hidden"
                  style={{ background: '#fff', boxShadow: 'var(--shadow-card)' }}
                  whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full object-cover" style={{ height: 180 }} onError={(e) => (e.currentTarget.style.display = 'none')} />}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-rose-sand)' }}>{p.category?.name}</p>
                    <h3 className="text-xl mb-1 truncate" style={{ color: 'var(--color-charcoal)' }}>{p.name}</h3>
                    <p className="text-base mb-3" style={{ color: 'var(--color-warm-taupe)' }}>{p.price.toFixed(2)} ج.م</p>
                    <div className="flex gap-2">
                      <button id={`edit-product-${p.id}`} onClick={() => openEdit(p)} className="btn-outline flex-1" style={{ fontSize: '0.8rem', padding: '0.4rem 0' }}>
                        {t('admin.products.edit')}
                      </button>
                      <button id={`delete-product-${p.id}`} onClick={() => setDeleteId(p.id)}
                        className="flex-1 rounded-full border text-sm py-1.5 px-4 cursor-pointer transition-all"
                        style={{ border: '1.5px solid #FCA5A5', color: '#DC2626', background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        {t('admin.products.delete')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)} className="fixed inset-0 z-50"
              style={{ background: 'rgba(44,36,36,0.5)', backdropFilter: 'blur(6px)' }} />
            <motion.div key="md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
              <div className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto" style={{ background: 'var(--color-cream)', maxHeight: '90vh', pointerEvents: 'auto', boxShadow: 'var(--shadow-modal)' }}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl" style={{ color: 'var(--color-charcoal)' }}>{editing ? t('admin.products.modal_edit') : t('admin.products.modal_add')}</h2>
                    <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-lg cursor-pointer border-none"
                      style={{ background: 'var(--color-blush)', color: 'var(--color-mocha)' }}>×</button>
                  </div>
                  {error && <p className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</p>}

                  <form id="product-form" onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_name')}</label>
                      <input className={inp} style={inpSt} value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} required />
                    </div>
                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_slug')}</label>
                      <input className={inp} style={{ ...inpSt, fontFamily: 'monospace' }} value={form.slug}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={t('admin.products.slug_hint')} required />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_category')}</label>
                      <select className={inp} style={inpSt} value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))} required>
                        <option value={0}>{t('admin.products.select_category')}</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    {/* Price */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_price')}</label>
                      <input type="number" min={0} step={0.01} className={inp} style={inpSt} value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} required />
                    </div>
                    {/* Stock */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_stock')}</label>
                      <input type="number" min={0} className={inp} style={inpSt} value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
                    </div>
                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_desc')}</label>
                      <textarea rows={3} className={inp} style={{ ...inpSt, resize: 'none' }} value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
                    </div>
                    {/* Colors */}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_colors')}</label>
                      <input className={inp} style={inpSt} value={form.colors}
                        onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} placeholder="#C8A99A, #D4A5A5, Ivory" />
                    </div>
                    {/* Image Upload */}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.field_images')}</label>
                      <div
                        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-rose-sand)', borderTopColor: 'transparent' }} />
                            <p className="text-sm" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.uploading')} {uploadProgress}%</p>
                            <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-blush)' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'var(--color-warm-taupe)' }} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📸</span>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.upload_btn')}</p>
                            <p className="text-xs" style={{ color: 'var(--color-rose-sand)' }}>{t('admin.products.upload_hint')}</p>
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => handleFiles(e.target.files)} />
                      {/* Preview thumbnails */}
                      {uploadedUrls.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {uploadedUrls.map((url, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden"
                              style={{ boxShadow: 'var(--shadow-card)' }}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImage(i)}
                                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer border-none"
                                style={{ background: 'rgba(220,38,38,0.85)', color: '#fff' }}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Featured */}
                    <div className="col-span-2 flex items-center gap-3">
                      <input type="checkbox" id="featured" checked={form.featured}
                        onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                        className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-warm-taupe)' }} />
                      <label htmlFor="featured" className="text-sm" style={{ color: 'var(--color-charcoal)' }}>{t('admin.products.field_featured')}</label>
                    </div>
                    {/* Actions */}
                    <div className="col-span-2 flex gap-3 pt-2">
                      <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">{t('admin.products.cancel')}</button>
                      <motion.button id="save-product-btn" type="submit" className="btn-primary flex-1" disabled={saving || uploading} whileTap={{ scale: 0.97 }}>
                        {saving ? t('admin.products.saving') : editing ? t('admin.products.update') : t('admin.products.save')}
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
              <div className="w-full max-w-sm rounded-3xl p-8 text-center" style={{ background: 'var(--color-cream)', boxShadow: 'var(--shadow-modal)' }}>
                <p className="text-4xl mb-4">⚠️</p>
                <h3 className="text-2xl mb-2" style={{ color: 'var(--color-charcoal)' }}>{t('admin.products.delete_title')}</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--color-warm-taupe)' }}>{t('admin.products.delete_msg')}</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">{t('admin.products.cancel')}</button>
                  <button id="confirm-delete-btn" onClick={handleDelete} className="flex-1 btn-primary" style={{ background: '#DC2626' }}>{t('admin.products.confirm_delete')}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
