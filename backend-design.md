# 柒辰科技 · AI 养生小程序 — 后端架构设计

> 当前状态：前端小程序 97 源文件，Mock 模式运行中（`USE_MOCK = true`，49 条 Mock 路由）。
> 目标：将后端从 Mock 切换为真实服务，支撑 C 端用户全流程。

---

## 1. 技术选型

| 决策项 | 推荐方案 | 理由 |
|--------|---------|------|
| **后端框架** | **Python FastAPI** 或 Node.js Nest.js | FastAPI 对接 AI 模型天然优势；Nest.js 与前端 TypeScript 共享类型 |
| **数据库** | **PostgreSQL 15** | 用户、订单、游戏资产等强关系型数据；丰富 JSON 字段支持灵活扩展 |
| **缓存** | **Redis 7** | 排行榜、会话、短信验证码、热门数据缓存 |
| **文件存储** | **腾讯云 COS** | 舌象图片、用户头像；与腾讯生态网络延迟最低 |
| **AI 推理** | **DeepSeek API** 或通义千问 | 华佗问诊对话、AI 茶方生成；国产模型合规且性价比高 |
| **部署** | **腾讯云 CVM + Docker Compose** | 就近部署，微信生态网络延迟低 |
| **CI/CD** | **GitHub Actions → 自动构建推送** | 代码推送到 Docker Registry，服务器自动拉取重启 |

---

## 2. 完整 API 接口清单

根据现有 services/ 层提取，共 **~45 个接口**，按领域分组：

### 2.1 用户模块 (`/user`)

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| POST | `/user/wxLogin` | 微信 code 换 token | `request.js` login() |
| GET | `/user/getUserInfo` | 获取当前用户信息 | `services/health.js` |
| PUT | `/user/update` | 更新昵称/手机/体质等 | `mock.js` 动态路由 |
| GET | `/user/getPhysicalTypes` | 获取九种体质量表 | `mock.js` |

### 2.2 体质测评模块 (`/physical`, `/tongue`, `/report`)

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| GET | `/physical/getQuestionList` | 获取测评问卷题目 | `services/health.js` |
| POST | `/physical/submitAnswer` | 提交答卷 → 返回体质类型 | `services/health.js` |
| POST | `/physical/generateReport` | 综合问卷+舌象→生成报告 | `services/health.js` |
| GET | `/physical/getTestHistory` | 历史测评记录 | `services/health.js` |
| POST | `/tongue/uploadAndAnalyse` | 上传舌象图片 → AI 分析 | `services/health.js` |
| GET | `/report/get` | 获取最新养生报告 | `mock.js` |
| POST | `/report/generate` | 生成/刷新养生报告 | `mock.js` |

### 2.3 花茶配方模块 (`/tea`)

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| GET | `/tea/getHotFormula` | 热门茶方列表 | `services/tea.js` |
| GET | `/tea/getFormulaBySymptom` | 按症状匹配茶方 | `services/tea.js` |
| GET | `/tea/getFormulaByPhysical` | 按体质匹配茶方 | `services/tea.js` |
| POST | `/tea/aiCreateFormula` | AI 根据选材创建新茶方 | `services/tea.js` |
| POST | `/tea/collectFormula` | 收藏/取消收藏茶方 | `services/tea.js` |
| GET | `/tea/getMyCollect` | 我的收藏列表 | `services/tea.js` |
| POST | `/tea/setDrinkRemind` | 设置饮茶提醒 | `services/tea.js` |
| GET | `/tea/getMaterialList` | 药材素材总库 | `services/tea.js` |
| GET | `/tea/getContestList` | 茶方大赛列表 | `services/tea.js` |
| POST | `/tea/submitContest` | 提交参赛茶方 | `services/tea.js` |

### 2.4 华佗问诊模块 (`/huatuo`)

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| POST | `/huatuo/chat` | 发送消息 → AI 回复 | `mock.js` |
| GET | `/huatuo/chat/history` | 历史对话记录 | **新增（前端 pages/huatuo 需要）** |
| DELETE | `/huatuo/chat/clear` | 清空对话 | **新增** |

### 2.5 游戏模块 (`/game`)

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| GET | `/game/getUserRank` | 当前用户段位信息 | `services/game.js` |
| POST | `/game/submitStagePass` | 提交闯关结果 | `services/game.js` |
| POST | `/game/openBlindBox` | 开启每日盲盒 | `services/game.js` |
| GET | `/game/getDailyTasks` | 每日任务列表 | `services/game.js` |
| POST | `/game/completeTask` | 提交任务完成 | `services/game.js` |
| POST | `/game/startPK` | 发起实时 PK | `services/game.js` |
| GET | `/game/getRankList` | 全站排行榜 | `services/game.js` |
| GET | `/game/getCardBook` | 卡牌图鉴 | `services/game.js` |
| POST | `/game/synthesizeMaterial` | 合成药材碎片 | `services/game.js` |
| POST | `/game/exchangePoints` | 积分兑换 | `services/game.js` |
| GET | `/game/getUserMaterialPieces` | 用户药材碎片 | `services/tea.js` 复用 |
| GET | `/game/stages` | 闯关秘境列表 | `mock.js` |
| GET | `/game/dungeon/questions` | 秘境题库 | `mock.js` |
| GET | `/game/brain/questions` | 脑洞答题题库 | `mock.js` |
| GET | `/game/story` | 华佗奇遇记剧情 | `mock.js` |

### 2.6 会员支付模块 (`/vip`, `/order`)

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| GET | `/vip/tiers` | 会员套餐信息 | `mock.js` |
| POST | `/vip/createVipOrder` | 创建支付订单 → 返回 prepay 参数 | `services/payment.js` |
| GET | `/order/queryStatus` | 查询支付状态 | `services/payment.js` |
| POST | `/order/payCallback` | **微信支付回调** (服务端→服务端) | **新增** |

### 2.7 辅助模块

| 方法 | 路径 | 说明 | 前端来源 |
|------|------|------|----------|
| POST | `/clock/submitClock` | 健康打卡 | `services/health.js` |
| GET | `/station/getNearStation` | 附近养生驿站 | `services/health.js` |
| GET | `/knowledge/solarTermInfo` | 当季节气养生知识 | `services/health.js` |

---

## 3. 数据库核心表设计

### 3.1 用户相关

```sql
-- 用户主表
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    openid          VARCHAR(64) UNIQUE NOT NULL,     -- 微信 openid
    unionid         VARCHAR(64),                      -- 微信 unionid (多平台统一)
    nickname        VARCHAR(64) DEFAULT '',
    avatar_url      VARCHAR(512) DEFAULT '',
    phone           VARCHAR(20) DEFAULT '',
    sex             SMALLINT DEFAULT 0,               -- 0未知 1男 2女
    age             SMALLINT,
    city            VARCHAR(64) DEFAULT '',

    -- 游戏属性
    power           INT DEFAULT 100,                  -- 灵力值
    level           INT DEFAULT 1,                    -- 段位等级
    level_title     VARCHAR(32) DEFAULT '青铜药师',
    spirit          INT DEFAULT 0,                    -- 精神力
    cards_collected INT DEFAULT 0,                    -- 已收集卡牌数
    checkin_days    INT DEFAULT 0,                    -- 累计打卡天数
    consecutive_days INT DEFAULT 0,                   -- 连续打卡天数

    -- 会员
    is_vip          BOOLEAN DEFAULT FALSE,
    vip_expire_at   TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 用户体质记录
CREATE TABLE user_physicals (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    physical_type_id INT NOT NULL,                    -- 1-9 对应九种体质
    physical_name   VARCHAR(32) NOT NULL,             -- 如"痰湿体质"
    sub_types       JSONB DEFAULT '[]',               -- 亚型 ["痰湿夹热"]
    score           INT,                              -- 测评得分
    source          VARCHAR(16) DEFAULT 'questionnaire', -- questionnaire/tongue/composite
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 体质测评与报告

```sql
-- 问卷题目
CREATE TABLE quiz_questions (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(256) NOT NULL,
    options         JSONB NOT NULL,                   -- ["从不","偶尔","经常","总是"]
    dimension       VARCHAR(32),                      -- 关联到哪种体质维度
    sort_order      INT DEFAULT 0
);

-- 用户答卷记录
CREATE TABLE quiz_answers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    answer_list     JSONB NOT NULL,                   -- [{questionId, userAnswer}]
    result_type_id  INT,                              -- 判定体质ID
    result_name     VARCHAR(32),
    confidence      DECIMAL(5,2),                     -- 置信度
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 养生报告
CREATE TABLE health_reports (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    physical_type   VARCHAR(32),
    modules         JSONB NOT NULL,                   -- 七大模块 JSON (茶饮/饮食/运动/...)
    generated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 花茶配方

```sql
-- 茶方主表
CREATE TABLE tea_formulas (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    fit             VARCHAR(256),                     -- 适宜症状描述
    physical_types  SMALLINT[],                       -- 适配体质ID数组
    ingredients     JSONB NOT NULL,                   -- [{name,amount}] 药材清单
    brew_method     VARCHAR(256),                     -- 泡法
    drink_advice    VARCHAR(256),                     -- 饮用建议
    warning         VARCHAR(256),                     -- 注意事项
    is_ai_created   BOOLEAN DEFAULT FALSE,            -- 是否AI生成
    creator_id      BIGINT REFERENCES users(id),
    hot_score       INT DEFAULT 0,                    -- 热度分
    badge           VARCHAR(32) DEFAULT '',           -- 标签"推荐""爆款"
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 用户收藏
CREATE TABLE user_collections (
    user_id         BIGINT REFERENCES users(id),
    formula_id      INT REFERENCES tea_formulas(id),
    collected_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, formula_id)
);

-- 饮茶提醒
CREATE TABLE drink_reminds (
    user_id         BIGINT REFERENCES users(id),
    formula_id      INT REFERENCES tea_formulas(id),
    remind_time     TIME NOT NULL,                    -- 提醒时间 如 09:00
    is_active       BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_id, formula_id)
);

-- 茶方大赛
CREATE TABLE tea_contests (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(256) NOT NULL,
    description     TEXT,
    deadline        TIMESTAMPTZ NOT NULL,
    reward          VARCHAR(128),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contest_entries (
    contest_id      INT REFERENCES tea_contests(id),
    user_id         BIGINT REFERENCES users(id),
    formula_data    JSONB NOT NULL,
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (contest_id, user_id)
);
```

### 3.4 游戏系统

```sql
-- 闯关秘境关卡
CREATE TABLE game_stages (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    icon            VARCHAR(8),
    required_power  INT DEFAULT 0,
    sort_order      INT DEFAULT 0
);

-- 用户闯关记录
CREATE TABLE user_stage_progress (
    user_id         BIGINT REFERENCES users(id),
    stage_id        INT REFERENCES game_stages(id),
    status          VARCHAR(16) DEFAULT 'locked',    -- locked / unlocked / passed
    best_score      INT DEFAULT 0,
    cleared_at      TIMESTAMPTZ,
    PRIMARY KEY (user_id, stage_id)
);

-- 每日任务
CREATE TABLE daily_tasks (
    id              SERIAL PRIMARY KEY,
    task_type       VARCHAR(32) NOT NULL,             -- sleep/water/exercise/quiz/share
    label           VARCHAR(128) NOT NULL,
    reward          INT DEFAULT 10,
    template_id     VARCHAR(64),                      -- 订阅消息模板ID
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_daily_tasks (
    user_id         BIGINT REFERENCES users(id),
    task_id         INT REFERENCES daily_tasks(id),
    task_date       DATE NOT NULL,
    completed       BOOLEAN DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    PRIMARY KEY (user_id, task_id, task_date)
);

-- 盲盒
CREATE TABLE box_rewards (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    icon            VARCHAR(8),
    reward_type     VARCHAR(32),                      -- card/money/spirit/coupon
    amount          INT,
    rarity          SMALLINT DEFAULT 1                -- 1普通 2稀有 3传说
);

-- 卡牌系统
CREATE TABLE cards (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    icon            VARCHAR(8),
    category_id     INT,
    rarity          SMALLINT DEFAULT 1,
    description     VARCHAR(256)
);

CREATE TABLE user_cards (
    user_id         BIGINT REFERENCES users(id),
    card_id         INT REFERENCES cards(id),
    pieces          INT DEFAULT 1,                    -- 碎片数量
    acquired_at     TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, card_id)
);

-- PK 对战记录
CREATE TABLE battle_records (
    id              BIGSERIAL PRIMARY KEY,
    challenger_id   BIGINT REFERENCES users(id),
    opponent_id     BIGINT REFERENCES users(id),
    player_score    INT,
    opponent_score  INT,
    result          VARCHAR(16),                      -- win/lose/draw
    battled_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 故事剧情进度
CREATE TABLE story_progress (
    user_id         BIGINT REFERENCES users(id),
    chapter_id      INT NOT NULL,
    scene_id        VARCHAR(32) NOT NULL,
    choice_made     INT,                              -- 用户选择
    reward_earned   INT DEFAULT 0,
    played_at       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, chapter_id, scene_id)
);
```

### 3.5 会员与支付

```sql
-- 会员套餐
CREATE TABLE vip_tiers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL,
    price           DECIMAL(10,2) NOT NULL,           -- 单位：元
    period          VARCHAR(16) NOT NULL,             -- month/quarter/year
    period_days     INT NOT NULL,                     -- 对应天数
    benefits        JSONB NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE
);

-- 订单
CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    order_no        VARCHAR(32) UNIQUE NOT NULL,      -- 订单号
    user_id         BIGINT REFERENCES users(id),
    tier_id         INT REFERENCES vip_tiers(id),
    amount          DECIMAL(10,2) NOT NULL,
    status          VARCHAR(16) DEFAULT 'pending',    -- pending/paid/refunded/closed
    prepay_id       VARCHAR(64),                      -- 微信预支付ID
    transaction_id  VARCHAR(64),                      -- 微信支付流水号（支付成功后回填）
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.6 华佗对话

```sql
-- 对话会话
CREATE TABLE chat_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    title           VARCHAR(128) DEFAULT '新对话',
    message_count   INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 对话消息
CREATE TABLE chat_messages (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT REFERENCES chat_sessions(id),
    role            VARCHAR(16) NOT NULL,             -- user / assistant
    content         TEXT NOT NULL,
    tokens_used     INT,                              -- token消耗
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. 关键技术设计

### 4.1 微信登录与会话管理

```
小程序端                             后端服务                         微信服务
   │                                   │                              │
   ├─ wx.login() ────────────────────────────────────────────────────→│
   │                                   │                      返回 code │
   │──── POST /user/wxLogin {code} ──→│                              │
   │                                   │── code2Session(code) ───────→│
   │                                   │                      openid, │
   │                                   │                      unionid  │
   │                                   │                              │
   │                                   │── 查/建 users 表              │
   │                                   │── 签发 JWT (access+refresh)   │
   │←─── { token, userInfo } ────────│                              │
   │                                   │                              │
   │── 后续请求 Header:              │                              │
   │   Authorization: Bearer <JWT>  │                              │
```

- **JWT 策略**：access_token 15分钟 + refresh_token 7天（存 Redis）
- **token 过期** → 返回 401 → 前端 `request.js` 自动调 `login()` 刷新

### 4.2 AI 华佗问诊 — SSE 流式回复

```
小程序端                         后端服务                     AI 模型 API
   │                               │                              │
   │── POST /huatuo/chat ──────→│                              │
   │   {message, sessionId}       │                              │
   │                               │── 查历史 N 轮对话              │
   │                               │── 拼 System Prompt            │
   │                               │── POST DeepSeek(stream) ────→│
   │                               │←── SSE chunk ──────────────│
   │←── SSE data: chunk ────────│                              │
   │←── SSE data: chunk ────────│                              │
   │←── SSE data: [DONE] ──────│                              │
   │                               │── 保存对话记录到 chat_messages  │
```

- 小程序端用 **`wx.request` 的 `enableChunked`** 接收流式响应
- System Prompt 固化华佗人设：亳州名医 + 养生知识 + 中药药理 + 限医疗建议声明

### 4.3 AI 花茶配方生成

```
POST /tea/aiCreateFormula
body: { materialIds: [1, 3, 7], season: "summer", crowd: "熬夜人群" }

→ 构造 prompt: "你是一位亳州资深茶方师。用户选择了以下药材：亳菊、山楂、白芍。
   当前夏季，目标人群为熬夜人群。请设计一款花茶配方，格式：{name, ingredients, brew, drink, warning}"

→ AI 返回 structured JSON → validate & deduplicate → 入 tea_formulas 表
```

### 4.4 舌象 AI 识别

```
POST /tongue/uploadAndAnalyse  (multipart: imageFile)

→ 上传到腾讯云 COS (生成 fileKey)
→ 调 AI 视觉模型 (如 DeepSeek-Vision 或专用舌诊模型):
   "请根据中医舌诊理论分析这张舌象：舌色、舌苔、舌体形态，判断体质倾向"
→ 返回 { physicalType, confidence, analysis }
```

### 4.5 微信支付完整流程

```
小程序端                    后端服务                         微信支付
   │                          │                               │
   │── POST /vip/createVipOrder {vipType} ──→│              │
   │                          │── 创 orders 记录                │
   │                          │── POST 微信统一下单 ────────→│
   │                          │←── prepay_id ─────────────│
   │←── {timeStamp, nonceStr,│                               │
   │     package, paySign} ──│                               │
   │                          │                               │
   │── wx.requestPayment() ─────────────────────────────────→│
   │←── 支付成功/取消 ─────────────────────────────────│
   │                          │                               │
   │                          │←── POST /order/payCallback ──│
   │                          │     (微信服务器回调)              │
   │                          │── 验签 → 更新 orders.status     │
   │                          │── 更新 users.is_vip=true       │
   │                          │── 入 user_vip_history          │
```

### 4.6 排行榜（Redis Sorted Set）

```javascript
// 每次灵力值变化时
redis.zadd('rank:power', userId, newPower);

// 查询 TOP 50
redis.zrevrange('rank:power', 0, 49, 'WITHSCORES');

// 查询某用户排名
redis.zrevrank('rank:power', userId);
```

---

## 5. 后端项目结构（推荐 FastAPI 版本）

```
backend/
├── app/
│   ├── main.py                  # FastAPI app 入口，路由注册
│   ├── config.py                # 配置中心（环境变量校验）
│   ├── dependencies.py          # 依赖注入（DB session, 当前用户）
│   │
│   ├── middleware/
│   │   ├── auth.py              # JWT 鉴权中间件
│   │   ├── rate_limit.py        # 限流
│   │   └── error_handler.py     # 全局异常处理
│   │
│   ├── domains/                  # 业务领域（feature-first 结构）
│   │   ├── user/
│   │   │   ├── router.py        # /user/* 路由
│   │   │   ├── service.py       # 业务逻辑
│   │   │   ├── repository.py    # 数据访问
│   │   │   └── schemas.py       # Pydantic 请求/响应模型
│   │   │
│   │   ├── assessment/           # 体质测评+报告+舌象
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── tea/                  # 花茶配方
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   └── ...
│   │   │
│   │   ├── consultation/         # 华佗问诊
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── ai_client.py     # AI 模型调用封装
│   │   │   └── prompts.py       # System Prompt 模板库
│   │   │
│   │   ├── game/                 # 游戏系统
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── dungeon.py       # 秘境逻辑
│   │   │   ├── blindbox.py      # 盲盒抽奖
│   │   │   └── leaderboard.py   # 排行榜
│   │   │
│   │   └── payment/              # 会员&支付
│   │       ├── router.py
│   │       ├── service.py
│   │       └── wechatpay.py     # 微信支付 SDK 封装
│   │
│   ├── shared/
│   │   ├── database.py           # SQLAlchemy async engine
│   │   ├── redis.py              # Redis 连接池
│   │   ├── cos.py                # COS 上传封装
│   │   ├── exceptions.py         # 自定义异常类
│   │   └── logger.py             # 结构化日志
│   │
│   └── models/                   # SQLAlchemy ORM 模型
│       ├── user.py
│       ├── assessment.py
│       ├── tea.py
│       ├── game.py
│       └── payment.py
│
├── alembic/                      # 数据库迁移
│   └── versions/
├── tests/
├── docker-compose.yml            # PostgreSQL + Redis + App
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 6. 部署方案

### 开发阶段 → 生产阶段渐进路径

```
阶段一 (MVP，1-2 周)：
  ├─ 单台 腾讯云 CVM 2C4G
  ├─ PostgreSQL + Redis 同机部署
  ├─ Docker Compose 一键启动
  └─ Nginx 反向代理 + Let's Encrypt HTTPS

阶段二 (用户增长)：
  ├─ 数据库分离 → 腾讯云 CDB PostgreSQL
  ├─ Redis 分离 → 腾讯云 Redis
  ├─ AI 服务独立部署 (GPU 实例)
  └─ 加监控 (Prometheus + Grafana)

阶段三 (规模化)：
  ├─ CVM 集群 + CLB 负载均衡
  ├─ 读写分离 (主从 PostgreSQL)
  └─ CDN 加速静态资源
```

### 一键启动命令

```bash
# 开发环境
docker compose up -d

# 数据库迁移
docker compose exec app alembic upgrade head

# 导入种子数据（体质、茶方、药材、VIP套餐）
docker compose exec app python seed.py
```

---

## 7. 与小程序前端的对接步骤

1. **部署后端** → 上线到 `https://api.qichenkj.com`
2. **微信后台配置** → request 合法域名添加 `api.qichenkj.com`
3. **切换 Mock 关闭** → 改 `utils/request.js` 第 2 行：`const USE_MOCK = false;`
4. **微信支付配置** → 商户号 mchid、APIv3 密钥、支付回调 URL
5. **订阅消息** → 在微信后台申请模板 ID，填入 `server.js`
6. **真机调试** → 扫码预览，验证登录→测评→茶方→游戏全流程

---

## 8. 关键技术风险与对策

| 风险 | 对策 |
|------|------|
| AI 回复延迟高（华佗问诊） | 用 SSE 流式输出 + 前端打字机效果掩盖延迟 |
| AI 回复内容不合规 | System Prompt 严格约束"仅供参考，不适请就医"；接入微信 `msgSecCheck` |
| 微信支付回调丢失 | 订单轮询 + 超时自动关闭 + 用户手动查询 |
| 舌象识别准确率低 | 先上线问卷为主 + 舌象辅助，收集数据后微调专项模型 |
| 排行榜并发写入 | Redis Sorted Set + 定时刷入 PostgreSQL（每 5 分钟） |
