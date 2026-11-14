/**
 * 收藏
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')
const animalService = require('./animal')

function list() {
  if (config.mock) {
    return mock.favoriteList().then(function (list) {
      return list.map(animalService.decorate)
    })
  }
  return request.get('/favorites').then(function (list) {
    return (list || []).map(animalService.decorate)
  })
}

function add(animalId) {
  if (config.mock) return mock.favoriteAdd(animalId)
  return request.post('/favorites', { animalId: animalId })
}

function remove(animalId) {
  if (config.mock) return mock.favoriteRemove(animalId)
  return request.del('/favorites/' + animalId)
}

function isFavorite(animalId) {
  if (config.mock) return mock.favoriteIs(animalId)
  return request.get('/favorites/' + animalId + '/status')
}

module.exports = {
  list: list,
  add: add,
  remove: remove,
  isFavorite: isFavorite
}