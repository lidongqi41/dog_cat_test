// demo.js
Page({
  data: {
    from: ''
  },

  onLoad(options) {
    this.setData({
      from: options.from || '未知来源'
    })
  }
})