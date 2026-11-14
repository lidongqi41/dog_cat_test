/**
 * 通用格式化
 */
function pad(value) {
  return value < 10 ? '0' + value : String(value)
}

function formatTime(input, withSeconds) {
  if (!input) return ''
  let date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime()) && typeof input === 'string') {
    date = new Date(input.replace(/-/g, '/'))
  }
  if (isNaN(date.getTime())) return String(input)

  let text = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())

  if (withSeconds) text += ':' + pad(date.getSeconds())
  return text
}

function formatDate(input) {
  const text = formatTime(input)
  return text ? text.slice(0, 10) : ''
}

function truncate(text, max) {
  if (!text) return ''
  const value = String(text)
  const limit = max || 20
  return value.length > limit ? value.slice(0, limit) + '…' : value
}

function splitParagraphs(content) {
  if (!content) return []
  return String(content)
    .split(/\r?\n/)
    .map(function (line) { return line.trim() })
    .filter(function (line) { return line !== '' })
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  truncate: truncate,
  splitParagraphs: splitParagraphs
}