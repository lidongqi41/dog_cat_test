// index.js
Page({
  data: {
    version: 'v0.1.1'
  },

  /**
   * 跳转到示例页，演示 wx.navigateTo 传参
   */
  goDemo() {
    wx.navigateTo({
      url: '/pages/demo/demo?from=index'
    })
  }
})