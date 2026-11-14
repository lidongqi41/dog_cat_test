/**
 * 用户
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')

function me() {
  if (config.mock) return mock.userMe()
  return request.get('/users/me')
}

function update(payload) {
  if (config.mock) return mock.userUpdate(payload)
  return request.put('/users/me', payload)
}

function deleteMe() {
  if (config.mock) return mock.userDelete()
  return request.del('/users/me')
}

module.exports = {
  me: me,
  update: update,
  deleteMe: deleteMe
}