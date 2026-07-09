// config/assets.js

// 演示阶段使用 dummyimage 动态生成带颜色的占位图
// 后期直接将此处替换为你的阿里云 OSS 或 CDN 域名
const BASE_OSS_URL = 'https://dummyimage.com';

module.exports = {
  // 1. 全局通用
  COMMON: {
    DEFAULT_AVATAR: `${BASE_OSS_URL}/100x100/16213e/e8a838&text=User`,
    EMPTY_STATE: `${BASE_OSS_URL}/400x300/1a1a2e/a89880&text=Empty`,
    LOADING_BG: `${BASE_OSS_URL}/750x1624/0f0f18/e8a838&text=Loading`
  },

  // 2. 花茶模块 - 药材与茶方图
  HERBS: {
    BOJU: `${BASE_OSS_URL}/120x120/1a2530/4ecdc4&text=Boju`,
    GOUQI: `${BASE_OSS_URL}/120x120/1a2530/ff6b9d&text=Gouqi`,
    CHENPI: `${BASE_OSS_URL}/120x120/1a2530/e8a838&text=Chenpi`,
    JUEMINGZI: `${BASE_OSS_URL}/120x120/1a2530/a855f7&text=Juemingzi`
  },

  // 3. 游戏与资产模块 - 秘境卡牌与段位图标
  GAME: {
    RANK_BRONZE: `${BASE_OSS_URL}/80x80/2d1b69/e8a838&text=Bronze`,
    RANK_SILVER: `${BASE_OSS_URL}/80x80/2d1b69/e8a838&text=Silver`,
    CARD_HUATUO: `${BASE_OSS_URL}/300x450/16213e/e8a838&text=HuaTuo_Card`,
    BLINDBOX_CLOSED: `${BASE_OSS_URL}/200x200/1a1a2e/4ecdc4&text=Box`
  }
};
