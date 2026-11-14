/**
 * Mock 数据与接口实现
 *
 * 数据落在 storage（key: mock:db），清业务缓存不会清掉它，
 * 方便开发期跨页面、跨启动演示。切到真实后端后整个文件不再被调用。
 */
const DB_KEY = 'mock:db'

function now() {
  const date = new Date()
  function pad(value) { return value < 10 ? '0' + value : String(value) }
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
}

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

function seed() {
  return {
    user: null,
    animals: [
      {
        id: '1',
        name: '小橘',
        type: 'cat',
        gender: 'male',
        age: '1 岁',
        breed: '中华田园猫',
        sterilized: true,
        vaccinated: true,
        health: '健康，已完成驱虫',
        location: '东城区 · 幸福里小区',
        status: 'available',
        cover: '',
        images: [],
        story: '在小区车棚被发现时只有巴掌大，被救助人带回家养了一个月，现在亲人不怕生，会主动蹭手。',
        tags: ['亲人', '已绝育', '会用猫砂']
      },
      {
        id: '2',
        name: '煤球',
        type: 'cat',
        gender: 'female',
        age: '2 岁',
        breed: '玳瑁猫',
        sterilized: true,
        vaccinated: true,
        health: '健康',
        location: '西城区 · 救助站',
        status: 'available',
        cover: '',
        images: [],
        story: '性格安静，喜欢趴在窗台晒太阳。前主人搬家无法带走，送到救助站后一直等待新家。',
        tags: ['安静', '已绝育']
      },
      {
        id: '3',
        name: '阿黄',
        type: 'dog',
        gender: 'male',
        age: '3 岁',
        breed: '中华田园犬',
        sterilized: true,
        vaccinated: true,
        health: '健康，轻微牙结石',
        location: '朝阳区 · 救助站',
        status: 'available',
        cover: '',
        images: [],
        story: '在工地附近流浪了半年，性格温顺，会坐下和握手，牵绳走路很稳。',
        tags: ['温顺', '会握手', '已绝育']
      },
      {
        id: '4',
        name: '豆豆',
        type: 'dog',
        gender: 'female',
        age: '1 岁',
        breed: '柯基串',
        sterilized: false,
        vaccinated: true,
        health: '健康',
        location: '海淀区 · 临时寄养家庭',
        status: 'available',
        cover: '',
        images: [],
        story: '精力旺盛，喜欢玩球，适合有院子或每天能遛狗的家庭。',
        tags: ['活泼', '亲人']
      },
      {
        id: '5',
        name: '大花',
        type: 'cat',
        gender: 'female',
        age: '4 岁',
        breed: '三花猫',
        sterilized: true,
        vaccinated: true,
        health: '健康',
        location: '东城区 · 幸福里小区',
        status: 'adopted',
        cover: '',
        images: [],
        story: '已经被一位独居老人领养，生活稳定。',
        tags: ['已领养']
      },
      {
        id: '6',
        name: '黑豹',
        type: 'dog',
        gender: 'male',
        age: '2 岁',
        breed: '拉布拉多串',
        sterilized: true,
        vaccinated: true,
        health: '健康',
        location: '丰台区 · 救助站',
        status: 'pending',
        cover: '',
        images: [],
        story: '性格稳重，正在审核一位申请人的领养资格。',
        tags: ['稳重']
      },
      {
        id: '7',
        name: '奶糖',
        type: 'cat',
        gender: 'female',
        age: '6 个月',
        breed: '白猫',
        sterilized: false,
        vaccinated: true,
        health: '健康，待绝育',
        location: '西城区 · 救助站',
        status: 'available',
        cover: '',
        images: [],
        story: '同窝三只里最瘦小的一只，现在已经能吃能玩，等待一个耐心的家。',
        tags: ['幼猫', '亲人']
      },
      {
        id: '8',
        name: '旺财',
        type: 'dog',
        gender: 'male',
        age: '5 岁',
        breed: '柴犬串',
        sterilized: true,
        vaccinated: true,
        health: '健康',
        location: '通州区 · 救助站',
        status: 'available',
        cover: '',
        images: [],
        story: '被遗弃在公园门口，等了两周没有主人认领。性格独立但不咬人。',
        tags: ['独立', '已绝育']
      }
    ],
    notices: [
      {
        id: 'n1',
        title: '暖爪 WarmPaws 试运行公告',
        publishedAt: '2026-11-01 10:00:00',
        content: [
          '暖爪 WarmPaws 小程序开始试运行。',
          '',
          '当前提供流浪动物档案浏览、领养申请提交与进度查询三项服务。',
          '',
          '试运行期间，动物信息由合作救助站与管理员录入，如发现信息有误，请通过意见反馈告诉我们。'
        ].join('\n')
      },
      {
        id: 'n2',
        title: '领养流程与回访说明',
        publishedAt: '2026-10-28 09:30:00',
        content: [
          '领养流程：提交申请 → 平台审核 → 工作人员联系 → 线下见面 → 交接 → 回访。',
          '',
          '审核一般在 3 个工作日内完成，结果可在「我的 - 我的申请」中查看。',
          '',
          '平台不收取任何领养费用。'
        ].join('\n')
      },
      {
        id: 'n3',
        title: '合作救助站招募说明',
        publishedAt: '2026-10-20 15:00:00',
        content: [
          '我们正在招募合作救助站，为流浪动物提供档案录入与领养对接支持。',
          '',
          '合作不涉及资金往来，平台仅提供信息展示与申请管理工具。',
          '',
          '有意向的救助组织可通过意见反馈留下联系方式。'
        ].join('\n')
      }
    ],
    favorites: [],
    adoptions: [],
    submissions: [],
    feedbacks: []
  }
}

function load() {
  try {
    const db = wx.getStorageSync(DB_KEY)
    if (db && db.animals) return db
  } catch (error) {
    // 忽略，走 seed
  }
  const db = seed()
  save(db)
  return db
}

function save(db) {
  try {
    wx.setStorageSync(DB_KEY, db)
  } catch (error) {
    console.error('[mock] 保存失败:', error)
  }
}

function requireUser(db) {
  if (!db.user) {
    const error = new Error('请先登录')
    error.code = 401
    throw error
  }
  return db.user
}

function login() {
  return delay(120).then(function () {
    const db = load()
    if (!db.user) {
      db.user = {
        id: 'u' + Date.now(),
        openid: 'mock-openid',
        nickname: '微信用户',
        role: 'USER'
      }
      save(db)
    }
    return {
      token: 'mock-token-' + db.user.id,
      expiresIn: 7200,
      user: db.user
    }
  })
}

function health() {
  return delay(100).then(function () {
    return { status: 'UP', service: 'mock', version: 'mock' }
  })
}

function home() {
  return delay(120).then(function () {
    const db = load()
    return {
      notices: db.notices.slice(0, 3),
      animals: db.animals.filter(function (item) {
        return item.status === 'available'
      }).slice(0, 3)
    }
  })
}

function animalList(params) {
  const query = params || {}
  return delay(120).then(function () {
    const db = load()
    const type = query.type || 'all'
    const status = query.status || 'all'
    const keyword = String(query.keyword || '').trim()
    const page = Number(query.page) || 1
    const size = Number(query.size) || 10

    let list = db.animals.slice()
    if (type !== 'all') {
      list = list.filter(function (item) { return item.type === type })
    }
    if (status !== 'all') {
      list = list.filter(function (item) { return item.status === status })
    }
    if (keyword) {
      list = list.filter(function (item) {
        return [item.name, item.breed, item.story, item.location].join(' ').indexOf(keyword) >= 0
      })
    }

    const total = list.length
    const start = (page - 1) * size
    const slice = list.slice(start, start + size)

    return {
      list: slice,
      total: total,
      page: page,
      size: size,
      hasMore: start + slice.length < total
    }
  })
}

function animalDetail(id) {
  return delay(100).then(function () {
    const db = load()
    const item = db.animals.filter(function (animal) { return animal.id === String(id) })[0]
    if (!item) throw new Error('动物不存在或已下架')
    return item
  })
}

function favoriteList() {
  return delay(100).then(function () {
    const db = load()
    return db.favorites.map(function (id) {
      return db.animals.filter(function (animal) { return animal.id === id })[0]
    }).filter(Boolean)
  })
}

function favoriteAdd(animalId) {
  return delay(80).then(function () {
    const db = load()
    const id = String(animalId)
    if (db.favorites.indexOf(id) < 0) {
      db.favorites.push(id)
      save(db)
    }
    return true
  })
}

function favoriteRemove(animalId) {
  return delay(80).then(function () {
    const db = load()
    const id = String(animalId)
    db.favorites = db.favorites.filter(function (item) { return item !== id })
    save(db)
    return true
  })
}

function favoriteIs(animalId) {
  return delay(40).then(function () {
    const db = load()
    return db.favorites.indexOf(String(animalId)) >= 0
  })
}

function adoptionCreate(payload) {
  const data = payload || {}
  return delay(150).then(function () {
    const db = load()
    const user = requireUser(db)
    const animal = db.animals.filter(function (item) {
      return item.id === String(data.animalId)
    })[0]
    if (!animal) throw new Error('动物不存在或已下架')
    if (animal.status !== 'available') throw new Error('这只动物当前不可申请')

    const duplicated = db.adoptions.some(function (item) {
      return item.userId === user.id && item.animalId === animal.id && item.status === 'pending'
    })
    if (duplicated) throw new Error('你已经提交过申请，请等待审核')

    const record = {
      id: 'a' + Date.now(),
      animalId: animal.id,
      animalName: animal.name,
      animalType: animal.type,
      userId: user.id,
      applicantName: data.applicantName,
      phone: data.phone,
      wechat: data.wechat,
      housing: data.housing,
      experience: data.experience,
      status: 'pending',
      createdAt: now(),
      reviewedAt: '',
      remark: ''
    }
    db.adoptions.unshift(record)
    save(db)
    return record
  })
}

function adoptionMine(params) {
  const query = params || {}
  return delay(120).then(function () {
    const db = load()
    const user = requireUser(db)
    const status = query.status || 'all'
    const page = Number(query.page) || 1
    const size = Number(query.size) || 10

    let list = db.adoptions.filter(function (item) {
      return item.userId === user.id
    })
    if (status !== 'all') {
      list = list.filter(function (item) { return item.status === status })
    }

    const total = list.length
    const start = (page - 1) * size
    const slice = list.slice(start, start + size)
    return {
      list: slice,
      total: total,
      page: page,
      size: size,
      hasMore: start + slice.length < total
    }
  })
}

function adoptionWithdraw(id) {
  return delay(120).then(function () {
    const db = load()
    const user = requireUser(db)
    const record = db.adoptions.filter(function (item) { return item.id === String(id) })[0]
    if (!record || record.userId !== user.id) throw new Error('申请不存在')
    if (record.status !== 'pending') throw new Error('只有待审核的申请可以撤销')

    record.status = 'withdrawn'
    record.reviewedAt = now()
    record.remark = '用户主动撤销'
    save(db)
    return record
  })
}

function userMe() {
  return delay(60).then(function () {
    const db = load()
    return requireUser(db)
  })
}

function userUpdate(payload) {
  return delay(100).then(function () {
    const db = load()
    const user = requireUser(db)
    user.nickname = payload.nickname
    save(db)
    return user
  })
}

function userDelete() {
  return delay(200).then(function () {
    const db = load()
    const user = requireUser(db)
    const uid = user.id

    db.adoptions = db.adoptions.filter(function (item) {
      if (item.userId !== uid) return true
      // 待审核：注销即放弃，直接删除
      if (item.status === 'pending') return false
      // 已审核：保留快照（含姓名、联系方式），与账号脱钩
      item.userId = null
      return true
    })
    db.favorites = []
    db.feedbacks = []
    db.submissions = (db.submissions || []).filter(function (item) {
      if (item.userId !== uid) return true
      if (item.status === 'pending' || item.status === 'rejected' || item.status === 'withdrawn') return false
      item.userId = null
      return true
    })
    db.user = null
    save(db)
    return true
  })
}

function noticeDetail(id) {
  return delay(80).then(function () {
    const db = load()
    const item = db.notices.filter(function (notice) { return notice.id === String(id) })[0]
    if (!item) throw new Error('公告不存在')
    return item
  })
}

function submissionCreate(payload) {
  const data = payload || {}
  return delay(150).then(function () {
    const db = load()
    const user = requireUser(db)
    if (!db.submissions) db.submissions = []

    const record = {
      id: 's' + Date.now(),
      userId: user.id,
      type: data.type,
      name: data.name,
      gender: data.gender,
      age: data.age,
      breed: data.breed || '',
      sterilized: !!data.sterilized,
      vaccinated: !!data.vaccinated,
      health: data.health || '',
      location: data.location,
      story: data.story,
      images: data.images || [],
      contactName: data.contactName,
      phone: data.phone || '',
      wechat: data.wechat || '',
      status: 'pending',
      rejectCode: '',
      rejectReason: '',
      animalId: null,
      createdAt: now(),
      reviewedAt: ''
    }
    db.submissions.unshift(record)
    save(db)
    return record
  })
}

function submissionMine(params) {
  const query = params || {}
  return delay(110).then(function () {
    const db = load()
    const user = requireUser(db)
    const status = query.status || 'all'
    const page = Number(query.page) || 1
    const size = Number(query.size) || 10

    let list = (db.submissions || []).filter(function (item) {
      return item.userId === user.id
    })
    if (status !== 'all') {
      list = list.filter(function (item) { return item.status === status })
    }

    const total = list.length
    const start = (page - 1) * size
    const slice = list.slice(start, start + size)
    return {
      list: slice,
      total: total,
      page: page,
      size: size,
      hasMore: start + slice.length < total
    }
  })
}

function submissionWithdraw(id) {
  return delay(110).then(function () {
    const db = load()
    const user = requireUser(db)
    const record = (db.submissions || []).filter(function (item) {
      return item.id === String(id)
    })[0]
    if (!record || record.userId !== user.id) throw new Error('投稿不存在')
    if (record.status !== 'pending') throw new Error('只有待审核的投稿可以撤回')

    record.status = 'withdrawn'
    record.reviewedAt = now()
    save(db)
    return record
  })
}

function feedbackSubmit(payload) {
  const data = payload || {}
  return delay(150).then(function () {
    const db = load()
    requireUser(db)
    db.feedbacks.unshift({
      id: 'f' + Date.now(),
      content: data.content,
      contact: data.contact || '',
      createdAt: now()
    })
    save(db)
    return true
  })
}

module.exports = {
  login: login,
  health: health,
  home: home,
  animalList: animalList,
  animalDetail: animalDetail,
  favoriteList: favoriteList,
  favoriteAdd: favoriteAdd,
  favoriteRemove: favoriteRemove,
  favoriteIs: favoriteIs,
  adoptionCreate: adoptionCreate,
  adoptionMine: adoptionMine,
  adoptionWithdraw: adoptionWithdraw,
  userMe: userMe,
  userUpdate: userUpdate,
  userDelete: userDelete,
  noticeDetail: noticeDetail,
  submissionCreate: submissionCreate,
  submissionMine: submissionMine,
  submissionWithdraw: submissionWithdraw,
  feedbackSubmit: feedbackSubmit,
  _reset: function () {
    wx.removeStorageSync(DB_KEY)
  }
}