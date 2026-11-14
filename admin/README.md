# WarmPaws Admin

暖爪 WarmPaws 管理后台：Vue 3 + Vite + Element Plus。

## 功能

| 页面 | 路由 | 说明 |
|---|---|---|
| 登录 | `#/login` | 管理员账号密码，默认 `admin / admin123` |
| 数据概览 | `#/dashboard` | 待审核投稿、待审核领养、动物总数、已通过投稿 |
| 投稿审核 | `#/submissions` | 列表、详情、图片预览、通过并发布、驳回 |
| 领养申请 | `#/adoptions` | 列表、详情、通过、拒绝 |
| 动物档案 | `#/animals` | 列表、搜索筛选、新增、编辑、删除、图片上传 |

## 本地运行

先启动后端：

```bash
cd ../server
docker compose up -d
```

再启动管理后台：

```bash
cd admin
npm install
npm run dev
```

打开 `http://127.0.0.1:5174`。

开发环境由 Vite 代理 `/api` 到 `http://127.0.0.1:8080`，不需要额外配置 CORS。

## 生产构建

```bash
npm run build
```

产物在 `admin/dist/`，可部署到静态网站托管。

如果前端和后端不同域，构建时指定后端地址：

```bash
VITE_API_BASE=https://your-api.example.com/api/v1 npm run build
```

## 说明

- token 存 `localStorage`，key 为 `wp_admin_token`；401 会自动清会话并跳登录；
- 管理员上传图片走 `POST /api/v1/uploads`，使用管理员 token；
- 图片 URL 由后端返回（本地磁盘或 COS），后台只负责展示；
- 审核通过投稿后，后端会生成动物档案，并返回 `animalId`。

## 还没做

- 公告管理、意见反馈管理、用户管理、数据统计页；
- 管理员改密、多角色；
- 列表排序、批量操作、导出。
