// pages/user/settings/settings.js
const app = getApp();

Page({
  data: {
    currentTheme: 'warm',
    themeIndex: 0,
    themes: [
      { name: '暖金棕', id: 'warm', colors: ['#1a1412', '#302621'] },
      { name: '白天', id: 'day', colors: ['#f2efe8', '#ffffff'] },
    ],
    nickName: '',
  },

  onLoad() {
    const theme = app.globalData.theme || 'warm';
    const idx = this.data.themes.findIndex(t => t.id === theme);
    this.setData({
      currentTheme: theme,
      themeIndex: idx >= 0 ? idx : 0,
    });
    app.updateNavigationBar(theme);
    const nick = wx.getStorageSync('userNickName') || '';
    this.setData({ nickName: nick });
  },

  selectTheme(e) {
    const idx = e.currentTarget.dataset.idx;
    const theme = this.data.themes[idx];
    this.setData({ themeIndex: idx, currentTheme: theme.id });
    app.switchTheme(theme.id);
    wx.showToast({ title: '已切换皮肤', icon: 'success' });
  },

  onNickInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  saveNick() {
    wx.setStorageSync('userNickName', this.data.nickName);
    wx.showToast({ title: '昵称已保存', icon: 'success' });
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后需重新授权登录',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('access_token');
          wx.showToast({ title: '已退出', icon: 'none' });
          setTimeout(() => wx.switchTab({ url: '/pages/user/user' }), 800);
        }
      }
    });
  },
});
