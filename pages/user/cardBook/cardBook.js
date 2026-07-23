// pages/user/cardBook/cardBook.js - 百草药材图鉴
const { getCardBook } = require('../../../services/game');

Page({
  data: {
    currentTheme: 'warm',
    cards: [],
    loading: true,
    filter: 'all',
    unlockedCount: 0,
    totalCount: 0,
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.fetchCards();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  async fetchCards() {
    this.setData({ loading: true });
    try {
      const data = await getCardBook();
      const cards = data.cards || [];
      const unlocked = cards.filter(c => c.is_unlocked).length;
      this.setData({
        cards,
        unlockedCount: unlocked,
        totalCount: cards.length,
        loading: false,
      });
    } catch (err) {
      console.error('图鉴加载失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  switchFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.filter });
  },

  onCardTap(e) {
    const { itemId, quantity } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/user/cardBook/detail/detail?itemId=' + encodeURIComponent(itemId) + '&quantity=' + (quantity || 0),
    });
  },

  onPullDownRefresh() {
    this.fetchCards().then(() => wx.stopPullDownRefresh());
  },
});
