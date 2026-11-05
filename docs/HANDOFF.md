# 交接文档

**新会话开工先读这一份**，再读 `README.md` 和 `docs/DECISIONS.md`。目标是让人（或另一个对话）在 5 分钟内知道：现在在哪、下一步做什么、有哪些坑。

最后更新：2026-11-05（`v0.1.1` 之后）

---

## 一句话现状

工程化配置已完成；**界面仍是骨架**——首页是入口页（项目状态卡片 + 跳转按钮），另有一个 `pages/demo` 示例页验证跳转与导航栏，尚无任何业务功能。

## 页面清单

| 路由 | 作用 |
|---|---|
| `pages/index/index` | 首页入口：标题、项目状态卡片、跳转按钮 |
| `pages/demo/demo` | 示例页：接收 `wx.navigateTo` 传来的 `from` 参数，验证返回/回首页 |

## 环境

| 项 | 值 |
|---|---|
| 项目路径 | `E:\wexin_kafazhe_gongjuTencent\Project` |
| 微信开发者工具 | `2.02.2609240`，装在 `E:\wexin_kafazhe_gongjuTencent\微信web开发者工具` |
| 基础库 | `3.17.6` |
| 渲染引擎 | Skyline + glass-easel（见 ADR-002） |
| AppID | `wxc53b5fb50a25beba`（**归属待确认**，见 ADR-011） |
| Node.js | `v24.19.0`（`E:\Node.js\Node.js`），当前项目未使用 npm 依赖 |
| Git | `2.51.0.windows.2`（`E:\VS-Git`） |
| 工具 CLI | `cli.bat` 可用，但**服务端口默认关闭**，需在「设置 → 安全设置」开启才能命令行调工具 |

## 仓库状态

| 项 | 值 |
|---|---|
| 远程 | `origin` → GitHub `lidongqi41/dog_cat_test`；`gitee` → Gitee `likedonqi/dog_cat_test`（SSH） |
| 分支 | `main`（可发布，GitHub 侧有保护）、`dev`（日常） |
| 最新 tag | `v0.1.1` → 首页入口页 + 示例页 + 导航栏 `home` 修复 |
| 同步命令 | `git push-all`（两边分支）；tag 需单独推 |

## 已完成

- [x] 项目检查：JSON 全部合法、JS 通过 `node --check`、开发者工具编译无错
- [x] git 仓库初始化，`main` / `dev` 分支模型
- [x] `.gitignore`（排除 `project.private.config.json` 等）、`.gitattributes`（LF）、`.editorconfig`
- [x] `README.md`：目录结构、开发流程、发布清单、双远程（按平台分开记录）
- [x] GitHub 分支保护：禁强推、禁删除、要求线性历史、约束管理员
- [x] Gitee 镜像：SSH ed25519 免密推送，已与 GitHub 对齐
- [x] `v0.1.0` 标签（工程化基线）
- [x] `docs/DECISIONS.md`、`docs/HANDOFF.md`（本文档）
- [x] 首页改为入口页骨架：标题、项目状态卡片、跳转按钮
- [x] 新增 `pages/demo` 示例页：解析 query 参数，验证导航栏返回/回首页
- [x] 修复 `navigation-bar` 缺 `home` 方法（改用 `wx.reLaunch` 回首页，并抛 `home` 事件）
- [x] 交付前校验：7 个 JSON 合法、4 个 JS 通过语法检查、页面四件套 4/4、WXML 标签配对
- [x] `v0.1.1` 标签，推送两个平台

## 下一步待办

### P0 —— 开工前必须确认

- [ ] **确认 AppID 归属**：不是自己的就无法真机预览/上传（ADR-011）
- [ ] **Gitee 默认分支改为 `main`**：现在是 `dev`，别人打开仓库首页看到的是开发中代码。路径：管理 → 仓库设置 → 默认分支

### P1 —— 业务功能（尚未开始，需求未定）

- [ ] 先定首页要承载什么：按项目名「流浪猫狗」推测是领养/求助类，但**未经确认**，不要凭猜测开工
- [ ] 多主页面（如「领养」「我的」）时才需要加 `app.json` 的 `tabBar`，图标 81×81px
- [ ] 清理 `app.json` 里 `navigationStyle: custom` 下无意义的 `navigationBarTextStyle`

### P2 —— 待定的决策

- [ ] LICENSE 用木兰 v2 还是换 MIT（ADR-009）
- [ ] 仓库保持公开还是转私有（ADR-010）
- [ ] `.eslintrc.js` 没有 `extends` 任何规则集，且 `ecmaFeatures` 位置不对，实际不检查代码

## 已知问题

| 问题 | 影响 | 处理 |
|---|---|---|
| 首页版本号写死在 `pages/index/index.js` 的 `data.version` | 每次发版要手改，忘改会显示旧版本 | 发版时同步修改，或改成读配置 |
| Gitee 默认分支是 `dev` | 仓库首页展示开发中代码 | 见 P0 |
| 自动生成的 `LICENSE` 是木兰 v2 | 协议可能不是本意 | 见 ADR-009 |
| 开发者工具服务端口关闭 | 无法用 `cli.bat` 自动预览/上传 | 需要时在工具里手动开启 |

## 新会话开工指引

1. **先读**：本文档 → `docs/DECISIONS.md` → `README.md`
2. **确认分支**：`git status`、`git branch -vv`，日常在 `dev` 上干活
3. **别做**：
   - 不要 `git push --force` 到 `main`（会因保护规则被拒，或改坏历史）
   - 不要在 Gitee 网页上直接改代码（会造成双远程分叉）
   - 不要提交 `project.private.config.json`
   - 不要提交 AppSecret、token、真实密钥
   - Skyline 下不要用 `document` / `window`，`scroll-view` 必须写 `type`
4. **提交**：`<类型>: <说明>`（`feat` / `fix` / `docs` / `chore` / `refactor` / `style`）
5. **发版**：`main` 快进合并 → `git push-all` → 打 tag → 单独推 tag 到两个平台 → 更新 README 版本记录表
6. **改动完成后**：回来更新本文档的「已完成」「下一步待办」「已知问题」三节

## 建议的多会话分工

- **主对话**：需求、决策、评审、发版，维护 `DECISIONS.md` / `HANDOFF.md`
- **功能对话**：一个会话只做一件具体的事，开工前读上面两份文档，做完提交到 `feature/xxx`
- 并行开发多个功能时用 `git worktree` 隔离目录，避免同目录互相覆盖：

  ```bash
  git worktree add ../Project-home feature/home
  ```

- 会话之间不共享对话记忆，**唯一可靠的交接方式是文件 + git 提交**