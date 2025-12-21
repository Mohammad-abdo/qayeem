import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Separate API instance for admin with adminToken
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add admin auth token
adminApi.interceptors.request.use(
  (config) => {
    const adminToken = Cookies.get('adminToken')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('adminToken')
      // Only redirect if we're in dashboard (not during login)
      if (typeof window !== 'undefined' && 
          window.location.pathname.startsWith('/dashboard') && 
          !window.location.pathname.includes('/login')) {
        // Use router.push instead of window.location to avoid full page reload
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// Admin Auth API
export const adminAuthAPI = {
  login: (credentials) => adminApi.post('/auth/login', credentials),
  getCurrentUser: () => adminApi.get('/auth/me'),
}

// Admin APIs - use adminApi instead of regular api
export const adminUsersAPI = {
  getAll: (params) => adminApi.get('/users', { params }),
  getById: (id, params) => adminApi.get(`/users/${id}`, { params }),
  update: (id, data) => adminApi.put(`/users/${id}`, data),
  delete: (id) => adminApi.delete(`/users/${id}`),
}

export const adminBooksAPI = {
  getAll: (params) => adminApi.get('/books', { params }),
  getById: (id) => adminApi.get(`/books/${id}`),
  getStatistics: (id) => adminApi.get(`/books/${id}/statistics`),
  create: (data) => adminApi.post('/books', data),
  update: (id, data) => adminApi.put(`/books/${id}`, data),
  delete: (id) => adminApi.delete(`/books/${id}`),
}

export const adminEvaluationsAPI = {
  getAll: (params) => adminApi.get('/evaluations', { params }),
  getById: (id) => adminApi.get(`/evaluations/${id}`),
  create: (data) => adminApi.post('/evaluations', data),
  update: (id, data) => adminApi.put(`/evaluations/${id}`, data),
  delete: (id) => adminApi.delete(`/evaluations/${id}`),
  activate: (id) => adminApi.post(`/evaluations/${id}/activate`),
  archive: (id) => adminApi.post(`/evaluations/${id}/archive`),
  clone: (id) => adminApi.post(`/evaluations/${id}/clone`),
}

export const adminCriteriaAPI = {
  getByEvaluation: (evaluationId) => adminApi.get(`/criteria/evaluation/${evaluationId}`),
  create: (data) => adminApi.post('/criteria', data),
  update: (id, data) => adminApi.put(`/criteria/${id}`, data),
  delete: (id) => adminApi.delete(`/criteria/${id}`),
}

export const adminPaymentsAPI = {
  getAll: (params) => adminApi.get('/payments', { params }),
  getById: (id) => adminApi.get(`/payments/${id}`),
  update: (id, data) => adminApi.put(`/payments/${id}`, data),
  updateStatus: (id, status) => adminApi.put(`/payments/${id}/status`, { status }),
}

export const adminRolesAPI = {
  getAll: () => adminApi.get('/roles'),
  getById: (id) => adminApi.get(`/roles/${id}`),
  create: (data) => adminApi.post('/roles', data),
  update: (id, data) => adminApi.put(`/roles/${id}`, data),
  delete: (id) => adminApi.delete(`/roles/${id}`),
  getPermissions: () => adminApi.get('/roles/permissions'),
}

export const adminPermissionsAPI = {
  getAll: () => adminApi.get('/permissions'),
  getById: (id) => adminApi.get(`/permissions/${id}`),
  create: (data) => adminApi.post('/permissions', data),
  update: (id, data) => adminApi.put(`/permissions/${id}`, data),
  delete: (id) => adminApi.delete(`/permissions/${id}`),
}

export const adminNotificationsAPI = {
  getAll: (params) => adminApi.get('/notifications', { params }),
  create: (data) => adminApi.post('/notifications', data),
  update: (id, data) => adminApi.put(`/notifications/${id}`, data),
  markAsRead: (id) => adminApi.put(`/notifications/${id}/read`),
  markAllAsRead: () => adminApi.put('/notifications/read-all'),
  delete: (id) => adminApi.delete(`/notifications/${id}`),
}

export const adminReportsAPI = {
  getAll: (params) => adminApi.get('/reports', { params }),
  getById: (id) => adminApi.get(`/reports/${id}`),
  generate: (evaluationId, type) => adminApi.post('/reports/generate', { evaluationId, type }),
  export: (id, format) => adminApi.get(`/reports/${id}/export`, { params: { format }, responseType: 'blob' }),
  getPopularBooks: () => adminApi.get('/reports/popular-books'),
  getStatistics: () => adminApi.get('/reports/statistics'),
}

export const adminSettingsAPI = {
  getAll: () => adminApi.get('/settings'),
  getByKey: (key) => adminApi.get(`/settings/${key}`),
  create: (data) => adminApi.post('/settings', data),
  update: (id, data) => adminApi.put(`/settings/${id}`, data),
  updateByKey: (key, data) => adminApi.put(`/settings/key/${key}`, data),
  delete: (id) => adminApi.delete(`/settings/${id}`),
}

export const adminActivityLogsAPI = {
  getAll: (params) => adminApi.get('/activity-logs', { params }),
  getById: (id) => adminApi.get(`/activity-logs/${id}`),
}

export const adminBookItemsAPI = {
  getAll: (bookId) => adminApi.get(`/books/${bookId}/items`),
  create: (bookId, data) => adminApi.post(`/books/${bookId}/items`, data),
  update: (id, data) => adminApi.put(`/books/items/${id}`, data),
  delete: (id) => adminApi.delete(`/books/items/${id}`),
}

export const adminBookReviewsAPI = {
  getAll: (params) => adminApi.get('/book-reviews', { params }),
  getById: (id) => adminApi.get(`/book-reviews/${id}`),
  approve: (id) => adminApi.patch(`/book-reviews/${id}/approve`),
  delete: (id) => adminApi.delete(`/book-reviews/${id}`),
}

export const adminBookCategoriesAPI = {
  getAll: (params) => adminApi.get('/book-categories', { params }),
  getById: (id) => adminApi.get(`/book-categories/${id}`),
  create: (data) => adminApi.post('/book-categories', data),
  update: (id, data) => adminApi.put(`/book-categories/${id}`, data),
  delete: (id) => adminApi.delete(`/book-categories/${id}`),
}

export const adminBookEvaluationsAPI = {
  link: (data) => adminApi.post('/book-evaluations', data),
  unlink: (bookId, evaluationId) => adminApi.delete(`/book-evaluations/${bookId}/${evaluationId}`),
  getBookEvaluations: (bookId) => adminApi.get(`/book-evaluations/book/${bookId}`),
  getEvaluationBooks: (evaluationId) => adminApi.get(`/book-evaluations/evaluation/${evaluationId}`),
  updateLink: (bookId, evaluationId, data) => adminApi.put(`/book-evaluations/${bookId}/${evaluationId}`, data),
}

// Upload API - use FormData for file uploads
export const adminUploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return adminApi.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteImage: (filename) => adminApi.delete(`/upload/image/${filename}`),
}

export const adminCouponsAPI = {
  getAll: (params) => adminApi.get('/coupons', { params }),
  getById: (id) => adminApi.get(`/coupons/${id}`),
  getByCode: (code) => adminApi.get(`/coupons/code/${code}`),
  create: (data) => adminApi.post('/coupons', data),
  update: (id, data) => adminApi.put(`/coupons/${id}`, data),
  delete: (id) => adminApi.delete(`/coupons/${id}`),
  validate: (code, amount) => adminApi.post('/coupons/validate', { code, amount }),
}

