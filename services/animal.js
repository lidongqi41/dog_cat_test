/**
 * 动物档案
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')
const { ANIMAL_STATUS } = require('../config/constants')

function decorate(item) {
  if (!item) return item
  const status = ANIMAL_STATUS[item.status] || { label: item.status, color: 'gray' }
  return Object.assign({}, item, {
    statusLabel: status.label,
    statusColor: status.color,
    typeLabel: item.type === 'cat' ? '猫' : '狗',
    genderLabel: item.gender === 'male' ? '男孩' : '女孩',
    cover: item.cover || ''
  })
}

function list(params) {
  const query = params || {}
  if (config.mock) {
    return mock.animalList(query).then(function (res) {
      return Object.assign({}, res, {
        list: res.list.map(decorate)
      })
    })
  }
  return request.get('/animals', query).then(function (res) {
    return Object.assign({}, res, {
      list: (res.list || []).map(decorate)
    })
  })
}

function detail(id) {
  if (config.mock) {
    return mock.animalDetail(id).then(decorate)
  }
  return request.get('/animals/' + id).then(decorate)
}

module.exports = {
  list: list,
  detail: detail,
  decorate: decorate
}