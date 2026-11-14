const { createPage } = require('../../utils/page')
const animalService = require('../../services/animal')
const store = require('../../utils/store')
const { ANIMAL_TYPE_OPTIONS, ANIMAL_STATUS_OPTIONS } = require('../../config/constants')

Page(createPage({
  data: {
    keyword: '',
    typeOptions: ANIMAL_TYPE_OPTIONS,
    statusOptions: ANIMAL_STATUS_OPTIONS,
    type: 'all',
    status: 'all',
    list: [],
    page: 1,
    size: 10,
    hasMore: true,
    total: 0,
    refreshing: false
  },

  onShow() {
    const pending = store.get('pendingAnimalFilter')
    if (pending) {
      store.set('pendingAnimalFilter', null)
      this.setData({
        type: pending.type || 'all',
        status: pending.status || 'all',
        keyword: ''
      })
      this.load(true)
      return
    }

    if (!this.loaded) {
      this.load(true)
    }
  },

  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value })
  },

  onSearch() {
    this.load(true)
  },

  clearKeyword() {
    this.setData({ keyword: '' })
    this.load(true)
  },

  onTypeChange(event) {
    this.setData({ type: event.currentTarget.dataset.value })
    this.load(true)
  },

  onStatusChange(event) {
    this.setData({ status: event.currentTarget.dataset.value })
    this.load(true)
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.load(false)
  },

  onRefresh() {
    if (this.data.loading) {
      this.setData({ refreshing: false })
      return
    }
    this.setData({ refreshing: true })
    this.load(true)
  },

  async load(reset) {
    if (this.data.loading) return

    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true, error: '' })

    try {
      const res = await animalService.list({
        type: this.data.type,
        status: this.data.status,
        keyword: this.data.keyword,
        page: page,
        size: this.data.size
      })

      const list = reset ? res.list : this.data.list.concat(res.list)
      this.loaded = true
      this.setData({
        list: list,
        page: page,
        hasMore: !!res.hasMore,
        total: res.total || list.length,
        empty: list.length === 0
      })
    } catch (error) {
      this.setData({ error: error.message || '加载失败' })
    } finally {
      this.setData({ loading: false, refreshing: false })
    }
  }
}))