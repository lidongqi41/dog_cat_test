const BASE = (import.meta.env.VITE_API_BASE || '/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'wp_admin_token'
const ADMIN_KEY = 'wp_admin_info'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getAdmin() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null')
  } catch (error) {
    return null
  }
}

export function setSession(token, admin) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin || null))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}

function buildUrl(path, params) {
  const url = BASE + path
  if (!params) return url
  const query = new URLSearchParams()
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })
  const text = query.toString()
  return text ? url + '?' + text : url
}

function handleUnauthorized() {
  clearSession()
  if (window.location.hash !== '#/login') {
    window.location.hash = '#/login'
  }
}

export async function request(path, options = {}) {
  const method = options.method || 'GET'
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    })
  } catch (error) {
    throw new Error('无法连接后端，请确认 8080 端口已启动')
  }

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error('登录已过期，请重新登录')
  }

  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch (error) {
    json = null
  }

  if (!response.ok || !json || json.code !== 0) {
    throw new Error((json && json.message) || '请求失败（HTTP ' + response.status + '）')
  }
  return json.data
}

export async function upload(file, bizType = 'animal') {
  const form = new FormData()
  form.append('file', file)
  form.append('bizType', bizType)

  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token

  let response
  try {
    response = await fetch(BASE + '/uploads', { method: 'POST', headers, body: form })
  } catch (error) {
    throw new Error('上传失败，请确认后端已启动')
  }

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error('登录已过期，请重新登录')
  }

  const json = await response.json().catch(() => null)
  if (!response.ok || !json || json.code !== 0) {
    throw new Error((json && json.message) || '上传失败')
  }
  return json.data
}