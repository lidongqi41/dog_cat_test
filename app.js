const config = require('./config/index')
const auth = require('./services/auth')

App({
  globalData: {
    config: config,
    session: null
  },

  onLaunch() {
    const cached = auth.restoreSession()
    if (cached) this.globalData.session = cached

    // 微信账号登录：静默进行，无弹窗、无注册
    auth.login().then((session) => {
      this.globalData.session = session
    }).catch((error) => {
      if (config.debug) console.warn('[app] 登录失败：', error)
    })

    this.setupUpdateManager()
  },

  setupUpdateManager() {
    if (!wx.getUpdateManager) return
    const manager = wx.getUpdateManager()
    manager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，重启后生效',
        success: function (res) {
          if (res.confirm) manager.applyUpdate()
        }
      })
    })
  },

  onError(error) {
    console.error('[app:error]', error)
  },

  onUnhandledRejection(res) {
    console.error('[app:unhandledRejection]', res && res.reason)
  },

  onPageNotFound(res) {
    console.warn('[app:pageNotFound]', res && res.path)
    wx.reLaunch({ url: '/pages/index/index' })
  }
})