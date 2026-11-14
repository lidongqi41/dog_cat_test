const { createPage } = require('../../utils/page')
const auth = require('../../services/auth')
const userService = require('../../services/user')
const avatarUtil = require('../../utils/avatar')
const validate = require('../../utils/validate')

Page(createPage({
  data: {
    userId: '',
    nickname: '',
    avatar: '',
    saving: false
  },

  onLoad() {
    const session = auth.getSession()
    const user = session && session.user
    if (user) {
      this.setData({
        userId: user.id,
        nickname: user.nickname || ''
      })
    }
  },

  onShow() {
    this.loadAvatar()
  },

  async loadAvatar() {
    if (!this.data.userId) return
    const path = await avatarUtil.getPath(this.data.userId)
    this.setData({ avatar: path })
  },

  onNicknameInput(event) {
    this.setData({ nickname: event.detail.value })
  },

  async onChooseAvatar(event) {
    const tempPath = event.detail && event.detail.avatarUrl
    if (!tempPath) return
    if (!this.data.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中', mask: true })
    try {
      const path = await avatarUtil.saveFromTemp(this.data.userId, tempPath)
      this.setData({ avatar: path })
      wx.hideLoading()
      wx.showToast({ title: '头像已更新', icon: 'none' })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  },

  async save() {
    if (this.data.saving) return
    const nickname = String(this.data.nickname || '').trim()
    if (!validate.isNickname(nickname)) {
      wx.showToast({ title: '昵称需要 1-20 个字', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    try {
      const user = await userService.update({ nickname: nickname })
      auth.updateUser(user)
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(function () {
        wx.navigateBack()
      }, 600)
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  }
}))