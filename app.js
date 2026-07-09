// app.js - 柒辰科技 · AI养生小程序 全局入口
const { login } = require('./utils/request');

const NAV_BAR_CONFIG = {
  default: { bg: '#0f0f18', text: '#ffffff' },
  night:   { bg: '#080810', text: '#ffffff' },
  warm:    { bg: '#120d08', text: '#ffffff' },
  day:     { bg: '#f2efe8', text: '#000000' },
};

App({
  globalData: {
    userInfo: null,
    isVip: false,
    theme: 'default',
  },

  onLaunch() {
    const saved = wx.getStorageSync('userTheme');
    if (saved && NAV_BAR_CONFIG[saved]) {
      this.globalData.theme = saved;
    }
    this.updateNavigationBar(this.globalData.theme);
    this.autoLogin();
  },

  /** 自动登录 */
  async autoLogin() {
    try {
      const userInfo = await login();
      this.globalData.userInfo = userInfo;
    } catch (e) {
      console.error('[App] 登录失败，使用游客模式', e);
    }
  },

  /** 刷新用户信息 */
  setUserInfo(info) {
    this.globalData.userInfo = { ...this.globalData.userInfo, ...info };
  },

  /** 切换主题 */
  switchTheme(themeName) {
    if (!NAV_BAR_CONFIG[themeName]) return;
    this.globalData.theme = themeName;
    wx.setStorageSync('userTheme', themeName);
    this.updateNavigationBar(themeName);
  },

  /** 根据主题修改原生导航栏 */
  updateNavigationBar(theme) {
    const cfg = NAV_BAR_CONFIG[theme] || NAV_BAR_CONFIG.default;
    wx.setNavigationBarColor({
      frontColor: cfg.text,
      backgroundColor: cfg.bg,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  },
});
