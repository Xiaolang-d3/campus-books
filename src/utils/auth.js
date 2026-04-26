const AUTH_KEYS = ['token', 'role', 'tableName', 'userid', 'username', 'avatar']
const LEGACY_BLOCK_KEY = '__auth_legacy_blocked'

const migrateLegacyAuth = () => {
  if (sessionStorage.getItem('token') || sessionStorage.getItem(LEGACY_BLOCK_KEY)) return
  const legacyToken = localStorage.getItem('token')
  if (!legacyToken) return

  AUTH_KEYS.forEach(key => {
    const value = localStorage.getItem(key)
    if (value !== null) {
      sessionStorage.setItem(key, value)
    }
  })
}

const legacyRead = (key) => {
  migrateLegacyAuth()
  const value = sessionStorage.getItem(key)
  if (value !== null) return value
  if (sessionStorage.getItem(LEGACY_BLOCK_KEY)) return null
  return localStorage.getItem(key)
}

export const authStorage = {
  get(key) {
    return legacyRead(key)
  },
  set(key, value) {
    sessionStorage.removeItem(LEGACY_BLOCK_KEY)
    sessionStorage.setItem(key, value ?? '')
  },
  remove(key) {
    sessionStorage.removeItem(key)
  },
  clear() {
    AUTH_KEYS.forEach(key => {
      sessionStorage.removeItem(key)
    })
    sessionStorage.setItem(LEGACY_BLOCK_KEY, '1')
  },
  hasToken() {
    return !!legacyRead('token')
  },
  authHeader() {
    const token = legacyRead('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

migrateLegacyAuth()

export default authStorage
