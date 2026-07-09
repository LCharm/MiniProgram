// pages/user/user.js - 个人中心
const { request } = require('../../utils/request');

Page({
  data: {
    currentTheme: 'default',
    isLogin: false,
    totalPower: 0,
    spiritualEnergy: 0,
    currentRank: '暂无',
    physicalType: '',
    cardCount: 0,
    checkinDays: 0,
    couponCount: 0,
    memberExpiry: ''
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    const token = wx.getStorageSync('access_token');
    if (token) {
      this.setData({ isLogin: true });
      this.fetchUserStats();
    }
    this.loadLocalData();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
    this.loadLocalData();
  },

  loadLocalData() {
    const physical = wx.getStorageSync('latestPhysicalResult');
    const coupons = wx.getStorageSync('coupons') || [];
    this.setData({
      physicalType: physical ? physical.name : '',
      couponCount: coupons.length
    });
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
      this.setData({
        totalPower: res.total_power || 1050,
        spiritualEnergy: res.spiritual_energy || 320,
        currentRank: res.current_rank || '青铜二段',
        cardCount: res.card_count || 3,
        checkinDays: res.checkin_days || 15
      });
    } catch (err) {
      this.setData({
        totalPower: 1250,
        spiritualEnergy: 480,
        currentRank: '白银药师',
        cardCount: 3,
        checkinDays: 15
      });
    }
  },

  goToPhysicalReport() {
    const physical = wx.getStorageSync('latestPhysicalResult');
    if (physical) {
      wx.showModal({
        title: physical.name,
        content: `转化分：${physical.score}\n测评日期：${physical.date}\n\n详细数据请查看健康报告`,
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      wx.showToast({ title: '请先完成体质测评', icon: 'none' });
    }
  },

  goToBackpack() {
    const coupons = wx.getStorageSync('coupons') || [];
    const items = wx.getStorageSync('backpackItems') || [];
    let content = '';
    if (coupons.length === 0 && items.length === 0) {
      content = '背包空空如也\n\n完成每日任务开盲盒可获得道具\n完成消消乐闯关可获得花茶优惠券';
    } else {
      if (items.length > 0) {
        const itemList = items.map((it, i) => `${i + 1}. ${it.name} ×${it.qty || 1} (${it.date})`).join('\n');
        content += `🎒 道具 (${items.length}件)：\n${itemList}`;
      }
      if (coupons.length > 0) {
        if (content) content += '\n\n';
        const couponList = coupons.map((c, i) => `${i + 1}. ${c.type} (${c.date})`).join('\n');
        content += `🎫 优惠券 (${coupons.length}张)：\n${couponList}`;
      }
    }
    wx.showModal({
      title: '🎒 我的背包',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  goToCollectedTeas() {
    wx.showToast({ title: '收藏茶方功能开发中', icon: 'none' });
  },

  goToCardBook() {
    wx.showToast({ title: '卡牌图鉴功能开发中', icon: 'none' });
  },

  goToSettings(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },

  goToMemberCenter() {
    wx.showModal({
      title: '⭐ 会员中心',
      content: '使用灵力值兑换会员权益\n\n当前灵力值：480\n\n兑换方案（规划中）：\n• 300灵力 → 7天体验会员\n• 800灵力 → 30天正式会员\n• 2000灵力 → 90天尊享会员\n\n会员特权：专属舌象报告、AI深度配茶、优先体验新功能',
      showCancel: false,
      confirmText: '期待中'
    });
  },

  goToRankList() {
    wx.showToast({ title: '排行榜功能开发中', icon: 'none' });
  }
});
