const { createPage } = require('../../utils/page')
const upload = require('../../utils/upload')
const submissionService = require('../../services/submission')
const validate = require('../../utils/validate')

Page(createPage({
  data: {
    type: 'cat',
    gender: 'female',
    name: '',
    age: '',
    breed: '',
    sterilized: false,
    vaccinated: true,
    health: '',
    location: '',
    story: '',
    images: [],
    contactName: '',
    phone: '',
    wechat: '',
    agreed: false,
    uploading: false,
    submitting: false
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    const patch = {}
    patch[field] = event.detail.value
    this.setData(patch)
  },

  onTypeChange(event) {
    this.setData({ type: event.currentTarget.dataset.value })
  },

  onGenderChange(event) {
    this.setData({ gender: event.currentTarget.dataset.value })
  },

  toggleSterilized() {
    this.setData({ sterilized: !this.data.sterilized })
  },

  toggleVaccinated() {
    this.setData({ vaccinated: !this.data.vaccinated })
  },

  toggleAgreed() {
    this.setData({ agreed: !this.data.agreed })
  },

  async addImages() {
    if (this.data.uploading) return
    const remain = 9 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多 9 张照片', icon: 'none' })
      return
    }

    this.setData({ uploading: true })
    try {
      const urls = await upload.chooseAndUpload({
        count: remain,
        bizType: 'submission'
      })
      this.setData({
        images: this.data.images.concat(urls).slice(0, 9)
      })
    } catch (error) {
      if (error && error.errMsg && error.errMsg.indexOf('cancel') >= 0) return
      wx.showToast({ title: (error && error.message) || '图片上传失败', icon: 'none' })
    } finally {
      this.setData({ uploading: false })
    }
  },

  removeImage(event) {
    const index = Number(event.currentTarget.dataset.index)
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images: images })
  },

  previewImage(event) {
    wx.previewImage({
      current: this.data.images[event.currentTarget.dataset.index],
      urls: this.data.images
    })
  },

  validateForm() {
    const name = this.data.name.trim()
    const age = this.data.age.trim()
    const location = this.data.location.trim()
    const story = this.data.story.trim()
    const contactName = this.data.contactName.trim()
    const phone = this.data.phone.trim()
    const wechat = this.data.wechat.trim()

    if (!validate.isTextLength(name, 1, 20)) return '请填写名字（1-20 字）'
    if (!age) return '请填写年龄'
    if (!location) return '请填写所在地'
    if (!validate.isTextLength(story, 10, 500)) return '救助故事需要 10-500 字'
    if (!this.data.images.length) return '请至少上传一张照片'
    if (!validate.isTextLength(contactName, 1, 20)) return '请填写称呼'

    if (!phone && !wechat) return '手机号和微信号至少填一个'
    if (phone && !validate.isPhone(phone)) return '手机号格式不正确'
    if (!this.data.agreed) return '请先确认信息真实并同意使用照片'

    return ''
  },

  async submit() {
    if (this.data.submitting) return
    if (this.data.uploading) {
      wx.showToast({ title: '图片上传中，请稍候', icon: 'none' })
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
      await submissionService.create({
        type: this.data.type,
        name: this.data.name.trim(),
        gender: this.data.gender,
        age: this.data.age.trim(),
        breed: this.data.breed.trim(),
        sterilized: this.data.sterilized,
        vaccinated: this.data.vaccinated,
        health: this.data.health.trim(),
        location: this.data.location.trim(),
        story: this.data.story.trim(),
        images: this.data.images,
        contactName: this.data.contactName.trim(),
        phone: this.data.phone.trim(),
        wechat: this.data.wechat.trim()
      })
      wx.hideLoading()
      wx.showToast({ title: '投稿已提交', icon: 'success' })
      setTimeout(function () {
        wx.redirectTo({ url: '/pages/my-submit/my-submit' })
      }, 800)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
}))