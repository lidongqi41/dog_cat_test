const { createPage } = require('../../utils/page')
const homeService = require('../../services/home')
const animalService = require('../../services/animal')
const store = require('../../utils/store')
const { formatDate } = require('../../utils/format')

Page(createPage({
  data: {
    notices: [],
    animals: [],
    quickFilters: [
      { key: 'cat', label: '猫', type: 'cat', status: 'all' },
      { key: 'dog', label: '狗', type: 'dog', status: 'all' },
      { key: 'available', label: '待领养', type: 'all', status: 'available' },
      { key: 'adopted', label: '已领养', type: 'all', status: 'adopted' }
    ]
  },

  onShow() {
    this.load()
  },

  async load() {
    if (this.data.loading) return
    this.setLoading(true)
    this.setError('')
    try {
      const res = await homeService.getHome()
      const animals = (res.animals || []).map(animalService.decorate)
      const notices = (res.notices || []).map(function (item) {
        return Object.assign({}, item, { timeText: formatDate(item.publishedAt) })
      })
      this.setData({ notices: notices, animals: animals })
      this.setEmpty(animals.length === 0)
    } catch (error) {
      this.setError(error.message || '加载失败')
    } finally {
      this.setLoading(false)
    }
  },

  goNotice(event) {
    wx.navigateTo({ url: '/pages/notice/notice?id=' + event.currentTarget.dataset.id })
  },

  goAnimal(event) {
    wx.navigateTo({ url: '/pages/animal-detail/animal-detail?id=' + event.currentTarget.dataset.id })
  },

  quickFilter(event) {
    store.set('pendingAnimalFilter', {
      type: event.currentTarget.dataset.type,
      status: event.currentTarget.dataset.status
    })
    wx.switchTab({ url: '/pages/animal/animal' })
  },

  goSubmit() {
    wx.navigateTo({ url: '/pages/submit/submit' })
  },

  goAllAnimals() {
    store.set('pendingAnimalFilter', { type: 'all', status: 'all' })
    wx.switchTab({ url: '/pages/animal/animal' })
  }
}))