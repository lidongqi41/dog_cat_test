# 前端架构与边界

最后更新：2026-11-08

## 1. 定位与边界

暖爪 WarmPaws 是流浪动物救助信息与领养申请小程序。

**已确认的边界**

| 不做 | 原因 |
|---|---|
| 支付、公益捐赠、云认养收费 | 需要公开募捐资质与商户号 |
| 消息推送、订阅消息 | 小程序无主动推送通道 |
| 社区 UGC、评论、点赞、关注 | 需要社交类目与内容审核能力 |
| 用户上传头像、评论配图 | 头像仅存本机；投稿只允许动物照片 |
| 学生认证、志愿活动、志愿时长、证明 | 本阶段整体删除 |

**仍然保留**

- 微信账号登录（wx.login → 后端 code2session → token）
- 动物档案：列表、搜索、筛选、详情
- 领养申请：提交、查看、撤销
- 动物投稿：用户上传照片 + 管理员先审后发
- 收藏
- 公告（纯文本）
- 个人资料：昵称 + 本机头像
- 意见反馈、设置、协议、注销

## 2. 技术栈

| 项 | 取值 |
|---|---|
| 渲染 | Skyline + glass-easel |
| 基础库 | 3.17.6 |
| 语言 | 原生 WXML / WXSS / JS（无 npm 依赖） |
| 后端 | Spring Boot 3 + MySQL 8（本地 Docker / 云托管）+ COS |
| 后台 | Vue 3 + Vite + Element Plus（`admin/`） |

## 3. 目录结构

```
app.js / app.json / app.wxss
config/
  index.js          环境配置（dev / trial / prod 自动识别）
  constants.js      业务枚举与状态文案
  agreements.js     协议、隐私政策、领养须知（纯文本）
utils/
  request.js        统一请求层
  store.js          极简全局状态
  cache.js          业务缓存（只清 cache:/history:/draft:）
  avatar.js         本机头像保存与读取
  upload.js         选图、压缩、上传（wx.uploadFile）
  mock.js           Mock 数据与接口实现
  page.js           页面工厂
  format.js / validate.js
services/
  auth.js home.js content.js animal.js favorite.js
  adoption.js submission.js user.js notice.js feedback.js
components/
  navigation-bar/  avatar/  page-state/
styles/
  variables.wxss  common.wxss
pages/
  index  animal  animal-detail  notice  submit  my-submit
  adopt  my-adopt  favorite  mine  profile  feedback
  setting  doc  cancel
scripts/check.js
server/              Spring Boot 后端（独立 Maven 工程）
```

## 4. 分层

```
pages → services → utils/request → config
                 ↘ utils/mock（仅开发期）
utils/store ← services/auth
```

- 页面不直接调 `wx.request`；
- service 内部判断 `config.mock`，决定走 mock 还是真实接口；
- `request` 从 store 读 token，`401` 时清会话。

## 5. 登录

```
启动 → 恢复本地 session → 无效则 wx.login
     → POST /api/v1/auth/login { code }
     → { token, expiresIn, user }
     → 存 storage + store
```

- 没有注册页、登录页、手机号、密码；
- `ensureLogin` 单例，避免并发重复登录；
- 退出登录不做（微信账号下无意义），只保留注销账号。

## 6. 头像

- 用户点「使用微信头像」→ `chooseAvatar` 返回临时路径；
- `compressImage` 压缩后 `FileSystemManager.saveFile` 存本机；
- 路径写入 `wp_avatar`，不上传、不进后台；
- 文件不存在时回退文字头像（昵称首字 + 色板）；
- 换设备、清微信存储、卸载后失效，属于预期行为。

## 7. 数据与接口

响应包：`{ code, message, data }`，`code === 0` 成功。

| 接口 | 说明 |
|---|---|
| `POST /auth/login` | code 换 token |
| `GET /home` | 公告 3 条 + 推荐动物 |
| `GET /animals` | `type / status / keyword / page / size` |
| `GET /animals/{id}` | 详情 |
| `GET /notices/{id}` | 纯文本公告 |
| `POST /adoptions` | 提交申请（快照姓名、联系方式） |
| `GET /adoptions/mine` | 我的申请（分页 + 状态） |
| `POST /adoptions/{id}/withdraw` | 撤销（仅待审核） |
| `GET /favorites` / `POST /favorites` / `DELETE /favorites/{animalId}` | 收藏 |
| `GET /favorites/{animalId}/status` | 单个动物的收藏状态 |
| `GET /users/me` / `PUT /users/me` | 用户；PUT 只改昵称 |
| `DELETE /users/me` | 注销 |
| `POST /feedback` | 反馈 |
| `GET /app/config` / `GET /app/agreements/{type}` | 配置与协议 |

约定：

- ID 为字符串（后端 Long 需序列化为 String）；
- 时间 `yyyy-MM-dd HH:mm:ss`；
- 分页 `page` 从 1 开始。

## 8. 注销语义

- 删除用户、收藏、意见反馈；
- 待审核的申请：直接删除；
- 已审核（通过/拒绝/撤销）的申请：`user_id` 置空，**保留姓名与联系方式**，用于领养回访；
- 同一微信再次登录会创建新账号，旧申请不再关联；
- 隐私政策需写明保留目的与 12 个月期限。

## 9. 缓存

| key | 内容 | 清除业务缓存 |
|---|---|---|
| `wp_session` | 登录态 | 保留 |
| `wp_avatar` | 头像路径 | 保留 |
| `mock:db` | Mock 数据 | 保留 |
| `cache:*` | 业务缓存 | 清除 |
| `history:*` | 搜索历史 | 清除 |
| `draft:*` | 表单草稿 | 清除 |

## 10. Mock

开发版默认 `config.mock = true`：

- 数据落在 storage `mock:db`，可跨页面、跨启动演示；
- 首次启动自动写入 8 只动物、3 条公告；
- 切真实后端前，把 `config/index.js` 的 `apiBase` 换成云托管域名，并把 `mock` 设为 `false`。

## 11. 发布前检查

1. `node scripts/check.js` 通过；
2. `config/index.js` 的 trial / prod `apiBase` 已填；
3. 公众平台配置 request 合法域名（HTTPS）；
4. 小程序备案完成；
5. AppID 归属确认（ADR-011）；
6. 隐私政策、用户协议、领养须知已配置。
