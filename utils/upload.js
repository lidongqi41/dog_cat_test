/**
 * 图片选择与上传
 *
 * 上传走 wx.uploadFile 到 /api/v1/uploads，后端再写入本地磁盘或 COS。
 * 注意：callContainer 不支持 uploadFile，图片上传必须走 HTTPS 域名。
 */
const config = require('../config/index')
const request = require('./request')

const MAX_SIZE = 5 * 1024 * 1024
const MAX_COUNT = 9

function chooseImages(count) {
  const limit = Math.min(count || MAX_COUNT, MAX_COUNT)
  return new Promise(function (resolve, reject) {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: limit,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          resolve((res.tempFiles || []).map(function (file) {
            return { path: file.tempFilePath, size: file.size || 0 }
          }))
        },
        fail: reject
      })
      return
    }

    wx.chooseImage({
      count: limit,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        resolve((res.tempFilePaths || []).map(function (path) {
          return { path: path, size: 0 }
        }))
      },
      fail: reject
    })
  })
}

function compress(filePath) {
  return new Promise(function (resolve) {
    if (!wx.compressImage) {
      resolve(filePath)
      return
    }
    wx.compressImage({
      src: filePath,
      quality: 70,
      success: function (res) {
        resolve(res.tempFilePath)
      },
      fail: function () {
        resolve(filePath)
      }
    })
  })
}

function uploadOne(filePath, options) {
  const opts = options || {}
  if (config.mock) {
    return Promise.resolve({ url: filePath, key: '' })
  }

  return new Promise(function (resolve, reject) {
    const token = request.getToken()
    const task = wx.uploadFile({
      url: config.apiBase.replace(/\/$/, '') + config.apiPrefix + '/uploads',
      filePath: filePath,
      name: 'file',
      formData: {
        bizType: opts.bizType || 'submission'
      },
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success: function (res) {
        let body = res.data
        try {
          body = JSON.parse(body)
        } catch (error) {
          // 保持原样，下面统一判断
        }
        if (res.statusCode === 401) {
          reject(new Error('登录已过期，请重新进入小程序'))
          return
        }
        if (body && body.code === 0 && body.data) {
          resolve(body.data)
        } else {
          reject(new Error((body && body.message) || '图片上传失败'))
        }
      },
      fail: function (err) {
        reject(new Error((err && err.errMsg) || '图片上传失败'))
      }
    })

    if (task && typeof task.onProgressUpdate === 'function' && typeof opts.onProgress === 'function') {
      task.onProgressUpdate(function (res) {
        opts.onProgress(res.progress)
      })
    }
  })
}

/**
 * 选图 → 压缩 → 逐张上传，返回 URL 数组
 * onProgress(percent, index, total)
 */
async function chooseAndUpload(options) {
  const opts = options || {}
  const files = await chooseImages(opts.count || MAX_COUNT)
  const urls = []

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    if (file.size && file.size > MAX_SIZE) {
      throw new Error('单张图片不能超过 5MB，请重新选择')
    }

    const compressed = await compress(file.path)
    const data = await uploadOne(compressed, {
      bizType: opts.bizType || 'submission',
      onProgress: function (percent) {
        if (typeof opts.onProgress === 'function') {
          opts.onProgress(percent, index, files.length)
        }
      }
    })
    if (data && data.url) urls.push(data.url)
  }

  return urls
}

module.exports = {
  chooseImages: chooseImages,
  uploadOne: uploadOne,
  chooseAndUpload: chooseAndUpload
}