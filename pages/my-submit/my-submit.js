const { createPage } = require('../../utils/page')
const submissionService = require('../../services/submission')
const { SUBMISSION_TABS } = require('../../config/constants')

Page(createPage({
  data: {
    tabs: SUBMISSION_TABS,
    status: 'all',
    list: [],
    page: 1,
    size: 10,
    hasMore: true,
    withdrawingId: ''
  },

  onShow() {
    this.load(true)
  },

  onTabChange(event) {
    this.setData({ status: event.currentTarget.dataset.value })
    this.load(true)
  },

  async load(reset) {
    if (this.data.loading) return
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true, error: '' })
    try {
      const res = await submissionService.mine({
        status: this.data.status,
        page: page,
        size: this.data.size
      })
      const list = reset ? res.list : this.data.list.concat(res.list)
      this.setData({
        list: list,
        page: page,
        hasMore: !!res.hasMore,
        empty: list.length === 0
      })
    } catch (error) {
      this.setData({ error: error.message || '加载失败' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.load(false)
  },

  goAnimal(event) {
    wx.navigateTo({
      url: '/pages/animal-detail/animal-detail?id=' + event.currentTarget.dataset.id
    })
  },

  previewImage(event) {
    const url = event.currentTarget.dataset.url
    if (url) wx.previewImage({ urls: [url] })
  },

  withdraw(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '撤回投稿',
      content: '撤回后需要重新提交，确定撤回吗？',
      success: (res) => {
        if (!res.confirm) return
        this.doWithdraw(id)
      }
    })
  },

  async doWithdraw(id) {
    if (this.data.withdrawingId) return
    this.setData({ withdrawingId: id })
    try {
      await submissionService.withdraw(id)
      wx.showToast({ title: '已撤回', icon: 'none' })
      this.load(true)
    } catch (error) {
      wx.showToast({ title: error.message || '撤回失败', icon: 'none' })
    } finally {
      this.setData({ withdrawingId: '' })
    }
  }
}))