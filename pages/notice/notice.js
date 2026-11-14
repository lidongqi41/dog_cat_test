const { createPage } = require('../../utils/page')
const noticeService = require('../../services/notice')

Page(createPage({
  data: {
    id: '',
    notice: null,
    showBack: true,
    showHome: false
  },

  onLoad(query) {
    const pages = getCurrentPages()
    const isEntry = pages.length === 1
    this.setData({
      id: (query && query.id) || '',
      showBack: !isEntry,
      showHome: isEntry
    })
    this.load()
  },

  async load() {
    this.setLoading(true)
    this.setError('')
    try {
      const notice = await noticeService.detail(this.data.id)
      this.setData({ notice: notice })
    } catch (error) {
      this.setError(error.message || '加载失败')
    } finally {
      this.setLoading(false)
    }
  },

  onShareAppMessage() {
    const notice = this.data.notice
    return {
      title: notice ? notice.title : '暖爪 WarmPaws 公告',
      path: '/pages/notice/notice?id=' + this.data.id
    }
  }
}))