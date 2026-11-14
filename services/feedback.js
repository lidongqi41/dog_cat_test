/**
 * 意见反馈
 */
const config = require('../config/index')
const request = require('../utils/request')
const mock = require('../utils/mock')

function submit(payload) {
  if (config.mock) return mock.feedbackSubmit(payload)
  return request.post('/feedback', payload)
}

module.exports = {
  submit: submit
}