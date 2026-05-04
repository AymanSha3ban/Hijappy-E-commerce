import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hijappy_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('hijappy_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  },
)

// ── Image Upload ──────────────────────────────────────────────────────────────
export const uploadImages = (files: File[], onProgress?: (pct: number) => void) => {
  const form = new FormData()
  files.forEach((f) => form.append('images', f))
  return api.post<{ urls: string[]; count: number }>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
}

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params?: Record<string, string>) => api.get('/products', { params })
export const getProduct  = (id: number) => api.get(`/products/${id}`)
export const createProduct = (data: unknown) => api.post('/products', data)
export const updateProduct = (id: number, data: unknown) => api.put(`/products/${id}`, data)
export const deleteProduct = (id: number) => api.delete(`/products/${id}`)

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories    = () => api.get('/categories')
export const createCategory   = (data: unknown) => api.post('/categories', data)
export const updateCategory   = (id: number, data: unknown) => api.put(`/categories/${id}`, data)
export const deleteCategory   = (id: number) => api.delete(`/categories/${id}`)

// ── Orders ────────────────────────────────────────────────────────────────────
export const getOrders        = (params?: Record<string, string>) => api.get('/orders', { params })
export const createOrder      = (data: unknown) => api.post('/orders', data)
export const updateOrderStatus = (id: number, status: string, notes?: string) =>
  api.patch(`/orders/${id}/status`, { status, notes })

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats')

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string) => api.post('/auth/login', { email, password })

export default api
