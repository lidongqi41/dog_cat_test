/**
 * 运行环境配置
 *
 * 环境由微信自动识别：
 *   develop → 开发版（默认连本地后端；控制台 wx.setStorageSync('__use_mock', true) 可切回 Mock）
 *   trial   → 体验版
 *   release → 正式版
 *
 * 上线前填写 apiBase（云托管 HTTPS 域名），并在公众平台配置 request 合法域名。
 */
const ENV_MAP = {
  develop: 'dev',
  trial: 'trial',
  release: 'prod'
}

function detectEnv() {
  try {
    if (typeof wx === 'undefined' || !wx.getAccountInfoSync) return 'dev'
    const info = wx.getAccountInfoSync()
    const version = info && info.miniProgram && info.miniProgram.envVersion
    return ENV_MAP[version] || 'dev'
  } catch (error) {
    return 'dev'
  }
}

const PROFILES = {
  dev: {
    name: '开发版',
    apiBase: 'http://127.0.0.1:8080',
    mock: false,
    debug: true
  },
  trial: {
    name: '体验版',
    apiBase: 'https://REPLACE-ME.example.com',
    mock: false,
    debug: true
  },
  prod: {
    name: '正式版',
    apiBase: 'https://REPLACE-ME.example.com',
    mock: false,
    debug: false
  }
}

const ENV = detectEnv()
const PROFILE = PROFILES[ENV] || PROFILES.dev

/**
 * 本地临时切回 Mock：开发者工具控制台执行
 *   wx.setStorageSync('__use_mock', true)
 * 重新编译即可；恢复后端模式用 false 或删除该 key。
 */
function readMockOverride() {
  try {
    const value = wx.getStorageSync('__use_mock')
    if (value === true || value === false) return value
  } catch (error) {
    // 忽略：启动早期不可用
  }
  return null
}

const mockOverride = readMockOverride()

module.exports = Object.assign({
  ENV: ENV,
  apiPrefix: '/api/v1',
  timeout: 15000,
  appVersion: 'v0.2.0',
  storageKeys: {
    session: 'wp_session',
    avatar: 'wp_avatar'
  },
  // 'https' 走 wx.request；'container' 走 wx.cloud.callContainer
  channel: 'https',
  cloud: {
    envId: '',
    service: ''
  },
  cachePrefixes: ['cache:', 'history:', 'draft:']
}, PROFILE, {
  mock: mockOverride === null ? PROFILE.mock : mockOverride
})