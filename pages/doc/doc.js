const { createPage } = require('../../utils/page')
const contentService = require('../../services/content')
const { DOC_TYPES } = require('../../config/constants')
const { splitParagraphs } = require('../../utils/format')

Page(createPage({
  data: {
    type: '',
    title: '',
    paragraphs: []
  },

  onLoad(query) {
    const type = (query && query.type) || 'agreement'
    this.setData({
      type: type,
      title: DOC_TYPES[type] || '协议'
    })
    this.load()
  },

  async load() {
    this.setLoading(true)
    this.setError('')
    try {
      const content = await contentService.agreement(this.data.type)
      this.setData({ paragraphs: splitParagraphs(content) })
    } catch (error) {
      this.setError(error.message || '加载失败')
    } finally {
      this.setLoading(false)
    }
  }
}))