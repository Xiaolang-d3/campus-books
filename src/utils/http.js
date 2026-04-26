import axios from 'axios'
import router from '@/router'
import authStorage from '@/utils/auth'

const http = axios.create({
  timeout: 86400000,
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
})

http.interceptors.request.use(config => {
  const token = authStorage.get('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  response => {
    if (response.data && response.data.code === 401) {
      authStorage.clear()
      router.push('/login')
    }
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      authStorage.clear()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default http
