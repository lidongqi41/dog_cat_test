/**
 * Mock 链路冒烟测试（Node 环境）
 *
 * 用法：node scripts/smoke.js
 * 只验证纯逻辑：登录、列表、详情、收藏、申请、撤销、注销、缓存清理。
 */
const assert = require('assert')

const storage = {
  // 冒烟测试固定跑 Mock 分支，避免依赖本地后端
  __use_mock: true
}

global.wx = {
  getAccountInfoSync: function () {
    return { miniProgram: { envVersion: 'develop' } }
  },
  getStorageSync: function (key) {
    return storage[key]
  },
  setStorageSync: function (key, value) {
    storage[key] = value
  },
  removeStorageSync: function (key) {
    delete storage[key]
  },
  getStorageInfoSync: function () {
    return { keys: Object.keys(storage) }
  },
  env: { USER_DATA_PATH: '/tmp' }
}

const mock = require('../utils/mock')
const auth = require('../services/auth')
const homeService = require('../services/home')
const animal = require('../services/animal')
const favorite = require('../services/favorite')
const adoption = require('../services/adoption')
const user = require('../services/user')
const cache = require('../utils/cache')

async function run() {
  // 登录
  const session = await auth.login({ force: true })
  assert(session.token, '登录应返回 token')
  assert(session.user && session.user.id, '登录应返回用户')

  // 首页
  const home = await homeService.getHome()
  assert(home.notices.length === 3, '首页应有 3 条公告')
  assert(home.animals.length === 3, '首页应有 3 只推荐动物')

  // 列表与筛选
  const all = await animal.list({ page: 1, size: 20 })
  assert(all.total === 8, '种子数据应有 8 只动物')
  assert(all.list[0].statusLabel, '列表应带状态文案')

  const cats = await animal.list({ type: 'cat', page: 1, size: 20 })
  assert(cats.total === 4, '猫应有 4 只')

  const keyword = await animal.list({ keyword: '小橘', page: 1, size: 20 })
  assert(keyword.total === 1, '关键词搜索应命中 1 只')

  // 详情
  const detail = await animal.detail('1')
  assert(detail.name === '小橘', '详情名称应为小橘')

  // 收藏
  await favorite.add('1')
  const favorites = await favorite.list()
  assert(favorites.length === 1, '收藏列表应有 1 条')
  assert(await favorite.isFavorite('1'), '收藏状态应为 true')
  await favorite.remove('1')
  assert((await favorite.list()).length === 0, '取消后收藏应为空')

  // 申请
  const created = await adoption.create({
    animalId: '1',
    applicantName: '测试用户',
    phone: '13800000000',
    wechat: 'test-wx',
    housing: '整租一居室',
    experience: '养过一只猫'
  })
  assert(created.status === 'pending', '新申请应为待审核')
  assert(created.applicantName === '测试用户', '申请应保留快照姓名')

  let duplicated = false
  try {
    await adoption.create({
      animalId: '1',
      applicantName: '测试用户',
      phone: '13800000000',
      housing: '整租一居室'
    })
  } catch (error) {
    duplicated = true
  }
  assert(duplicated, '重复申请应被拦截')

  const mine = await adoption.mine({ status: 'all' })
  assert(mine.total === 1, '我的申请应有 1 条')

  await adoption.withdraw(created.id)
  const withdrawn = await adoption.mine({ status: 'withdrawn' })
  assert(withdrawn.total === 1, '撤销后应能按状态查到')

  // 撤销后可重新申请
  const again = await adoption.create({
    animalId: '1',
    applicantName: '测试用户',
    phone: '13800000000',
    housing: '整租一居室'
  })
  assert(again.status === 'pending', '撤销后应允许重新申请')

  // 缓存清理
  cache.set('demo', { value: 1 })
  wx.setStorageSync('wp_session', auth.getSession())
  wx.setStorageSync('wp_avatar', { userId: 'x', path: '/tmp/a.jpg' })
  cache.clearBusiness()
  assert(!wx.getStorageSync('cache:demo'), '业务缓存应被清除')
  assert(wx.getStorageSync('wp_session'), '登录态应保留')
  assert(wx.getStorageSync('wp_avatar'), '头像路径应保留')

  // 注销：待审核删除，已撤销保留快照
  await user.deleteMe()
  auth.clearSession()
  assert(auth.getSession() === null, '注销后会话应清空')

  const db = wx.getStorageSync('mock:db')
  assert(db.user === null, '注销后用户应删除')
  assert(db.adoptions.length === 1, '只应保留已审核的申请')
  assert(db.adoptions[0].userId === null, '保留的申请应与账号脱钩')
  assert(db.adoptions[0].applicantName === '测试用户', '保留的申请应保留姓名')
  assert(db.adoptions[0].phone === '13800000000', '保留的申请应保留联系方式')

  // 重新登录是新账号
  const newSession = await auth.login({ force: true })
  assert(newSession.user.id !== session.user.id, '重新登录应创建新账号')
  const empty = await adoption.mine({ status: 'all' })
  assert(empty.total === 0, '新账号看不到旧申请')

  console.log('冒烟测试通过：登录、首页、列表、详情、收藏、申请、撤销、注销、缓存清理均正常。')
}

run().catch(function (error) {
  console.error('冒烟测试失败：', error)
  process.exit(1)
})
