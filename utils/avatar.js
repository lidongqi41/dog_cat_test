/**
 * 本地头像
 *
 * 用户通过 chooseAvatar 选择自己的微信头像，压缩后保存到本机用户目录，
 * 不上传服务器。换设备、清除微信存储或卸载后失效，自动回退文字头像。
 */
const config = require('../config/index')

function readRecord() {
  try {
    return wx.getStorageSync(config.storageKeys.avatar) || null
  } catch (error) {
    return null
  }
}

function writeRecord(record) {
  try {
    wx.setStorageSync(config.storageKeys.avatar, record)
  } catch (error) {
    console.error('[avatar] 写入失败:', error)
  }
}

function removeRecord() {
  try {
    wx.removeStorageSync(config.storageKeys.avatar)
  } catch (error) {
    // 忽略
  }
}

function access(path) {
  return new Promise(function (resolve) {
    try {
      wx.getFileSystemManager().access({
        path: path,
        success: function () { resolve(true) },
        fail: function () { resolve(false) }
      })
    } catch (error) {
      resolve(false)
    }
  })
}

async function getPath(userId) {
  const record = readRecord()
  if (!record || !record.path) return ''
  if (userId && record.userId !== userId) return ''
  const exists = await access(record.path)
  if (!exists) {
    removeRecord()
    return ''
  }
  return record.path
}

function compress(src) {
  return new Promise(function (resolve) {
    if (!wx.compressImage) {
      resolve(src)
      return
    }
    wx.compressImage({
      src: src,
      quality: 70,
      success: function (res) {
        resolve(res.tempFilePath)
      },
      fail: function () {
        resolve(src)
      }
    })
  })
}

function unlink(path) {
  return new Promise(function (resolve) {
    try {
      wx.getFileSystemManager().unlink({
        filePath: path,
        success: function () { resolve(true) },
        fail: function () { resolve(false) }
      })
    } catch (error) {
      resolve(false)
    }
  })
}

function saveFile(tempFilePath, filePath) {
  return new Promise(function (resolve, reject) {
    try {
      wx.getFileSystemManager().saveFile({
        tempFilePath: tempFilePath,
        filePath: filePath,
        success: function (res) {
          resolve(res.savedFilePath || filePath)
        },
        fail: reject
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function saveFromTemp(userId, tempFilePath) {
  const compressed = await compress(tempFilePath)
  const target = wx.env.USER_DATA_PATH + '/avatar_' + userId + '.jpg'
  await unlink(target)
  const savedPath = await saveFile(compressed, target)
  writeRecord({ userId: userId, path: savedPath })
  return savedPath
}

async function remove(userId) {
  const record = readRecord()
  if (record && record.path && (!userId || record.userId === userId)) {
    await unlink(record.path)
  }
  removeRecord()
}

module.exports = {
  getPath: getPath,
  saveFromTemp: saveFromTemp,
  remove: remove
}