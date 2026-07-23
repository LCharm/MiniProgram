const { request } = require('../../../utils/request');

Page({
  data: {
    currentTheme: 'warm',
    hasData: false,
    trendData: [],
    historyList: [],
    isPageReady: false,
  },

  onLoad() {
    this.fetchHistory();
  },

  onReady() {
    // 页面初次渲染完成，延时 400ms 硬扛过微信页面滑入动画
    setTimeout(() => this.setData({ isPageReady: true }), 400);
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    // 从详情页返回时，等滑入动画结束再恢复图表
    if (this.data.hasData && !this.data.isPageReady) {
      setTimeout(() => this.setData({ isPageReady: true }), 400);
    }
  },

  onHide() {
    // 页面失焦瞬间卸载 Canvas，不给转场动画留残影
    this.setData({ isPageReady: false });
  },

  onUnload() {
    this.setData({ isPageReady: false });
  },

  async fetchHistory() {
    try {
      const res = await request({ url: '/physical/history' });
      if (!res || !res.dates || res.dates.length === 0) {
        this.setData({ hasData: false });
        return;
      }

      const trendData = res.dates.map((date, i) => ({
        date: date.substring(5, 10),
        score: res.scores[i]
      }));

      const historyList = res.dates.map((date, i) => ({
        date,
        score: res.scores[i],
        majorType: res.major_types[i]
      }));

      this.setData({ hasData: true, trendData, historyList });
    } catch (err) {
      console.error('[History] 加载失败', err);
      this.setData({ hasData: false });
    }
  },

  goToQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' });
  },

  goReportDetail(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ isPageReady: false });
    wx.navigateTo({ url: `/pages/health/report/report?date=${date}` });
  },
});
