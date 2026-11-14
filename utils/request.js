/**
 * 统一请求层
 *
 * 响应约定：{ code, message, data }，code === 0 成功。
 * HTTP 401 视为登录过期，清理本地登录态。
 */
const config = require('../config/index')
const store = require('./store')

class ApiError extends Error {
  constructor(message, options) {
    super(message)
    const opts = options || {}
    this.name = 'ApiError'
    this.code = opts.code === undefined ? -1 : opts.code
    this.statusCode = opts.statusCode || 0
    this.data = opts.data === undefined ? null : opts.data
    this.retryable = !!opts.retryable
  }
}

let loadingDepth = 0

function getToken() {
  const session = store.get('session')
  return (session && session.token) || ''
}

function clearSession() {
  store.set('session', null)
  try {
    wx.removeStorageSync(config.storageKeys.session)
  } catch (error) {
    // 忽略
  }
}

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

function pushLoading(title) {
  loadingDepth += 1
  if (loadingDepth === 1) {
    wx.showLoading({ title: title || '加载中', mask: true })
  }
}

function popLoading() {
  if (loadingDepth > 0) loadingDepth -= 1
  if (loadingDepth === 0) {
    wx.hideLoading()
  }
}

function buildHeader(extra, withAuth) {
  const header = Object.assign({ 'Content-Type': 'application/json' }, extra || {})
  if (withAuth) {
    const token = getToken()
    if (token) header.Authorization = 'Bearer ' + token
  }
  return header
}

function toBody(raw) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch (error) {
    return raw
  }
}

function normalize(res) {
  const statusCode = (res && res.statusCode) || 0
  const body = toBody(res && res.data)

  if (statusCode === 401) {
    clearSession()
    throw new ApiError('登录已过期，请重新进入小程序', { code: 401, statusCode: 401 })
  }

  if (statusCode < 200 || statusCode >= 300) {
    const message = (body && (body.message || body.msg)) || '请求失败（HTTP ' + statusCode + '）'
    throw new ApiError(message, {
      code: statusCode,
      statusCode: statusCode,
      data: body,
      retryable: statusCode >= 500
    })
  }

  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'code')) {
    if (String(body.code) === '401') {
      clearSession()
      throw new ApiError(body.message || '登录已过期，请重新进入小程序', { code: 401, statusCode: statusCode })
    }
    if (body.code !== 0 && body.code !== 200) {
      throw new ApiError(body.message || body.msg || '请求失败', {
        code: body.code,
        statusCode: statusCode,
        data: body.data
      })
    }
    return body.data
  }

  return body
}

function sendOnce(options) {
  const path = config.apiPrefix + options.path

  return new Promise(function (resolve, reject) {
    if (config.channel === 'container') {
      if (!wx.cloud || typeof wx.cloud.callContainer !== 'function') {
        reject(new ApiError('当前基础库不支持云托管调用', { code: 'NO_CLOUD' }))
        return
      }
      if (!config.cloud.envId || !config.cloud.service) {
        reject(new ApiError('请先在 config/index.js 填写云托管环境 ID 与服务名', {
          code: 'NO_CONTAINER_CONFIG'
        }))
        return
      }

      wx.cloud.callContainer({
        config: { env: config.cloud.envId },
        path: path,
        method: options.method,
        header: buildHeader(Object.assign({ 'X-WX-SERVICE': config.cloud.service }, options.header), options.auth),
        data: options.data,
        success: function (res) {
          try {
            resolve(normalize(res))
          } catch (error) {
            reject(error)
          }
        },
        fail: function (err) {
          reject(new ApiError((err && err.errMsg) || '网络异常，请稍后重试', {
            code: 'NETWORK',
            retryable: true
          }))
        }
      })
      return
    }

    wx.request({
      url: config.apiBase.replace(/\/$/, '') + path,
      method: options.method,
      data: options.data,
      header: buildHeader(options.header, options.auth),
      timeout: options.timeout,
      success: function (res) {
        try {
          resolve(normalize(res))
        } catch (error) {
          reject(error)
        }
      },
      fail: function (err) {
        const errMsg = (err && err.errMsg) || ''
        const isTimeout = errMsg.indexOf('timeout') >= 0
        reject(new ApiError(
          isTimeout ? '请求超时，请稍后重试' : '网络连接失败，请检查网络',
          { code: isTimeout ? 'TIMEOUT' : 'NETWORK', retryable: true }
        ))
      }
    })
  })
}

function showErrorToast(error) {
  const message = (error && error.message) || '操作失败'
  wx.showToast({
    title: message.length > 18 ? message.slice(0, 18) + '…' : message,
    icon: 'none',
    duration: 2200
  })
}

async function request(options) {
  const opts = Object.assign({
    method: 'GET',
    data: undefined,
    header: {},
    auth: true,
    loading: false,
    loadingText: '加载中',
    showError: true,
    retry: 0,
    timeout: config.timeout
  }, options)

  opts.method = String(opts.method || 'GET').toUpperCase()

  if (opts.loading) pushLoading(opts.loadingText)

  let lastError = null
  try {
    for (let attempt = 0; attempt <= opts.retry; attempt += 1) {
      try {
        return await sendOnce(opts)
      } catch (error) {
        lastError = error
        if (!error.retryable || attempt === opts.retry) break
        await delay(300 * (attempt + 1))
      }
    }
    throw lastError
  } catch (error) {
    if (opts.showError) showErrorToast(error)
    throw error
  } finally {
    if (opts.loading) popLoading()
  }
}

function get(path, data, options) {
  return request(Object.assign({ path: path, method: 'GET', data: data }, options))
}

function post(path, data, options) {
  return request(Object.assign({ path: path, method: 'POST', data: data }, options))
}

function put(path, data, options) {
  return request(Object.assign({ path: path, method: 'PUT', data: data }, options))
}

function del(path, data, options) {
  return request(Object.assign({ path: path, method: 'DELETE', data: data }, options))
}

module.exports = {
  request: request,
  get: get,
  post: post,
  put: put,
  del: del,
  ApiError: ApiError,
  getToken: getToken,
  showErrorToast: showErrorToast
}