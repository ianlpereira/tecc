import axios, { AxiosInstance } from 'axios'

// Determine API URL at runtime:
// 1. Try localhost:8000 (works when accessing from browser on host machine)
// 2. Fall back to VITE_API_URL env var (for Docker/production)
// 3. Final fallback to localhost:8000
const getApiUrl = (): string => {
  // If VITE_API_URL is explicitly set (e.g., in production), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Default to localhost for development (works from host browser)
  return 'http://localhost:8000'
}

const API_URL = getApiUrl()

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
