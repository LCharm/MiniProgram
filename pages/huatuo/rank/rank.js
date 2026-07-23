// pages/huatuo/rank/rank.js - 脑洞答题今日排行榜
const { getBrainRank } = require('../../../services/game');

Page({
  data: {
    currentTheme: 'warm',
    myRank: null,
    topList: [],
    loading: true,
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.fetchRank();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  async fetchRank() {
    this.setData({ loading: true });
    try {
      const res = await getBrainRank();
      this.setData({
        myRank: res.my_rank || null,
        topList: res.top_list || [],
        loading: false,
      });
    } catch (err) {
      console.error('排行榜加载失败:', err);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.fetchRank().then(() => wx.stopPullDownRefresh());
  },
});
