/**
 * 协议与配置内容
 */
const config = require('../config/index')
const request = require('../utils/request')
const agreements = require('../config/agreements')

function agreement(type) {
  if (config.mock) {
    return Promise.resolve(agreements[type] || '')
  }
  return request.get('/app/agreements/' + type, {}, { auth: false })
}

function appConfig() {
  if (config.mock) {
    return Promise.resolve({
      version: config.appVersion,
      agreementTypes: Object.keys(agreements)
    })
  }
  return request.get('/app/config', {}, { auth: false })
}

module.exports = {
  agreement: agreement,
  appConfig: appConfig
}