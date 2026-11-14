# WarmPaws Server

暖爪 WarmPaws 后端：Spring Boot 3 + MySQL 8 + JDBC + Flyway + JWT。

## 技术栈

| 项 | 取值 |
|---|---|
| Java | 17 |
| Spring Boot | 3.3.5 |
| 数据库 | MySQL 8，utf8mb4 |
| 迁移 | Flyway |
| 鉴权 | JWT（用户与管理员共用密钥，角色区分） |
| 存储 | 本地磁盘（local）/ 腾讯云 COS（cos） |

## 目录

```
server/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── src/main/
    ├── java/com/warmpaws/
    │   ├── auth/        登录、JWT、拦截器
    │   ├── user/        用户与注销
    │   ├── animal/      动物档案
    │   ├── notice/      公告（app 包内）
    │   ├── favorite/    收藏
    │   ├── adoption/    领养申请
    │   ├── submission/  用户投稿
    │   ├── admin/       管理端审核
    │   ├── storage/     上传与存储
    │   └── common/      响应、分页、异常
    └── resources/
        ├── application.yml
        └── db/migration/  V1 建表、V2 演示数据
```

## 本地运行（Docker）

```bash
cd server
cp .env.example .env
docker compose up --build
```

- 后端：http://127.0.0.1:8080
- MySQL：127.0.0.1:**3307**（容器内 3306；本机 3306 若被原生 MySQL 占用，用 3307 避免冲突），库 `warmpaws`，账号 `warmpaws / warmpaws`
- 上传文件：容器内 `/app/data/uploads`，映射到 `upload-data` volume
- 默认管理员：`admin / admin123`（首次启动自动创建，务必修改）

## 本地运行（不用 Docker）

前提：MySQL 8 已启动，并建好库与账号。

```bash
cd server
mvn spring-boot:run
```

或先打包：

```bash
mvn -DskipTests package
java -jar target/warmpaws-server-0.1.0.jar
```

## 配置

所有配置走环境变量，见 `.env.example`。关键项：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DB_URL` | `jdbc:mysql://127.0.0.1:3306/warmpaws?...` | 数据库连接 |
| `DB_USER` / `DB_PASSWORD` | `warmpaws` / `warmpaws` | 数据库账号 |
| `PUBLIC_BASE_URL` | `http://127.0.0.1:8080` | 本地文件访问前缀 |
| `JWT_SECRET` | 开发默认值 | 正式环境必须改，至少 32 字节 |
| `JWT_EXPIRE_SECONDS` | `604800` | token 有效期 |
| `AUTH_MOCK` | `true` | true 时不调微信接口，固定 mock-openid |
| `WX_APPID` / `WX_SECRET` | 空 | 正式登录必填 |
| `STORAGE_TYPE` | `local` | `local` 或 `cos` |
| `COS_*` | 空 | `STORAGE_TYPE=cos` 时必填 |

### 网络不可用时更新后端

Docker Hub 拉不到 `maven` / `eclipse-temurin` 基础镜像时，`docker compose up --build` 会失败。可以本地编译后替换容器里的 jar：

```bash
mvn -DskipTests package
docker cp target/warmpaws-server-0.1.0.jar warmpaws-backend:/app/app.jar
docker restart warmpaws-backend
```

网络恢复后，再执行一次 `docker compose up -d --build`，让镜像和源码完全一致。

## 接口

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/v1/auth/login` | 否 | `{code}` 换 token |
| GET | `/api/v1/users/me` | 是 | 当前用户 |
| PUT | `/api/v1/users/me` | 是 | 改昵称 |
| DELETE | `/api/v1/users/me` | 是 | 注销 |
| POST | `/api/v1/admin/auth/login` | 否 | 管理员登录 |
| GET | `/api/v1/home` | 否 | 公告 + 推荐动物 |
| GET | `/api/v1/animals` | 否 | 列表、筛选、分页 |
| GET | `/api/v1/animals/{id}` | 否 | 详情 |
| GET | `/api/v1/notices/{id}` | 否 | 公告详情 |
| GET | `/api/v1/app/config` | 否 | 版本、协议类型 |
| GET | `/api/v1/app/agreements/{type}` | 否 | 协议纯文本 |
| GET | `/api/v1/health` | 否 | 健康检查 |
| GET | `/api/v1/favorites` | 是 | 收藏列表 |
| POST | `/api/v1/favorites` | 是 | 收藏 |
| DELETE | `/api/v1/favorites/{animalId}` | 是 | 取消收藏 |
| GET | `/api/v1/favorites/{animalId}/status` | 是 | 收藏状态 |
| POST | `/api/v1/adoptions` | 是 | 提交领养申请 |
| GET | `/api/v1/adoptions/mine` | 是 | 我的申请 |
| POST | `/api/v1/adoptions/{id}/withdraw` | 是 | 撤销 |
| POST | `/api/v1/feedback` | 是 | 意见反馈 |
| POST | `/api/v1/uploads` | 是 | 图片上传（multipart，字段 `file`） |
| POST | `/api/v1/submissions` | 是 | 提交动物投稿 |
| GET | `/api/v1/submissions/mine` | 是 | 我的投稿 |
| POST | `/api/v1/submissions/{id}/withdraw` | 是 | 撤回投稿 |
| GET | `/api/v1/admin/adoptions` | 管理员 | 申请审核队列 |
| POST | `/api/v1/admin/adoptions/{id}/approve` | 管理员 | 通过 |
| POST | `/api/v1/admin/adoptions/{id}/reject` | 管理员 | 驳回 |
| GET | `/api/v1/admin/submissions` | 管理员 | 投稿审核队列 |
| GET | `/api/v1/admin/submissions/{id}` | 管理员 | 投稿详情 |
| POST | `/api/v1/admin/submissions/{id}/approve` | 管理员 | 通过并生成动物 |
| POST | `/api/v1/admin/submissions/{id}/reject` | 管理员 | 驳回 |
| GET | `/api/v1/admin/animals` | 管理员 | 动物管理列表 |
| POST | `/api/v1/admin/animals` | 管理员 | 新增动物 |
| PUT | `/api/v1/admin/animals/{id}` | 管理员 | 编辑动物 |
| DELETE | `/api/v1/admin/animals/{id}` | 管理员 | 删除动物 |

响应统一为 `{ code, message, data }`，`code === 0` 成功。

## 前端联调

1. 后端启动后，把小程序 `config/index.js` 的 `mock` 改为 `false`；
2. `apiBase` 保持 `http://127.0.0.1:8080`；
3. 开发者工具「详情 → 本地设置」勾选不校验合法域名；
4. 开发版 `AUTH_MOCK=true` 时，任意 code 都会登录为同一个 mock 用户，便于反复测试。

## 云部署（云托管）

1. 同一份 `Dockerfile` 构建镜像；
2. 环境变量按 `.env.example` 配置，`AUTH_MOCK=false`，填 `WX_APPID` / `WX_SECRET`；
3. `STORAGE_TYPE=cos`，填 COS 四项配置；
4. 容器端口 8080，健康检查 `/api/v1/health`；
5. MySQL 使用云数据库，`DB_URL` 指向内网地址；
6. 首次启动 Flyway 自动建表。

## 待补

- 内容安全：投稿文字 `msgSecCheck`、图片 `mediaCheckAsync`（当前人工审核兜底，`sec_check` 字段已预留）；
- 公告、意见反馈、用户管理的后台接口；
- 管理员密码修改与多角色；
- 上传文件清理任务。
