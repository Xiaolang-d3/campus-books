export default {
  get(key) {
    return localStorage.getItem(key)
  },
  set(key, value) {
    localStorage.setItem(key, value)
  },
  remove(key) {
    localStorage.removeItem(key)
  },
  getJSON(key) {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : null
  },
  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
