const { getMyCollect, collectFormula } = require('../../../services/tea.js');

Page({
  data: {
    currentTheme: 'warm',
    list: [],
    loading: true,
    empty: false
  },

  onLoad() {
    const app = getApp();
    this.setData({ currentTheme: app.globalData.theme });
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    this.fetchList();
  },

  async fetchList() {
    this.setData({ loading: true });
    try {
      const res = await getMyCollect();
      const list = res.data || res || [];
      this.setData({
        list: Array.isArray(list) ? list : [],
        loading: false,
        empty: !list.length
      });
    } catch (err) {
      console.error(err);
      this.setData({ loading: false, empty: true, list: [] });
    }
  },

  async removeCollect(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await collectFormula({ action: 0, id: id });
      const list = this.data.list.filter(item => item.id !== id);
      this.setData({ list, empty: !list.length });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
