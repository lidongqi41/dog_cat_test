/**
 * 表单校验
 */
function isNotEmpty(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function isPhone(value) {
  return /^1[3-9]\d{9}$/.test(String(value || ''))
}

function isNickname(value) {
  const text = String(value || '').trim()
  return text.length >= 1 && text.length <= 20
}

function isTextLength(value, min, max) {
  const length = String(value || '').trim().length
  return length >= min && length <= max
}

module.exports = {
  isNotEmpty: isNotEmpty,
  isPhone: isPhone,
  isNickname: isNickname,
  isTextLength: isTextLength
}