# 交接文档

**新会话开工先读这一份**，再读 `README.md` 和 `docs/DECISIONS.md`。目标是让人（或另一个对话）在 5 分钟内知道：现在在哪、下一步做什么、有哪些坑。

最后更新：2026-11-05（`v0.1.0` 之后）

---

## 一句话现状

工程化配置已完成，仓库可正常提交/推送/发版；**小程序本身仍是空白骨架**，首页只显示一行 `Weixin`，尚无任何业务功能。

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
| 最新 tag | `v0.1.0` → 提交 `037d26c`（工程化完成，无业务功能） |
| 同步命令 | `git push-all`（两边分支）；tag 需单独推 |

## 已完成

- [x] 项目检查：6 个 JSON 合法、3 个 JS 语法通过、开发者工具编译无错
- [x] git 仓库初始化，`main` / `dev` 分支模型
- [x] `.gitignore`（排除 `project.private.config.json` 等）、`.gitattributes`（LF）、`.editorconfig`
- [x] `README.md`：目录结构、开发流程、发布清单、双远程（按平台分开记录）
- [x] GitHub 分支保护：禁强推、禁删除、要求线性历史、约束管理员
- [x] Gitee 镜像：SSH ed25519 免密推送，已与 GitHub 对齐
- [x] `v0.1.0` 标签，推送两个平台
- [x] `docs/DECISIONS.md`、`docs/HANDOFF.md`（本文档）

## 下一步待办

### P0 —— 开工前必须确认

- [ ] **确认 AppID 归属**：不是自己的就无法真机预览/上传（ADR-011）
- [ ] **Gitee 默认分支改为 `main`**：现在是 `dev`，别人打开仓库首页看到的是开发中代码。路径：管理 → 仓库设置 → 默认分支

### P1 —— 第一批代码任务（建议一起做，作为 `v0.1.1`）

- [ ] 修 `components/navigation-bar/navigation-bar.wxml` 的 `bindtap="home"`：`navigation-bar.js` 的 `methods` 里没有 `home` 方法，启用 `homeButton` 后点击无反应。补：

  ```js
  home() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
  ```

- [ ] 把首页 `pages/index` 从「显示 Weixin」改成真正的入口页骨架（标题、说明、一个跳转示例按钮）
- [ ] 找机会清理 `app.json` 里 `navigationStyle: custom` 下无意义的 `navigationBarTextStyle`

### P2 —— 待定的决策

- [ ] LICENSE 用木兰 v2 还是换 MIT（ADR-009）
- [ ] 仓库保持公开还是转私有（ADR-010）
- [ ] `.eslintrc.js` 没有 `extends` 任何规则集，且 `ecmaFeatures` 位置不对，实际不检查代码

## 已知问题

| 问题 | 影响 | 处理 |
|---|---|---|
| `navigation-bar` 缺 `home` 方法 | 启用首页按钮后点击无反应（无报错，静默失败） | 见 P1 |
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
4. **提交**：`<类型>: <说明>`（`feat` / `fix` / `docs` / `chore` / `refactor` / `style`）
5. **发版**：`main` 快进合并 → `git push-all` → 打 tag → 单独推 tag 到两个平台 → 更新 README 版本记录表
6. **改动完成后**：回来更新本文档的「已完成」「下一步待办」两节

## 建议的多会话分工

- **主对话**：需求、决策、评审、发版，维护 `DECISIONS.md` / `HANDOFF.md`
- **功能对话**：一个会话只做一件具体的事，开工前读上面两份文档，做完提交到 `feature/xxx`
- 并行开发多个功能时用 `git worktree` 隔离目录，避免同目录互相覆盖：

  ```bash
  git worktree add ../Project-home feature/home
  ```

- 会话之间不共享对话记忆，**唯一可靠的交接方式是文件 + git 提交**