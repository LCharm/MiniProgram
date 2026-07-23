// pages/health/tasks/tasks.js
const { getDailyTasks, completeTask } = require('../../../services/game');

Page({
  data: {
    currentTheme: 'warm',
    tasks: [],
    clocks: {},
    loading: true,
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.loadTasks();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  async loadTasks() {
    this.setData({ loading: true });
    try {
      const tasks = await getDailyTasks();
      const clocks = {};
      (tasks || []).forEach(t => {
        if (t.done) clocks[t.id] = true;
      });
      this.setData({
        tasks: tasks || [],
        clocks,
        loading: false,
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  async handleTask(e) {
    const { id, type, label } = e.currentTarget.dataset;
    const key = type || String(id || '');
    if (!key) return;
    if (this.data.clocks[key]) return;

    // 社保卡绑定：模拟授权流程
    if (key === 'bind_ssc') {
      this.bindSSC(key);
      return;
    }

    try {
      await completeTask(key);
      const clocks = { ...this.data.clocks, [key]: true };
      this.setData({ clocks });
      wx.showToast({ title: '已打卡', icon: 'success' });
    } catch (err) {
      if (err.code === 400) {
        const clocks = { ...this.data.clocks, [key]: true };
        this.setData({ clocks });
        wx.showToast({ title: '今日已完成', icon: 'none' });
      } else {
        wx.showToast({ title: '打卡失败，请重试', icon: 'none' });
      }
    }
  },

  bindSSC(key) {
    wx.showLoading({ title: '[模拟] 连接人社系统...', mask: true });
    setTimeout(() => {
      wx.showLoading({ title: '[模拟] 拉取电子社保凭证...', mask: true });
      setTimeout(async () => {
        wx.hideLoading();
        wx.showToast({ title: '[模拟] 社保卡绑定成功', icon: 'success' });
        try {
          await completeTask(key);
          const clocks = { ...this.data.clocks, [key]: true };
          this.setData({ clocks });
        } catch (err) {
          if (err.code === 400) {
            const clocks = { ...this.data.clocks, [key]: true };
            this.setData({ clocks });
          }
        }
      }, 800);
    }, 800);
  },
});
