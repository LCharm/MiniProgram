// pages/quiz/detail/detail.js — 体质详情报告页
const { constitutions } = require('../../../utils/constitutionData');

Page({
  data: {
    currentTheme: 'warm',
    physicalData: null
  },

  onLoad(options) {
    const name = decodeURIComponent(options.name || '平和质');
    const info = constitutions[name];
    if (info) {
      this.setData({ physicalData: info });
      wx.setNavigationBarTitle({ title: info.name });
    } else {
      wx.showToast({ title: '体质数据未找到', icon: 'none' });
    }
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
  },

  onAskAi() {
    const data = this.data.physicalData;
    if (!data) return;
    const app = getApp();
    const prompt = '我当前的体质测试结果为【' + data.name + '】。请严格基于中医该体质的特征，为我定制一周的养生食谱。要求：1. 食材必须是普通菜市场极易买到的日常食材；2. 不做宽泛说教，直接给出周一到周日的早中晚具体菜谱；3. 简练说明每道菜针对我体质的调理作用。';
    app.globalData.pendingAiPrompt = prompt;
    wx.switchTab({ url: '/pages/huatuo/huatuo' });
  }
});
