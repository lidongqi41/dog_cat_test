/**
 * 公告
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')
const { formatTime, splitParagraphs } = require('../utils/format')

function decorate(item) {
  if (!item) return item
  return Object.assign({}, item, {
    publishedAtText: formatTime(item.publishedAt),
    paragraphs: splitParagraphs(item.content)
  })
}

function detail(id) {
  if (config.mock) {
    return mock.noticeDetail(id).then(decorate)
  }
  return request.get('/notices/' + id).then(decorate)
}

module.exports = {
  detail: detail,
  decorate: decorate
}