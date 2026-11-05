# 流浪猫狗 test · 微信小程序

> 仓库：https://github.com/lidongqi41/dog_cat_test
> 分支：`main` 只放可发布版本，日常开发在 `dev` 上，发版时 `main` 快进合并 `dev`

一个从**空白模板**起步的微信小程序项目，当前只有首页骨架，用于后续功能开发。

## 文档索引

| 文件 | 内容 | 什么时候读 |
|---|---|---|
| [README.md](README.md) | 项目说明、目录结构、开发与发布流程 | 第一次接触项目 |
| [docs/DECISIONS.md](docs/DECISIONS.md) | 架构与技术决策记录（ADR），写「为什么这么定」 | 想改技术方案前 |
| [docs/HANDOFF.md](docs/HANDOFF.md) | 当前进度、下一步待办、已知问题 | **新会话/接手先读这份** |

## 技术栈

| 项 | 取值 |
|---|---|
| 渲染引擎 | `skyline`（原生渲染，非 WebView） |
| 组件框架 | `glass-easel` |
| 基础库 | `3.17.6` |
| 开发范式 | 原生 WXML / WXSS / JS（无 Vue、无 Taro、无 uni-app） |
| 开发者工具 | 2.02.x（安装在 `E:\wexin_kafazhe_gongjuTencent\微信web开发者工具`） |

> Skyline 的限制比 WebView 严格：CSS 只支持子集、没有 `document`/`window`、
> `scroll-view` 必须显式写 `type="list"` 或 `type="custom"`。想省心可以在
> `app.json` 里把 `renderer` 改回 `webview`，但两种模式的样式表现不完全一致。

## 目录结构

```
Project/
├── app.js                         小程序入口（App 实例、全局生命周期、globalData）
├── app.json                       全局配置：页面路由、窗口、渲染引擎、分包、tabBar
├── app.wxss                       全局样式
├── sitemap.json                   微信搜索收录规则
├── project.config.json            项目配置：AppID、编译选项、打包规则（提交）
├── project.private.config.json    个人配置：基础库版本、urlCheck（已忽略，不提交）
├── README.md                      项目说明、开发与发布流程
├── .eslintrc.js                   ESLint 规则（需在工具里装 ESLint 插件才生效）
├── .editorconfig                  缩进、编码、换行统一
├── .gitattributes                 换行符统一为 LF，二进制文件声明
├── .gitignore                     忽略个人配置、依赖产物、日志
├── docs/
│   ├── DECISIONS.md               架构与技术决策记录（ADR）
│   └── HANDOFF.md                 当前进度、下一步、已知问题
├── pages/
│   ├── index/                     首页：入口页，展示项目状态 + 跳转按钮
│   │   ├── index.js               页面逻辑：data、事件处理
│   │   ├── index.json             页面配置：usingComponents
│   │   ├── index.wxml             页面结构
│   │   └── index.wxss             页面样式
│   └── demo/                      示例页：验证跳转、传参、导航栏返回/回首页
│       ├── demo.js                接收 onLoad 的 query 参数
│       ├── demo.json
│       ├── demo.wxml
│       └── demo.wxss
└── components/
    └── navigation-bar/            自定义顶部导航栏
        ├── navigation-bar.js      Component({ properties, data, methods, lifetimes })
        ├── navigation-bar.json    component: true
        ├── navigation-bar.wxml
        └── navigation-bar.wxss
```

## 本地开发

1. 打开微信开发者工具 → 「导入项目」→ 选择本目录 → 填入 AppID
2. 工具左侧模拟器应显示标题「流浪猫狗」、一张项目状态卡片和「查看页面跳转示例」按钮
3. 点按钮进入示例页，页面右上角有返回和回首页按钮，可验证导航与传参
3. 开发期建议勾选「详情 → 本地设置 → 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」
   （对应 `project.private.config.json` 的 `urlCheck: false`，只影响本机）

## 新增一个页面

必须四件套齐全，且**在 `app.json` 的 `pages` 数组里登记**（不登记不参与编译）：

```
pages/detail/detail.js
pages/detail/detail.wxml
pages/detail/detail.wxss
pages/detail/detail.json
```

```json
// app.json —— 新页面追加在数组末尾，减少多人协作时的合并冲突
"pages": [
  "pages/index/index",
  "pages/detail/detail"
]
```

跳转：`wx.navigateTo({ url: '/pages/detail/detail?id=1' })`

## Git 工作流

### 分支约定

| 分支 | 用途 | 规则 |
|---|---|---|
| `main` | 可发布版本 | 只接受从 `dev` 合并，每次合并对应一次上传/发版 |
| `dev` | 日常开发 | 功能完成、自测通过后合并进 `main` |
| `feature/xxx` | 单个功能（可选） | 从 `dev` 切出，完成后删掉 |

> `main` 已在 GitHub 开启分支保护：**禁止强制推送、禁止删除分支、要求线性历史**，
> 且规则对管理员同样生效。所以 `main` 只能往前追加，历史被改写或分支被误删都会被服务端拒绝。
> 日常提交请直接在 `dev` 上做，不要尝试 `git push --force` 到 `main`。

```bash
git checkout dev
git checkout -b feature/list-page      # 开功能分支（可选）
# ... 写代码 ...
git add -A
git commit -m "feat: 首页增加列表"
git checkout dev
git merge --no-ff feature/list-page    # 合并并保留分支痕迹
```

### 远程仓库（双远程）

两个平台的**代码内容、分支、tag 完全一致**，差异只在接入方式和平台规则，所以分开记录。

**共同约定**

- 代码以 GitHub 为准，不要在任何平台的网页上直接改，否则两边分叉
- `git push` 只推 `origin`（GitHub）。要两边同步：

```bash
git push-all      # 别名：依次推送 origin 和 gitee 的 main、dev
```

- **tag 不会随 `push-all` 自动推送**，发版后单独推：`git push origin v0.1.1 && git push gitee v0.1.1`

#### GitHub 侧（`origin`）

| 项 | 值 |
|---|---|
| 地址 | `https://github.com/lidongqi41/dog_cat_test` |
| 账号 | `lidongqi41` |
| 认证 | HTTPS + Windows 凭据管理器缓存令牌，不用输密码 |
| 角色 | 主仓库，本地 `main`/`dev` 的跟踪上游，`git pull` 默认从这里拉 |
| 默认分支 | `main` |
| 分支保护 | **已开启**：禁止强制推送、禁止删除分支、要求线性历史（`enforce_admins` 也为开，管理员同样受约束） |
| 调整规则 | 网页 Settings → Branches；或 API `PUT /repos/lidongqi41/dog_cat_test/branches/main/protection` |
| 平台的坑 | 免费账号的**私有仓库不支持**分支保护，把仓库切成私有会丢掉上面那三条规则 |

#### Gitee 侧（`gitee`）

| 项 | 值 |
|---|---|
| 地址 | `git@gitee.com:likedonqi/dog_cat_test.git` |
| 账号 | `likedonqi` |
| 认证 | SSH ed25519 密钥，私钥在 `~/.ssh/id_ed25519`（无口令），免密推送 |
| 角色 | 镜像 + 异地备份，兼顾国内访问速度；**不作为开发入口** |
| 默认分支 | **`dev`（待改成 `main`）**：仓库为空时 Gitee 把最后推送的分支设成了默认 |
| 分支保护 | 未开启。Gitee 的**免费私有仓库也支持**保护分支，可以补位 GitHub 的短板 |
| 自动生成的内容 | `LICENSE`（木兰宽松许可证 v2），Gitee 在公开仓库上自动提交，已并入主线 |
| 换密钥 | Gitee → 设置 → SSH 公钥，删掉旧公钥，本机重新 `ssh-keygen` 再贴一次 |
| 平台的坑 | 默认分支还是 `dev` 时，别人打开仓库首页看到的是开发中的代码，不是可发布版本 |

### 提交信息规范

`<类型>: <一句话说明>`

| 类型 | 用于 |
|---|---|
| `feat` | 新功能、新页面 |
| `fix` | 修 bug |
| `refactor` | 重构，行为不变 |
| `style` | 只改样式或格式 |
| `docs` | 文档、注释 |
| `chore` | 配置、依赖、杂项 |

### 版本号与上传对齐

小程序后台每次上传要填版本号，用 git tag 把它锁死：

```bash
git tag -a v1.0.0 -m "首页 + 列表页"
git push origin v1.0.0
```

线上出问题时 `git checkout v1.0.0` 就能还原当时那一版代码。

### 哪些文件不进版本库

- `project.private.config.json` —— 每人本机配置不同，提交了必然互相覆盖
- `node_modules/`、`miniprogram_npm/` —— 依赖可由 `package.json` 还原
- 日志、编辑器目录

## 发布清单

1. **服务器域名**：后台 → 开发 → 开发设置 → 服务器域名（必须 HTTPS、已备案，不能用 IP 或 localhost）
2. **隐私指引**：后台 → 设置 → 服务内容声明 → 用户隐私保护指引（涉及手机号、位置、相册时必填）
3. **服务类目**：后台 → 设置 → 基本设置 → 服务类目（决定能用哪些能力）
4. **上传**：工具右上「上传」，版本号与 git tag 保持一致，备注写清改动
5. **提审**：后台 → 版本管理 → 提交审核
6. **发布**：审核通过后点「发布」，可先用「灰度发布」按比例放量

## 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 改完代码模拟器没变化 | 点「编译」；或详情 → 本地设置里清缓存后重开 |
| 真机预览扫码后报错 | AppID 不是你自己的、没有开发者权限、或请求域名不在白名单 |
| `找不到 miniprogram_npm 下的模块` | 工具菜单「工具 → 构建 npm」，不能只 `npm install` |
| Skyline 下样式不生效 | 该 CSS 属性不被 Skyline 支持，改用 flex/grid 子集；或页面级切回 webview |
| 点按钮没反应 | 先看控制台有没有 `Component "..." does not have a method "xxx"`，这是事件绑定了不存在的方法 |

## TODO / 已知问题

完整清单、优先级和操作步骤维护在 [docs/HANDOFF.md](docs/HANDOFF.md)，这里只留最要紧的一条：

- [ ] 确认 AppID `wxc53b5fb50a25beba` 是否为本人所有，否则无法真机预览和上传

## 版本记录

| 版本 | 内容 | 小程序上传版本号 |
|---|---|---|
| `v0.1.1` | 首页改为入口页（状态卡片 + 跳转按钮），新增 `pages/demo` 示例页，修复导航栏缺 `home` 方法 | 尚未上传 |
| `v0.1.0` | 项目骨架 + 工程化配置（git 流程、文档、GitHub/Gitee 双远程） | 尚未上传 |

发版流程：`main` 合并完成并推送后打 tag，tag 名与小程序后台「上传」时填的版本号保持一致。

```bash
git tag -a v0.1.1 -m "改了什么"
git push origin v0.1.1 && git push gitee v0.1.1
```