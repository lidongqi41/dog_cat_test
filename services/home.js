/**
 * 首页与健康检查
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')

function getHome() {
  if (config.mock) return mock.home()
  return request.get('/home')
}

function health() {
  if (config.mock) return mock.health()
  return request.get('/health', {}, { auth: false, showError: false, retry: 1 })
}

module.exports = {
  getHome: getHome,
  health: health
}