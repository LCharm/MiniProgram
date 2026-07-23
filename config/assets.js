// config/assets.js — 素材占位符清单
// 标注规则：🔴P0核心必画 | 🟡P1代码已引用 | 🟠P2功能已有待接入 | ⚪P3纯预留占位

const BASE_CDN_URL = '120.27.144.30/miniprogram';

// ==================== 1. 全局通用 ⚪P3 ====================
// 全项目零引用，仅预留占位
const COMMON = {
  DEFAULT_AVATAR:  { fileName: 'default-avatar.png',  size: '100x100', desc: '用户默认头像', status: 'P3-预留' },
  EMPTY_STATE:     { fileName: 'empty-state.png',     size: '400x300', desc: '空状态插画', status: 'P3-预留' },
  LOADING_BG:      { fileName: 'loading-bg.png',      size: '750x1624', desc: '启动加载页背景', status: 'P3-预留' },
};

// ==================== 2. 药材图标（23 种）🔴P0 ====================
// 核心玩法资产，茶方合成 + 背包展示 + 盲盒掉落，必须全部绘制
// tier 仅标识稀有度，与图片无关；所有药材统一尺寸 120x120
const HERBS = {
  // ── SSR（3 种）珍稀名贵药材 ──
  renshen:    { fileName: 'herb-renshen.png',    name: '人参',   label: '人参', tier: 'SSR', desc: '大补元气、补脾益肺' },
  shihu:      { fileName: 'herb-shihu.png',      name: '石斛',   label: '石斛', tier: 'SSR', desc: '益胃生津、滋阴清热' },
  suanzaoren: { fileName: 'herb-suanzaoren.png', name: '酸枣仁', label: '枣仁', tier: 'SSR', desc: '养心安神、敛汗生津' },

  // ── SR（4 种）名贵药材 ──
  jinyinhua:  { fileName: 'herb-jinyinhua.png',  name: '金银花', label: '银花',   tier: 'SR', desc: '清热解毒、疏散风热' },
  danggui:    { fileName: 'herb-danggui.png',    name: '当归',   label: '当归',   tier: 'SR', desc: '补血活血、调经止痛' },
  maidong:    { fileName: 'herb-maidong.png',    name: '麦冬',   label: '麦冬',   tier: 'SR', desc: '养阴润肺、益胃生津' },
  pangdahai:  { fileName: 'herb-pangdahai.png',  name: '胖大海', label: '胖大海', tier: 'SR', desc: '清热润肺、利咽开音' },

  // ── R（7 种）常用精品药材 ──
  huangqi:    { fileName: 'herb-huangqi.png',    name: '黄芪',   label: '黄芪', tier: 'R', desc: '补气固表、利水消肿' },
  fuling:     { fileName: 'herb-fuling.png',     name: '茯苓',   label: '茯苓', tier: 'R', desc: '利水渗湿、健脾宁心' },
  chenpi:     { fileName: 'herb-chenpi.png',     name: '陈皮',   label: '陈皮', tier: 'R', desc: '理气健脾、燥湿化痰' },
  baihe:      { fileName: 'herb-baihe.png',      name: '百合',   label: '百合', tier: 'R', desc: '润肺止咳、清心安神' },
  shanzha:    { fileName: 'herb-shanzha.png',    name: '山楂',   label: '山楂', tier: 'R', desc: '消食化积、活血化瘀' },
  yiyiren:    { fileName: 'herb-yiyiren.png',    name: '薏苡仁', label: '薏仁', tier: 'R', desc: '利水渗湿、健脾止泻' },
  juemingzi:  { fileName: 'herb-juemingzi.png',  name: '决明子', label: '决明', tier: 'R', desc: '清肝明目、润肠通便' },

  // ── N（9 种）药食同源基础药材（永久解锁）──
  boju:       { fileName: 'herb-boju.png',       name: '亳菊',   label: '菊',   tier: 'N', desc: '散风清热、平肝明目' },
  gouqi:      { fileName: 'herb-gouqi.png',      name: '枸杞',   label: '杞',   tier: 'N', desc: '滋补肝肾、益精明目' },
  sangye:     { fileName: 'herb-sangye.png',     name: '桑叶',   label: '桑叶', tier: 'N', desc: '疏散风热、清肝明目' },
  gancao:     { fileName: 'herb-gancao.png',     name: '甘草',   label: '甘草', tier: 'N', desc: '补脾益气、清热解毒' },
  dazao:      { fileName: 'herb-dazao.png',      name: '大枣',   label: '大枣', tier: 'N', desc: '补中益气、养血安神' },
  chixiaodou: { fileName: 'herb-chixiaodou.png', name: '赤小豆', label: '赤豆', tier: 'N', desc: '利水消肿、解毒排脓' },
  bohe:       { fileName: 'herb-bohe.png',       name: '薄荷',   label: '薄荷', tier: 'N', desc: '疏散风热、清利咽喉' },
  meiguihua:  { fileName: 'herb-meiguihua.png',  name: '玫瑰花', label: '玫瑰', tier: 'N', desc: '疏肝理气、活血化瘀' },
  heye:       { fileName: 'herb-heye.png',       name: '荷叶',   label: '荷叶', tier: 'N', desc: '清热化湿、升清降浊' },
};

// ==================== 3. 分享卡片图（7 个分享入口）🟠P2 ====================
// 微信分享图要求 5:4，建议 500x400 或 750x600
// REPORT 已在 report.js:164 引用，其余页面 onShareAppMessage 未接自定义图
const SHARE = {
  DEFAULT:      { fileName: 'share-default.png',     size: '750x600', desc: '全局默认分享（兜底）', status: 'P2-待接入' },
  REPORT:       { fileName: 'share-report.png',      size: '750x600', desc: '体质报告分享（report.js 已引用）', status: 'P1-已接入' },
  HUATUO:       { fileName: 'share-huatuo.png',      size: '750x600', desc: '华佗AI问诊分享（huatuo页 未接）', status: 'P2-待接入' },
  BRAIN_SOLO:   { fileName: 'share-brain-solo.png',  size: '750x600', desc: '脑洞答题单人分享（brain页 未接）', status: 'P2-待接入' },
  BRAIN_BATTLE: { fileName: 'share-brain-battle.png', size: '750x600', desc: '脑洞邀战分享（brain页 未接）', status: 'P2-待接入' },
  BATTLE_WIN:   { fileName: 'share-battle-win.png',   size: '750x600', desc: '对战结算分享（battle/settle 未接）', status: 'P2-待接入' },
  HEALTH_RANK:  { fileName: 'share-health-rank.png',  size: '750x600', desc: '健康首页段位分享（health页 未接）', status: 'P2-待接入' },
};

// ==================== 4. 头像 🟠P2 ====================
// 功能已存在但未接图片：华佗聊天用文字"佗"替代，用户头像用微信默认
const AVATAR = {
  HUATUO:       { fileName: 'avatar-huatuo.png',       size: '200x200', desc: '华佗AI顾问头像', status: 'P2-待接入' },
  USER_DEFAULT: { fileName: 'avatar-user-default.png', size: '200x200', desc: '用户默认头像', status: 'P2-待接入' },
};

// ==================== 5. 游戏/资产模块 ====================
// P1: MAP_MARKER (huatuo.js:287)
// P2: 段位图标（后端6段位已定义，CSS有样式，PNG未接）| 华佗卡（cardBook页已存在，图未接）| 盲盒关闭态（health页有UI）
// P3: 卡片册预留卡 + 盲盒动画帧
const GAME = {
  // ── 段位图标（后端 RANK_TIERS 6段位对应）🟠P2 ──
  RANK_APPRENTICE:  { fileName: 'rank-apprentice.png',  size: '80x80', desc: '段位 - 养生学徒', status: 'P2-待接入' },
  RANK_BRONZE:      { fileName: 'rank-bronze.png',      size: '80x80', desc: '段位 - 青铜行者', status: 'P2-待接入' },
  RANK_SILVER:      { fileName: 'rank-silver.png',      size: '80x80', desc: '段位 - 白银药师', status: 'P2-待接入' },
  RANK_GOLD:        { fileName: 'rank-gold.png',         size: '80x80', desc: '段位 - 黄金医士', status: 'P2-待接入' },
  RANK_EMERALD:     { fileName: 'rank-emerald.png',     size: '80x80', desc: '段位 - 翡翠圣医', status: 'P2-待接入' },
  RANK_KING:        { fileName: 'rank-king.png',        size: '80x80', desc: '段位 - 华佗王者', status: 'P2-待接入' },

  // ── 卡片册 ──
  CARD_HUATUO:       { fileName: 'card-huatuo.png',       size: '300x450', desc: '卡牌 - 华佗卡',       status: 'P2-待接入' },
  CARD_BOJU:         { fileName: 'card-boju.png',         size: '300x450', desc: '卡牌 - 亳菊卡',       status: 'P3-预留' },
  CARD_SHENGNONG:    { fileName: 'card-shengnong.png',    size: '300x450', desc: '卡牌 - 神农卡',       status: 'P3-预留' },
  CARD_LISHIZHEN:    { fileName: 'card-lishizhen.png',    size: '300x450', desc: '卡牌 - 李时珍卡',     status: 'P3-预留' },

  // ── 盲盒 ──
  BLINDBOX_CLOSED:   { fileName: 'blindbox-closed.png',   size: '200x200', desc: '盲盒 - 未开启状态',   status: 'P2-待接入' },
  BLINDBOX_OPENING:  { fileName: 'blindbox-opening.png',  size: '200x200', desc: '盲盒 - 开启动画帧',   status: 'P3-预留' },

  // ── 地图 🟡P1 ──
  MAP_MARKER:        { fileName: 'marker-lantern.png',    size: '64x64',   desc: '地图标记 - 景点灯笼', status: 'P1-已接入' },
};

module.exports = {
  BASE_CDN_URL,
  COMMON,
  HERBS,
  SHARE,
  AVATAR,
  GAME,
};
