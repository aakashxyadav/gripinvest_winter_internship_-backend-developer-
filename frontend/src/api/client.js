import axios from 'axios'

const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || process.env.VITE_API_BASE || 'http://localhost:4000'
const client = axios.create({ baseURL: base })

let token = null
client.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default {
  setToken: (t) => { token = t },
  post: (url, data) => client.post(url, data).then(r => r.data),
  get: (url, params) => client.get(url, { params }).then(r => r.data),
  put: (url, data) => client.put(url, data).then(r => r.data),
  delete: (url) => client.delete(url).then(r => r.data),
}
