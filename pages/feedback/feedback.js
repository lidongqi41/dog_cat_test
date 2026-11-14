const { createPage } = require('../../utils/page')
const feedbackService = require('../../services/feedback')
const validate = require('../../utils/validate')

Page(createPage({
  data: {
    content: '',
    contact: '',
    submitting: false
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    const patch = {}
    patch[field] = event.detail.value
    this.setData(patch)
  },

  async submit() {
    if (this.data.submitting) return
    const content = String(this.data.content || '').trim()
    if (!validate.isTextLength(content, 5, 500)) {
      wx.showToast({ title: '反馈内容需要 5-500 字', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      await feedbackService.submit({
        content: content,
        contact: String(this.data.contact || '').trim()
      })
      this.setData({ content: '', contact: '' })
      wx.showToast({ title: '感谢你的反馈', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
}))