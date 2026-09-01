import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,          // session cookie on every request
})

const AUTH_ENDPOINTS = ['/api/v1/auth/login', '/api/v1/auth/register']

client.interceptors.response.use(
  response => response,
  error => {
    const url: string = error.config?.url ?? ''
    const isAuthEndpoint = AUTH_ENDPOINTS.some(path => url.includes(path))
    const alreadyOnLogin = window.location.pathname.startsWith('/login')
    const alreadyOnCallback = window.location.pathname.startsWith('/auth/callback')
    if (error.response?.status === 401 && !isAuthEndpoint && !alreadyOnLogin && !alreadyOnCallback) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client