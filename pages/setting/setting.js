const { createPage } = require('../../utils/page')
const config = require('../../config/index')
const cache = require('../../utils/cache')
const { DOC_TYPES } = require('../../config/constants')

Page(createPage({
  data: {
    version: config.appVersion,
    envName: config.name,
    docs: Object.keys(DOC_TYPES).map(function (key) {
      return { type: key, label: DOC_TYPES[key] }
    })
  },

  openDoc(event) {
    wx.navigateTo({
      url: '/pages/doc/doc?type=' + event.currentTarget.dataset.type
    })
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清除列表等业务缓存，登录状态和头像不受影响。',
      success: (res) => {
        if (!res.confirm) return
        cache.clearBusiness()
        wx.showToast({ title: '已清除缓存', icon: 'none' })
      }
    })
  },

  goCancel() {
    wx.navigateTo({ url: '/pages/cancel/cancel' })
  },

  about() {
    wx.showModal({
      title: '关于暖爪 WarmPaws',
      content: '流浪动物救助信息与领养申请平台。当前版本 ' + config.appVersion + '（' + config.name + '）。平台不收取任何领养费用。',
      showCancel: false
    })
  }
}))