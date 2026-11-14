/**
 * 领养申请
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')
const { ADOPTION_STATUS } = require('../config/constants')
const { formatTime } = require('../utils/format')

function decorate(item) {
  if (!item) return item
  const status = ADOPTION_STATUS[item.status] || { label: item.status, color: 'gray' }
  return Object.assign({}, item, {
    statusLabel: status.label,
    statusColor: status.color,
    canWithdraw: item.status === 'pending',
    createdAtText: formatTime(item.createdAt),
    reviewedAtText: formatTime(item.reviewedAt)
  })
}

function create(payload) {
  if (config.mock) {
    return mock.adoptionCreate(payload).then(decorate)
  }
  return request.post('/adoptions', payload).then(decorate)
}

function mine(params) {
  const query = params || {}
  if (config.mock) {
    return mock.adoptionMine(query).then(function (res) {
      return Object.assign({}, res, {
        list: res.list.map(decorate)
      })
    })
  }
  return request.get('/adoptions/mine', query).then(function (res) {
    return Object.assign({}, res, {
      list: (res.list || []).map(decorate)
    })
  })
}

function withdraw(id) {
  if (config.mock) {
    return mock.adoptionWithdraw(id).then(decorate)
  }
  return request.post('/adoptions/' + id + '/withdraw').then(decorate)
}

module.exports = {
  create: create,
  mine: mine,
  withdraw: withdraw,
  decorate: decorate
}