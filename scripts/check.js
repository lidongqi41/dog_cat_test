/**
 * 交付前静态检查
 *
 * 用法：node scripts/check.js
 * 检查项：JSON 合法性、JS 语法、页面四件套、tabBar 注册、组件路径、WXML 标签配对
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIRS = new Set(['.git', 'node_modules', 'miniprogram_npm', 'admin'])

const errors = []
const warnings = []

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/')
}

function walk(dir, predicate, out) {
  const result = out || []
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (error) {
    return result
  }
  entries.forEach(function (entry) {
    if (entry.name.startsWith('.') && entry.name !== '.eslintrc.js') return
    if (SKIP_DIRS.has(entry.name)) return
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, predicate, result)
    } else if (predicate(entry.name)) {
      result.push(full)
    }
  })
  return result
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length
}

// 1. JSON
walk(ROOT, function (name) { return name.endsWith('.json') }).forEach(function (file) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(rel(file) + ': JSON 解析失败 - ' + error.message)
  }
})

// 2. JS 语法
walk(ROOT, function (name) { return name.endsWith('.js') }).forEach(function (file) {
  try {
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file })
  } catch (error) {
    errors.push(rel(file) + ': JS 语法错误 - ' + error.message)
  }
})

// 2.1 相对路径 require 是否存在
const requireReg = /require\(\s*['"]([^'"]+)['"]\s*\)/g
walk(ROOT, function (name) { return name.endsWith('.js') }).forEach(function (file) {
  const text = fs.readFileSync(file, 'utf8')
  let match = requireReg.exec(text)
  while (match) {
    const spec = match[1]
    if (spec.charAt(0) === '.') {
      const base = path.resolve(path.dirname(file), spec)
      const exists = [base, base + '.js', path.join(base, 'index.js')].some(function (candidate) {
        return fs.existsSync(candidate)
      })
      if (!exists) {
        errors.push(rel(file) + ': require 路径不存在 - ' + spec)
      }
    }
    match = requireReg.exec(text)
  }
})

// 3. app.json 页面与 tabBar
let appJson = null
try {
  appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'))
} catch (error) {
  errors.push('app.json 无法解析')
}

if (appJson) {
  const pages = appJson.pages || []
  pages.forEach(function (page) {
    ;['.js', '.json', '.wxml', '.wxss'].forEach(function (ext) {
      const file = path.join(ROOT, page + ext)
      if (!fs.existsSync(file)) {
        errors.push('页面缺少文件: ' + page + ext)
      }
    })
  })

  if (appJson.tabBar && appJson.tabBar.list) {
    appJson.tabBar.list.forEach(function (item) {
      if (pages.indexOf(item.pagePath) < 0) {
        errors.push('tabBar 页面未在 pages 中注册: ' + item.pagePath)
      }
    })
  }

  // 页面 json 里的组件路径
  pages.forEach(function (page) {
    const jsonPath = path.join(ROOT, page + '.json')
    if (!fs.existsSync(jsonPath)) return
    let config = null
    try {
      config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    } catch (error) {
      return
    }
    const components = config.usingComponents || {}
    Object.keys(components).forEach(function (name) {
      const componentPath = components[name]
      if (componentPath.indexOf('/') !== 0) return
      const base = path.join(ROOT, componentPath.slice(1))
      ;['.js', '.json', '.wxml'].forEach(function (ext) {
        if (!fs.existsSync(base + ext)) {
          errors.push(rel(jsonPath) + ': 组件不存在 ' + name + ' -> ' + componentPath + ext)
        }
      })
    })
  })

  // 页面跳转路径是否已注册
  walk(ROOT, function (name) { return name.endsWith('.js') }).forEach(function (file) {
    const text = fs.readFileSync(file, 'utf8')
    const routeReg = /\/pages\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g
    let match = routeReg.exec(text)
    while (match) {
      const target = match[0].replace(/^\//, '')
      if (pages.indexOf(target) < 0) {
        errors.push(rel(file) + ': 跳转到了未注册页面 - ' + match[0])
      }
      match = routeReg.exec(text)
    }
  })
}

// 4. WXML 标签配对
walk(ROOT, function (name) { return name.endsWith('.wxml') }).forEach(function (file) {
  const text = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  const stack = []
  const tagReg = /<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g
  let match = tagReg.exec(text)

  while (match) {
    const raw = match[0]
    const tag = match[1]
    const selfClosing = match[3] === '/'
    const isClose = raw.charAt(1) === '/'
    const line = lineOf(text, match.index)

    if (isClose) {
      const top = stack.pop()
      if (!top || top.tag !== tag) {
        errors.push(rel(file) + ':' + line + ' 标签不匹配，遇到 </' + tag + '>')
      }
    } else if (!selfClosing) {
      stack.push({ tag: tag, line: line })
    }

    match = tagReg.exec(text)
  }

  stack.forEach(function (item) {
    errors.push(rel(file) + ':' + item.line + ' 标签未闭合 <' + item.tag + '>')
  })
})

// 5. 输出
if (warnings.length) {
  console.log('\n警告：')
  warnings.forEach(function (item) { console.log('  - ' + item) })
}

if (errors.length) {
  console.log('\n错误：')
  errors.forEach(function (item) { console.log('  - ' + item) })
  console.log('\n检查未通过，共 ' + errors.length + ' 个问题。')
  process.exit(1)
}

console.log('检查通过：JSON、JS、页面四件套、tabBar、组件路径、WXML 标签均正常。')
