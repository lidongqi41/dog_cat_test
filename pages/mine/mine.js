const { createPage } = require('../../utils/page')
const auth = require('../../services/auth')
const avatarUtil = require('../../utils/avatar')

Page(createPage({
  data: {
    loggedIn: false,
    nickname: '',
    avatar: ''
  },

  onShow() {
    this.refresh()
  },

  async refresh() {
    const session = auth.getSession()
    const user = session && session.user
    const loggedIn = !!(session && session.token)
    this.setData({
      loggedIn: loggedIn,
      nickname: (user && user.nickname) || ''
    })
    if (loggedIn && user) {
      const path = await avatarUtil.getPath(user.id)
      this.setData({ avatar: path })
    } else {
      this.setData({ avatar: '' })
    }
  },

  async login() {
    try {
      await auth.login({ force: true })
      this.refresh()
      wx.showToast({ title: '已登录', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    }
  },

  goProfile() {
    if (!this.data.loggedIn) {
      this.login()
      return
    }
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  goMyAdopt() {
    wx.navigateTo({ url: '/pages/my-adopt/my-adopt' })
  },

  goMySubmit() {
    wx.navigateTo({ url: '/pages/my-submit/my-submit' })
  },

  goFavorite() {
    wx.navigateTo({ url: '/pages/favorite/favorite' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  },

  goSetting() {
    wx.navigateTo({ url: '/pages/setting/setting' })
  }
}))