const { createPage } = require('../../utils/page')
const auth = require('../../services/auth')
const userService = require('../../services/user')
const avatarUtil = require('../../utils/avatar')

Page(createPage({
  data: {
    agreed: false,
    submitting: false
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  submit() {
    if (this.data.submitting) return
    if (!this.data.agreed) {
      wx.showToast({ title: '请先确认已了解注销后果', icon: 'none' })
      return
    }

    wx.showModal({
      title: '再次确认',
      content: '注销后账号、收藏、意见反馈将被删除，已审核的领养申请会保留姓名和联系方式用于回访，且无法恢复。确定注销吗？',
      confirmText: '确认注销',
      confirmColor: '#eb5757',
      success: (res) => {
        if (res.confirm) this.doDelete()
      }
    })
  },

  async doDelete() {
    this.setData({ submitting: true })
    wx.showLoading({ title: '处理中', mask: true })

    const session = auth.getSession()
    const userId = session && session.user && session.user.id

    try {
      await userService.deleteMe()
      if (userId) await avatarUtil.remove(userId)
      auth.clearSession()
      wx.hideLoading()
      wx.showToast({ title: '账号已注销', icon: 'none' })
      setTimeout(function () {
        wx.reLaunch({ url: '/pages/index/index' })
      }, 800)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '注销失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
}))