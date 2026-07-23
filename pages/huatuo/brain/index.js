// pages/huatuo/brain/index.js - 脑洞答题挑战中转页（仅 deep-link 接受挑战）
const { battleJoin } = require('../../../services/game');

Page({
  data: {
    currentTheme: 'warm',
  },

  onLoad(options) {
    this.setData({ currentTheme: getApp().globalData.theme });

    if (options.room_id && options.action === 'challenge') {
      wx.showModal({
        title: '收到战书',
        content: '你的好友向你发起知识对决！迎战需押注 30 灵力，败者将扣除 50 战力值。是否接受挑战？',
        confirmText: '接受',
        cancelText: '拒绝',
        success: (res) => {
          if (res.confirm) {
            this.acceptChallenge(options.room_id);
          } else {
            wx.switchTab({ url: '/pages/huatuo/huatuo' });
          }
        }
      });
    } else {
      wx.setStorageSync('huatuoSubTab', 'quiz');
      wx.switchTab({ url: '/pages/huatuo/huatuo' });
    }
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  async acceptChallenge(roomId) {
    wx.showLoading({ title: '加入对战中...', mask: true });
    try {
      const res = await battleJoin(roomId);
      wx.hideLoading();
      wx.showToast({ title: '已加入对战', icon: 'success' });
      getApp().globalData.brainQuiz = {
        roomId,
        questions: (res && res.questions) ? res.questions : [],
        mode: 'battle',
        role: 'challenger'
      };
      wx.navigateTo({ url: '/pages/huatuo/brain/quiz?mode=battle&role=challenger' });
    } catch (err) {
      wx.hideLoading();
      if (err.code === 402) {
        wx.showToast({ title: '灵力不足，对战需要30灵力', icon: 'none' });
      } else if (err.code === 400) {
        wx.showToast({ title: err.message || '房间已失效', icon: 'none' });
      } else {
        wx.showToast({ title: '加入失败，请重试', icon: 'none' });
      }
    }
  },

  onShareAppMessage() {
    return {
      title: '华佗AI养生 · 脑洞答题大挑战',
      path: '/pages/huatuo/huatuo',
    };
  },
});
