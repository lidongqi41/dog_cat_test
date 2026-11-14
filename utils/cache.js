/**
 * 业务缓存
 *
 * 只清理 cache: / history: / draft: 前缀的 key，
 * 登录态（wp_session）和头像（wp_avatar）永远保留。
 */
const config = require('../config/index')

function set(key, value, ttlMs) {
  const record = {
    value: value,
    expiresAt: ttlMs ? Date.now() + ttlMs : 0
  }
  try {
    wx.setStorageSync('cache:' + key, record)
  } catch (error) {
    // 忽略：缓存写入失败不影响主流程
  }
}

function get(key) {
  try {
    const record = wx.getStorageSync('cache:' + key)
    if (!record) return null
    if (record.expiresAt && record.expiresAt <= Date.now()) {
      wx.removeStorageSync('cache:' + key)
      return null
    }
    return record.value
  } catch (error) {
    return null
  }
}

function remove(key) {
  try {
    wx.removeStorageSync('cache:' + key)
  } catch (error) {
    // 忽略
  }
}

/**
 * 清理业务缓存，返回清理的 key 数量
 */
function clearBusiness() {
  let keys = []
  try {
    const info = wx.getStorageInfoSync()
    keys = (info && info.keys) || []
  } catch (error) {
    keys = []
  }

  let removed = 0
  const prefixes = config.cachePrefixes
  keys.forEach(function (key) {
    const hit = prefixes.some(function (prefix) {
      return key.indexOf(prefix) === 0
    })
    if (hit) {
      try {
        wx.removeStorageSync(key)
        removed += 1
      } catch (error) {
        // 忽略单条失败
      }
    }
  })
  return removed
}

module.exports = {
  set: set,
  get: get,
  remove: remove,
  clearBusiness: clearBusiness
}