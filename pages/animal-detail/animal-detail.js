const { createPage } = require('../../utils/page')
const animalService = require('../../services/animal')
const favoriteService = require('../../services/favorite')

Page(createPage({
  data: {
    id: '',
    animal: null,
    favorite: false,
    showBack: true,
    showHome: false
  },

  onLoad(query) {
    const id = (query && query.id) || ''
    const pages = getCurrentPages()
    const isEntry = pages.length === 1
    this.setData({
      id: id,
      showBack: !isEntry,
      showHome: isEntry
    })
    this.load()
  },

  onShow() {
    if (this.data.id && this.data.animal) {
      this.syncFavorite()
    }
  },

  async load() {
    this.setLoading(true)
    this.setError('')
    try {
      const animal = await animalService.detail(this.data.id)
      this.setData({ animal: animal })
      this.syncFavorite()
    } catch (error) {
      this.setError(error.message || '加载失败')
    } finally {
      this.setLoading(false)
    }
  },

  async syncFavorite() {
    try {
      const favorite = await favoriteService.isFavorite(this.data.id)
      this.setData({ favorite: favorite })
    } catch (error) {
      // 收藏状态失败不阻塞详情展示
    }
  },

  async toggleFavorite() {
    const favorite = this.data.favorite
    try {
      if (favorite) {
        await favoriteService.remove(this.data.id)
      } else {
        await favoriteService.add(this.data.id)
      }
      this.setData({ favorite: !favorite })
      wx.showToast({ title: favorite ? '已取消收藏' : '已收藏', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  },

  goAdopt() {
    const animal = this.data.animal
    if (!animal || animal.status !== 'available') return
    wx.navigateTo({ url: '/pages/adopt/adopt?animalId=' + animal.id })
  },

  previewCover() {
    const animal = this.data.animal
    if (!animal || !animal.cover) return
    wx.previewImage({ urls: animal.images && animal.images.length ? animal.images : [animal.cover] })
  },

  onShareAppMessage() {
    const animal = this.data.animal
    return {
      title: animal ? animal.name + ' 正在等待领养' : '暖爪 WarmPaws',
      path: '/pages/animal-detail/animal-detail?id=' + this.data.id
    }
  }
}))