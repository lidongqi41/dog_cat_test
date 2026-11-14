const { createPage } = require('../../utils/page')
const favoriteService = require('../../services/favorite')

Page(createPage({
  data: {
    list: []
  },

  onShow() {
    this.load()
  },

  async load() {
    this.setLoading(true)
    this.setError('')
    try {
      const list = await favoriteService.list()
      this.setData({ list: list })
      this.setEmpty(list.length === 0)
    } catch (error) {
      this.setError(error.message || '加载失败')
    } finally {
      this.setLoading(false)
    }
  },

  goDetail(event) {
    wx.navigateTo({
      url: '/pages/animal-detail/animal-detail?id=' + event.currentTarget.dataset.id
    })
  },

  async remove(event) {
    const id = event.currentTarget.dataset.id
    try {
      await favoriteService.remove(id)
      const list = this.data.list.filter(function (item) { return item.id !== id })
      this.setData({ list: list })
      this.setEmpty(list.length === 0)
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  }
}))