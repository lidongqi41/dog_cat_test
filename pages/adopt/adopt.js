const { createPage } = require('../../utils/page')
const animalService = require('../../services/animal')
const adoptionService = require('../../services/adoption')
const validate = require('../../utils/validate')

Page(createPage({
  data: {
    animalId: '',
    animal: null,
    applicantName: '',
    phone: '',
    wechat: '',
    housing: '',
    experience: '',
    agreed: false,
    submitting: false
  },

  onLoad(query) {
    this.setData({ animalId: (query && query.animalId) || '' })
    this.loadAnimal()
  },

  async loadAnimal() {
    this.setLoading(true)
    this.setError('')
    try {
      const animal = await animalService.detail(this.data.animalId)
      this.setData({ animal: animal })
    } catch (error) {
      this.setError(error.message || '加载失败')
    } finally {
      this.setLoading(false)
    }
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    const patch = {}
    patch[field] = event.detail.value
    this.setData(patch)
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  openRule() {
    wx.navigateTo({ url: '/pages/doc/doc?type=adopt-rule' })
  },

  validateForm() {
    if (!validate.isNotEmpty(this.data.applicantName)) {
      return '请填写称呼'
    }
    if (!this.data.phone && !this.data.wechat) {
      return '手机号和微信号至少填一个'
    }
    if (this.data.phone && !validate.isPhone(this.data.phone)) {
      return '手机号格式不正确'
    }
    if (!validate.isNotEmpty(this.data.housing)) {
      return '请填写居住情况'
    }
    if (!this.data.agreed) {
      return '请先阅读并同意领养须知'
    }
    return ''
  },

  async submit() {
    if (this.data.submitting) return
    if (!this.data.animal || this.data.animal.status !== 'available') {
      wx.showToast({ title: '这只动物当前不可申请', icon: 'none' })
      return
    }

    const message = this.validateForm()
    if (message) {
      wx.showToast({ title: message, icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中', mask: true })
    try {
      await adoptionService.create({
        animalId: this.data.animalId,
        applicantName: this.data.applicantName,
        phone: this.data.phone,
        wechat: this.data.wechat,
        housing: this.data.housing,
        experience: this.data.experience
      })
      wx.hideLoading()
      wx.showToast({ title: '申请已提交', icon: 'success' })
      setTimeout(function () {
        wx.redirectTo({ url: '/pages/my-adopt/my-adopt' })
      }, 800)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
}))