/**
 * 页面工厂
 */
const auth = require('../services/auth')

function createPage(options) {
  const opts = options || {}
  const page = Object.assign({}, opts)

  page.data = Object.assign({
    loading: false,
    error: '',
    empty: false
  }, opts.data || {})

  page.setLoading = function (loading) {
    this.setData({ loading: !!loading })
  }

  page.setError = function (error) {
    this.setData({ error: error ? String(error) : '' })
  }

  page.setEmpty = function (empty) {
    this.setData({ empty: !!empty })
  }

  const originalOnLoad = opts.onLoad
  page.onLoad = function (query) {
    if (opts.requireLogin) {
      auth.ensureLogin().catch(function (error) {
        this.setError(error.message || '登录失败')
      }.bind(this))
    }
    if (typeof originalOnLoad === 'function') {
      originalOnLoad.call(this, query)
    }
  }

  page.onShareAppMessage = opts.onShareAppMessage || function () {
    return {
      title: '暖爪 WarmPaws · 流浪动物救助',
      path: '/pages/index/index'
    }
  }

  return page
}

module.exports = {
  createPage: createPage
}