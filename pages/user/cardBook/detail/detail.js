// pages/user/cardBook/detail/detail.js — 药材详情页
const { herbData } = require('../../../../utils/herbData');

Page({
  data: {
    currentTheme: 'warm',
    herb: null,
    userQuantity: 0,
  },

  onLoad(options) {
    const itemId = decodeURIComponent(options.itemId || '');
    const quantity = parseInt(options.quantity || '0', 10);
    const info = herbData[itemId];
    if (info) {
      this.setData({ herb: info, userQuantity: quantity, itemId: itemId });
      wx.setNavigationBarTitle({ title: info.name });
    } else {
      wx.showToast({ title: '药材数据未找到', icon: 'none' });
    }
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
  },

  onAskHuaTuo() {
    const herb = this.data.herb;
    if (!herb) return;
    const app = getApp();
    const prompt = '请基于中药材【' + herb.name + '】的特性和功效，为我提供详细的食用建议和注意事项。功效：' + herb.efficacy + '。主要禁忌：' + herb.taboos;
    app.globalData.pendingAiPrompt = prompt;
    wx.switchTab({ url: '/pages/huatuo/huatuo' });
  },
});
