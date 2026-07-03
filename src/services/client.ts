import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,          // session cookie on every request
})

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register']

client.interceptors.response.use(
  response => response,
  error => {
    const url: string = error.config?.url ?? ''
    const isAuthEndpoint = AUTH_ENDPOINTS.some(path => url.includes(path))
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client