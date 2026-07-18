// pages/user/rank/rank.js - 总战力排行榜
const { getRankList } = require('../../../services/game');

Page({
  data: {
    currentTheme: 'warm',
    myRank: null,
    topList: [],
    loading: true,
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.fetchRankList();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  async fetchRankList() {
    this.setData({ loading: true });
    try {
      const res = await getRankList();
      this.setData({
        myRank: res.my_rank || { rank: '-', score: 0, nickname: '' },
        topList: res.top_50 || [],
        loading: false,
      });
    } catch (err) {
      console.error('排行榜加载失败:', err);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.fetchRankList().then(() => wx.stopPullDownRefresh());
  },
});
