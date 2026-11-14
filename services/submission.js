/**
 * 动物投稿
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')
const { SUBMISSION_STATUS } = require('../config/constants')
const { formatTime } = require('../utils/format')

function decorate(item) {
  if (!item) return item
  const status = SUBMISSION_STATUS[item.status] || { label: item.status, color: 'gray' }
  return Object.assign({}, item, {
    statusLabel: status.label,
    statusColor: status.color,
    typeLabel: item.type === 'cat' ? '猫' : '狗',
    canWithdraw: item.status === 'pending',
    createdAtText: formatTime(item.createdAt),
    reviewedAtText: formatTime(item.reviewedAt)
  })
}

function create(payload) {
  if (config.mock) {
    return mock.submissionCreate(payload).then(decorate)
  }
  return request.post('/submissions', payload).then(decorate)
}

function mine(params) {
  const query = params || {}
  if (config.mock) {
    return mock.submissionMine(query).then(function (res) {
      return Object.assign({}, res, {
        list: res.list.map(decorate)
      })
    })
  }
  return request.get('/submissions/mine', query).then(function (res) {
    return Object.assign({}, res, {
      list: (res.list || []).map(decorate)
    })
  })
}

function withdraw(id) {
  if (config.mock) {
    return mock.submissionWithdraw(id).then(decorate)
  }
  return request.post('/submissions/' + id + '/withdraw').then(decorate)
}

module.exports = {
  create: create,
  mine: mine,
  withdraw: withdraw,
  decorate: decorate
}