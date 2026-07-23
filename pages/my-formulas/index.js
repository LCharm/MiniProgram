const { request } = require('../../utils/request');

const STATUS_MAP = { 0: '待审核', 1: '已通过', 2: '已驳回' };

Page({
  data: {
    currentTheme: 'warm',
    currentTab: 'collected',
    submittedList: [],
    collectedList: []
  },

  onLoad(options) {
    this.setData({ currentTheme: getApp().globalData.theme });
    if (options.tab) {
      this.setData({ currentTab: options.tab });
    }
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.fetchCurrentTabData();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab === tab) return;

    this.setData({ currentTab: tab });
    this.fetchCurrentTabData();
  },

  fetchCurrentTabData() {
    if (this.data.currentTab === 'submitted') {
      this.fetchSubmittedFormulas();
    } else {
      this.fetchCollectedFormulas();
    }
  },

  async fetchSubmittedFormulas() {
    try {
      const data = await request({ url: '/contest/formulas/my' });
      const list = (Array.isArray(data) ? data : (data.list || [])).map(item => ({
        ...item,
        statusText: STATUS_MAP[item.status] || '未知'
      }));
      this.setData({ submittedList: list });
    } catch (err) {
      // 静默处理
    }
  },

  async fetchCollectedFormulas() {
    try {
      const data = await request({ url: '/tea/myCollect' });
      const list = Array.isArray(data) ? data : (data.list || []);
      this.setData({ collectedList: list });
    } catch (err) {
      // 静默处理
    }
  }
});
