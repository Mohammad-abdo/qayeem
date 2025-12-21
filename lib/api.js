import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're in admin dashboard
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard')) {
        Cookies.remove('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id, params) => api.get(`/users/${id}`, { params }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.put(`/users/${id}/password`, data),
}

// Evaluations API
export const evaluationsAPI = {
  getAll: (params) => api.get('/evaluations', { params }),
  getById: (id) => api.get(`/evaluations/${id}`),
  create: (data) => api.post('/evaluations', data),
  update: (id, data) => api.put(`/evaluations/${id}`, data),
  delete: (id) => api.delete(`/evaluations/${id}`),
  activate: (id) => api.post(`/evaluations/${id}/activate`),
  archive: (id) => api.post(`/evaluations/${id}/archive`),
  clone: (id) => api.post(`/evaluations/${id}/clone`),
}

// Criteria API
export const criteriaAPI = {
  getByEvaluation: (evaluationId) => api.get(`/criteria/evaluation/${evaluationId}`),
  create: (data) => api.post('/criteria', data),
  update: (id, data) => api.put(`/criteria/${id}`, data),
  delete: (id) => api.delete(`/criteria/${id}`),
}

// Ratings API
export const ratingsAPI = {
  getAll: (params) => api.get('/ratings', { params }),
  getById: (id) => api.get(`/ratings/${id}`),
  create: (data) => api.post('/ratings', data),
  update: (id, data) => api.put(`/ratings/${id}`, data),
  delete: (id) => api.delete(`/ratings/${id}`),
  submit: (id) => api.post(`/ratings/${id}/submit`),
  saveDraft: (id, data) => api.post(`/ratings/${id}/draft`, data),
}

// Books API
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  getItems: (bookId) => api.get(`/books/${bookId}/items`),
  createItem: (bookId, data) => api.post(`/books/${bookId}/items`, data),
  getRecommended: () => api.get('/books/recommended'),
  getRecommendationDetails: (bookId) => api.get(`/books/${bookId}/recommendation`),
  updateItem: (id, data) => api.put(`/books/items/${id}`, data),
  deleteItem: (id) => api.delete(`/books/items/${id}`),
}

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  updateStatus: (id, status) => api.put(`/payments/${id}/status`, { status }),
  getUserPayments: (params) => api.get('/payments/user/my-payments', { params }),
}

// Book Reviews API
export const bookReviewsAPI = {
  getAll: (params) => api.get('/book-reviews', { params }),
  getById: (id) => api.get(`/book-reviews/${id}`),
  create: (data) => api.post('/book-reviews', data),
  update: (id, data) => api.put(`/book-reviews/${id}`, data),
  delete: (id) => api.delete(`/book-reviews/${id}`),
  approve: (id) => api.patch(`/book-reviews/${id}/approve`),
}

// Book Progress API
export const bookProgressAPI = {
  getMyProgress: () => api.get('/book-progress/my-progress'),
  getBookProgress: (bookId) => api.get(`/book-progress/book/${bookId}`),
  updateProgress: (data) => api.post('/book-progress/update', data),
}

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions'),
}

// Reports API
export const reportsAPI = {
  generate: (evaluationId, type) => api.post(`/reports/generate`, { evaluationId, type }),
  getById: (id) => api.get(`/reports/${id}`),
  export: (id, format) => api.get(`/reports/${id}/export`, { params: { format }, responseType: 'blob' }),
}

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const couponsAPI = {
  getByCode: (code) => api.get(`/coupons/code/${code}`),
  validate: (code, amount) => api.post('/coupons/validate', { code, amount }),
}

export default api


