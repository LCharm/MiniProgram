// pages/user/user.js - 个人中心
const { request } = require('../../utils/request');
const { getBackpack } = require('../../services/user');

const PHYSICAL_EMOJI = {
  '平和质': '✨', '气虚质': '😮‍💨', '阳虚质': '🥶', '阴虚质': '🔥',
  '痰湿质': '💧', '湿热质': '🌡️', '血瘀质': '🫀', '气郁质': '😔', '特禀质': '🤧'
};

Page({
  data: {
    currentTheme: 'warm',
    isLogin: false,
    nickName: '',
    totalPower: 0,
    spiritualEnergy: 0,
    currentRank: '暂无',
    physicalType: '',
    physicalEmoji: '',
    cardCount: 0,
    checkinDays: 0,
    couponCount: 0,
    memberExpiry: '',
    isVip: false
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this._syncNavBar();
    this.setData({ nickName: wx.getStorageSync('userNickName') || '' });
    const token = wx.getStorageSync('access_token');
    if (token) {
      this.setData({ isLogin: true });
    }
    this.loadLocalData();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this._syncNavBar();
    this.setData({ nickName: wx.getStorageSync('userNickName') || '' });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4, currentTheme: getApp().globalData.theme });
    }
    const token = wx.getStorageSync('access_token');
    if (token) {
      this.setData({ isLogin: true });
      this.fetchUserStats();
    }
    this.loadLocalData();
  },

  _syncNavBar() {
    const isDay = getApp().globalData.theme === 'day';
    wx.setNavigationBarColor({
      frontColor: isDay ? '#000000' : '#ffffff',
      backgroundColor: isDay ? '#f2efe8' : '#2d1b4e',
    });
  },

  async loadLocalData() {
    try {
      const res = await request({ url: '/physical/latest' });
      if (res) {
        const ptype = res.name || res.major_type || '';
        this.setData({
          physicalType: ptype,
          physicalEmoji: PHYSICAL_EMOJI[ptype] || '💧'
        });
      }
    } catch (e) {
      this.setData({ physicalType: '', physicalEmoji: '' });
    }

    try {
      const backpack = await getBackpack();
      const couponCount = (backpack && backpack.vouchers) ? backpack.vouchers.length : 0;
      this.setData({ couponCount });
    } catch (e) {
      this.setData({ couponCount: 0 });
    }
  },

  async handleLogin() {
    try {
      wx.showLoading({ title: '登录中' });

      const { code } = await wx.login();

      try {
        const res = await request({
          url: '/user/wxLogin',
          method: 'POST',
          data: { code }
        });
        wx.setStorageSync('access_token', res.token);
      } catch (err) {
        wx.setStorageSync('access_token', 'mock_token_123');
      }

      this.setData({ isLogin: true });
      this.fetchUserStats();

      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });

    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '登录异常', icon: 'error' });
    }
  },

  async fetchUserStats() {
    try {
      const res = await request({
        url: '/game/stats/update',
        method: 'POST',
        data: {}
      });
      const expiry = res.member_expiry || '';
      this.setData({
        totalPower: res.total_power || 1050,
        spiritualEnergy: res.spiritual_energy || 320,
        currentRank: res.current_rank || '青铜二段',
        cardCount: res.card_count || 3,
        checkinDays: res.checkin_days || 15,
        memberExpiry: expiry,
        isVip: expiry ? new Date(expiry.replace(/\//g, '-')) > new Date() : false,
      });
    } catch (err) {
      this.setData({
        totalPower: 1250,
        spiritualEnergy: 480,
        currentRank: '白银药师',
        cardCount: 3,
        checkinDays: 15,
      });
    }
  },

  async goToPhysicalReport() {
    try {
      const res = await request({ url: '/physical/latest' });
      if (res) {
        wx.showModal({
          title: res.name,
          content: `转化分：${res.score}\n测评日期：${res.date}\n\n详细数据请查看健康报告`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    } catch (e) {
      wx.showToast({ title: '请先完成体质测评', icon: 'none' });
    }
  },

  goToBackpack() {
    wx.navigateTo({ url: '/pages/user/backpack/backpack' });
  },

  goToCollectedTeas() {
    wx.navigateTo({ url: '/pages/tea/collect/collect' });
  },

  goToCardBook() {
    wx.navigateTo({ url: '/pages/user/cardBook/cardBook' });
  },

  goToSettings(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },

  goToMemberCenter() {
    wx.showToast({ title: '功能规划中，敬请期待', icon: 'none' });
  },

  goToRankList() {
    wx.navigateTo({ url: '/pages/user/rank/rank' });
  },

  goToQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' });
  },

  goToNearbyStation() {
    wx.showToast({ title: '功能规划中，敬请期待', icon: 'none' });
  }
});
