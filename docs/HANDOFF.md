# 交接文档

**新会话开工先读这一份**，再读 `docs/ARCHITECTURE.md`、`docs/DECISIONS.md` 和 `README.md`。目标是让人（或另一个对话）在 5 分钟内知道：现在在哪、下一步做什么、有哪些坑。

最后更新：2026-11-14（前端 15 页 + 后端 + 管理后台落地，尚未提交/打 tag）

---

## 一句话现状

前端 15 个页面已完成，开发版默认连本地后端（`http://127.0.0.1:8080`），可走通「微信登录 → 看动物 → 申请/撤销 → 上报流浪动物 → 我的投稿 → 注销」；后端在 `server/`，管理后台在 `admin/`（Vue 3 + Vite + Element Plus），已能登录、审核投稿、审核领养、维护动物档案。

## 页面清单

| 路由 | 作用 | 数据 |
|---|---|---|
| `pages/index/index` | 首页：公告 3 条、快速筛选、推荐动物 | Mock / `GET /home` |
| `pages/animal/animal` | 动物列表（tab）：搜索、猫狗切换、状态筛选、分页 | Mock / `GET /animals` |
| `pages/animal-detail/animal-detail` | 动物详情：档案、故事、收藏、申请入口 | Mock / `GET /animals/{id}` |
| `pages/notice/notice` | 公告详情（纯文本段落） | `GET /notices/{id}` |
| `pages/submit/submit` | 上报流浪动物：表单、1–9 图上传、联系方式 | `POST /uploads`、`POST /submissions` |
| `pages/my-submit/my-submit` | 我的投稿：状态分组、驳回原因、撤回 | `GET /submissions/mine` |
| `pages/adopt/adopt` | 领养申请：表单、校验、须知勾选、提交 | Mock / `POST /adoptions` |
| `pages/my-adopt/my-adopt` | 我的申请：状态分组、撤销 | Mock / `GET /adoptions/mine` |
| `pages/favorite/favorite` | 我的收藏 | Mock / `GET /favorites` |
| `pages/mine/mine` | 我的（tab）：本机头像、昵称、入口 | 本地会话 |
| `pages/profile/profile` | 编辑资料：昵称、本机微信头像 | Mock / `PUT /users/me` |
| `pages/feedback/feedback` | 意见反馈（纯文字） | Mock / `POST /feedback` |
| `pages/setting/setting` | 设置：缓存、协议、注销、关于 | 本地 |
| `pages/doc/doc` | 用户协议 / 隐私政策 / 领养须知 | `config/agreements.js` |
| `pages/cancel/cancel` | 注销账号（二次确认） | Mock / `DELETE /users/me` |

## 环境

| 项 | 值 |
|---|---|
| 项目路径 | `E:\wexin_kafazhe_gongjuTencent\Project` |
| 微信开发者工具 | `2.02.2609240`，装在 `E:\wexin_kafazhe_gongjuTencent\微信web开发者工具` |
| 基础库 | `3.17.6` |
| 渲染引擎 | Skyline + glass-easel（见 ADR-002） |
| AppID | `wxc53b5fb50a25beba`（**归属待确认**，见 ADR-011） |
| Node.js | `v24.19.0`，仅用于 `scripts/` 下的检查脚本，项目本身无 npm 依赖 |
| 后端 | Spring Boot 3 + MySQL 8 + Flyway + JWT；本地 Docker 运行，MySQL 宿主机 3307 |
| Git | `2.51.0.windows.2`（`E:\VS-Git`） |

## 仓库状态

| 项 | 值 |
|---|---|
| 远程 | `origin` → GitHub `lidongqi41/dog_cat_test`；`gitee` → Gitee `likedonqi/dog_cat_test`（SSH） |
| 分支 | `main`（可发布，GitHub 侧有保护）、`dev`（日常） |
| 最新 tag | `v0.1.1`（本次前端改动**尚未提交、未打 tag**） |
| 同步命令 | `git push-all`（两边分支）；tag 需单独推 |

## 已完成

- [x] 项目检查：JSON 全部合法、JS 语法通过、页面四件套齐全、WXML 标签配对
- [x] git 仓库初始化，`main` / `dev` 分支模型
- [x] `.gitignore`、`.gitattributes`（LF）、`.editorconfig`
- [x] GitHub 分支保护、Gitee 镜像、`v0.1.0` / `v0.1.1` 标签
- [x] `docs/DECISIONS.md`、`docs/HANDOFF.md`
- [x] 前端框架层：环境配置、请求封装、登录态、页面工厂、缓存、头像、Mock
- [x] 15 个页面与 3 个 tab（首页 / 动物 / 我的）
- [x] 微信账号登录（开发版 `AUTH_MOCK=true`，正式版走 `POST /auth/login`）
- [x] 领养申请：提交、状态分组、撤销
- [x] 动物投稿：1–9 图上传、我的投稿、撤回、管理员审核通过后发布
- [x] 收藏、公告、意见反馈、设置、协议、注销
- [x] 本机微信头像：`chooseAvatar` + 本地保存，不上传
- [x] 注销语义：删账号/收藏/反馈，待审核申请删除，已审核申请脱钩保留姓名与联系方式
- [x] 业务缓存选择性清理，保留登录态与头像
- [x] `docs/ARCHITECTURE.md`、`scripts/check.js`、`scripts/smoke.js`
- [x] 冒烟测试通过：登录、首页、列表、详情、收藏、申请、撤销、注销、缓存清理
- [x] 后端工程 `server/`：Spring Boot 3 + MySQL 8 + Flyway + JWT，31 个 Java 文件
- [x] 后端接口：登录、用户、动物、公告、收藏、领养申请、反馈、投稿、上传、管理端审核
- [x] 本地环境：Docker Compose（MySQL + 后端）、本地磁盘存储、COS 适配器
- [x] `mvn package` 编译通过，生成 `server/target/warmpaws-server-0.1.0.jar`
- [x] 安装 WSL2 + Docker Desktop，`docker compose up --build` 启动成功
- [x] MySQL 8.0.46 容器（宿主机 3307）+ Flyway 自动建表 + 种子数据
- [x] 接口冒烟通过：健康检查、管理员登录、用户登录、首页、动物列表/详情、收藏、申请/撤销、图片上传、投稿、管理员审核、中文搜索
- [x] 管理后台 `admin/`：Vue 3 + Vite + Element Plus
- [x] 管理后台页面：登录、数据概览、投稿审核、领养申请、动物档案
- [x] 管理后台 `npm run build` 通过，Vite `/api` 代理联调通过

## 下一步待办

### P0 —— 接真实后端前必须确认

- [x] 安装 WSL2 + Docker Desktop（Docker 29.9.2 / Compose v5.6.1）
- [x] `cd server && docker compose up --build`，MySQL 与后端启动、Flyway 建表成功
- [x] 用 `GET /api/v1/health`、`POST /api/v1/auth/login`、`POST /api/v1/admin/auth/login` 验证通过
- [ ] 确认 AppID 归属：不是自己的就无法真机预览/上传（ADR-011）
- [ ] 体验版/正式版填 `config/index.js` 的 `apiBase`（云托管 HTTPS 域名）
- [ ] 公众平台配置 request 与 uploadFile 合法域名（HTTPS）
- [ ] 小程序备案
- [ ] 配置隐私保护指引；协议内容替换为正式版本
- [ ] 接内容安全：投稿文字 `msgSecCheck`、图片 `mediaCheckAsync`

### P1 —— 联调

- [x] 动物列表分页、筛选、关键词（后端冒烟通过）
- [x] 申请创建/撤销、唯一约束（后端冒烟通过）
- [x] 注销事务：删用户/收藏/反馈，申请脱钩（代码已实现，待前端实机验证）
- [x] 投稿上传、审核通过后发布（后端冒烟通过）
- [ ] 真实微信登录（`code2session`、token 有效期、401 处理）
- [ ] 前端在开发者工具里逐页点一遍，确认接口、图片、空态
- [ ] 管理后台补公告/反馈/用户/统计页
- [ ] 管理后台补批量审核、导出、管理员改密

### P2 —— 待定

- [ ] LICENSE 用木兰 v2 还是 MIT（ADR-009）
- [ ] 仓库保持公开还是转私有（ADR-010）
- [ ] `.eslintrc.js` 没有 `extends`，实际不检查代码
- [ ] Gitee 默认分支改为 `main`

## 已知问题

| 问题 | 影响 | 处理 |
|---|---|---|
| Mock 数据存在 storage（`mock:db`） | 切真实后端后旧数据仍在 | 切环境前清一次 storage，或换 AppID 调试 |
| 头像仅存本机 | 换设备、清微信存储后回退文字头像 | 预期行为，已在资料页说明 |
| 没有推送 | 审核结果只能用户主动进「我的申请」看 | 二期若有资质再评估订阅消息 |
| AppID 归属未确认 | 无法真机预览、上传、真实登录 | 见 P0 |
| Gitee 默认分支是 `dev` | 仓库首页展示开发中代码 | 见 P2 |
| LICENSE 是木兰 v2 | 协议可能不是本意 | 见 ADR-009 |
| `.eslintrc.js` 不生效 | 无静态检查 | 可先用 `node scripts/check.js` 兜底 |
| 上传内容安全未接入 | 投稿图片只靠人工审核 | 上线前补 `msgSecCheck` / `mediaCheckAsync` |
| 宿主机 3306 被原生 mysqld 占用 | 容器 MySQL 改映射到 3307 | 连接容器库用 3307，后端容器内仍走 3306 |

## 本地运行

1. 微信开发者工具导入本目录，AppID 用现有配置；
2. 开发版默认连本地后端（`config/index.js` 的 `mock: false`，`apiBase` 为 `http://127.0.0.1:8080`）；需要离线演示时在控制台执行 `wx.setStorageSync('__use_mock', true)` 后重新编译；
3. 提交前跑：

```bash
node scripts/check.js
node scripts/smoke.js
```

4. 真机预览需要 AppID 归属正确；开发期可在「详情 → 本地设置」关闭域名校验。

### 后端

```bash
cd server
cp .env.example .env
docker compose up --build
```

- 健康检查：`http://127.0.0.1:8080/api/v1/health`
- 默认管理员：`admin / admin123`
- 小程序联调：开发版已默认连 `http://127.0.0.1:8080`

### 管理后台

```bash
cd admin
npm install
npm run dev
```

- 地址：`http://127.0.0.1:5174`
- 默认管理员：`admin / admin123`
- 先启动 `server/`，Vite 会把 `/api` 代理到 8080
- 详细接口与云部署说明见 `server/README.md`

## 新会话开工指引

1. **先读**：本文档 → `docs/ARCHITECTURE.md` → `docs/DECISIONS.md` → `README.md`
2. **确认分支**：`git status`、`git branch -vv`，日常在 `dev` 上干活
3. **别做**：
   - 不要 `git push --force` 到 `main`
   - 不要在 Gitee 网页上直接改代码
   - 不要提交 `project.private.config.json`
   - 不要提交 AppSecret、token、真实密钥
   - Skyline 下不要用 `document` / `window`，`scroll-view` 必须写 `type`
   - 不要破坏已确认的边界：支付、推送、开放 UGC、头像上传、学生/志愿功能都不做；投稿上传动物照片是 ADR-013 的例外
4. **提交**：`<类型>: <说明>`（`feat` / `fix` / `docs` / `chore` / `refactor` / `style`）
5. **发版**：`main` 快进合并 → `git push-all` → 打 tag → 单独推 tag → 更新 README 版本记录
6. **改动完成后**：更新本文档的「已完成」「下一步待办」「已知问题」三节

## 建议的多会话分工

- **主对话**：需求、决策、评审、发版，维护 `DECISIONS.md` / `HANDOFF.md`
- **功能对话**：一个会话只做一件具体的事，开工前读上面几份文档，做完提交到 `feature/xxx`
- 并行开发多个功能时用 `git worktree` 隔离目录：

  ```bash
  git worktree add ../Project-home feature/home
  ```

- 会话之间不共享对话记忆，**唯一可靠的交接方式是文件 + git 提交**
