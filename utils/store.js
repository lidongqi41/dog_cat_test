/**
 * 极简全局状态
 */
const state = {
  session: null,
  pendingAnimalFilter: null
}

const listeners = []

function get(key) {
  return key ? state[key] : state
}

function set(key, value) {
  state[key] = value
  listeners.slice().forEach(function (listener) {
    try {
      listener(key, state)
    } catch (error) {
      console.error('[store] listener error:', error)
    }
  })
}

function subscribe(listener) {
  if (typeof listener !== 'function') return function () {}
  listeners.push(listener)
  return function unsubscribe() {
    const index = listeners.indexOf(listener)
    if (index >= 0) listeners.splice(index, 1)
  }
}

module.exports = {
  get: get,
  set: set,
  subscribe: subscribe
}