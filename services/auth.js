/**
 * 登录与会话
 *
 * 微信账号即账号：wx.login 取 code → 后端 code2session → openid → token。
 */
const config = require('../config/index')
const request = require('../utils/request')
const store = require('../utils/store')
const mock = require('../utils/mock')

function getSession() {
  return store.get('session')
}

function saveSession(session) {
  store.set('session', session)
  try {
    wx.setStorageSync(config.storageKeys.session, session)
  } catch (error) {
    console.error('[auth] 保存登录态失败:', error)
  }
  try {
    const app = getApp()
    if (app && app.globalData) app.globalData.session = session
  } catch (error) {
    // 忽略：启动早期 getApp 可能不可用
  }
  return session
}

function clearSession() {
  store.set('session', null)
  try {
    wx.removeStorageSync(config.storageKeys.session)
  } catch (error) {
    console.error('[auth] 清理登录态失败:', error)
  }
  try {
    const app = getApp()
    if (app && app.globalData) app.globalData.session = null
  } catch (error) {
    // 忽略
  }
}

function restoreSession() {
  try {
    const cached = wx.getStorageSync(config.storageKeys.session)
    if (!cached || !cached.token) return null
    if (cached.expiresAt && cached.expiresAt <= Date.now()) {
      clearSession()
      return null
    }
    store.set('session', cached)
    return cached
  } catch (error) {
    return null
  }
}

function loginCode() {
  return new Promise(function (resolve, reject) {
    wx.login({
      timeout: 10000,
      success: function (res) {
        if (res && res.code) {
          resolve(res.code)
        } else {
          reject(new Error('微信登录失败：未返回 code'))
        }
      },
      fail: function (err) {
        reject(new Error((err && err.errMsg) || '微信登录失败'))
      }
    })
  })
}

async function login(options) {
  const opts = options || {}
  const current = getSession()

  if (!opts.force && current && current.token &&
    (!current.expiresAt || current.expiresAt > Date.now() + 30 * 1000)) {
    return current
  }

  let payload
  if (config.mock) {
    payload = await mock.login()
  } else {
    const code = await loginCode()
    payload = await request.post('/auth/login', { code: code }, {
      auth: false,
      showError: false
    })
  }

  if (!payload || !payload.token) {
    throw new Error('登录失败：后端未返回 token')
  }

  return saveSession({
    token: payload.token,
    expiresAt: Date.now() + (payload.expiresIn || 7200) * 1000,
    user: payload.user || null
  })
}

let loginPromise = null

function ensureLogin() {
  const current = getSession()
  if (current && current.token) return Promise.resolve(current)

  if (!loginPromise) {
    loginPromise = login()
    loginPromise.then(function () {
      loginPromise = null
    }).catch(function () {
      loginPromise = null
    })
  }
  return loginPromise
}

function logout() {
  clearSession()
}

function isLoggedIn() {
  const session = getSession()
  return !!(session && session.token)
}

/**
 * 资料修改后同步更新本地会话
 */
function updateUser(user) {
  const current = getSession()
  if (!current) return null
  current.user = user
  return saveSession(current)
}

module.exports = {
  login: login,
  ensureLogin: ensureLogin,
  logout: logout,
  getSession: getSession,
  restoreSession: restoreSession,
  saveSession: saveSession,
  clearSession: clearSession,
  isLoggedIn: isLoggedIn,
  updateUser: updateUser
}