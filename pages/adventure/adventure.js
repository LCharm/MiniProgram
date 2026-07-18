// pages/adventure/adventure.js - 奇遇记文字冒险副本
const { request } = require('../../utils/request');

Page({
  data: {
    currentTheme: 'warm',
    chapter: null,
    endings: [],
    playCount: 0,
    cost: 0,

    // 模态框
    showResultModal: false,
    isExploring: false,

    // 奖励
    rewardName: '',
    rewardTier: '',
    isEmpty: false,

    // 打字机
    fullStory: '',
    displayStory: '',
    isTyping: false,
  },

  _typewriterTimer: null,

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    this.fetchChapter();
  },

  onHide() {
    this._clearTypewriter();
  },

  onUnload() {
    this._clearTypewriter();
  },

  async fetchChapter() {
    try {
      const data = await request({ url: '/adventure/1' });
      this.setData({
        chapter: data.chapter,
        endings: data.endings,
        playCount: data.progress.play_count,
        cost: data.progress.cost,
      });
    } catch (err) {
      wx.showToast({ title: '章节加载失败，请下拉重试', icon: 'none' });
    }
  },

  // ===== 核心交互 =====
  async handleChoice(e) {
    if (this.data.isExploring) return;

    const endingId = e.currentTarget.dataset.id;

    // 灵力校验
    if (this.data.playCount > 0 && this.data.cost > 0) {
      try {
        const userData = await request({ url: '/game/stats/update', method: 'POST', data: {} });
        if ((userData.spiritual_energy || 0) < this.data.cost) {
          wx.showModal({
            title: '灵力不足',
            content: `本次探索需要 ${this.data.cost} 灵力，请先完成任务获取灵力。`,
            showCancel: false,
            confirmText: '知道了',
          });
          return;
        }
      } catch (err) {
        // 预检失败不阻塞，交给后端校验
      }
    }

    this.setData({ isExploring: true });
    wx.showLoading({ title: '天机推演中...', mask: true });

    try {
      const res = await request({
        url: '/adventure/explore',
        method: 'POST',
        data: { chapter_id: 1, ending_id: endingId },
      });

      wx.hideLoading();

      const reward = res.rewards && res.rewards[0];
      this.setData({
        showResultModal: true,
        isExploring: false,
        rewardName: reward ? reward.name : '',
        rewardTier: reward ? reward.tier : '',
        isEmpty: !reward,
        fullStory: res.story || '',
        displayStory: '',
      });

      this.startTypewriter(res.story || '');

    } catch (err) {
      wx.hideLoading();
      this.setData({ isExploring: false });
      wx.showToast({ title: err.message || '探索失败', icon: 'none' });
    }
  },

  // ===== 打字机 =====
  startTypewriter(text) {
    this._clearTypewriter();
    this.setData({ isTyping: true, displayStory: '' });

    let i = 0;
    const chars = text.split('');

    this._typewriterTimer = setInterval(() => {
      if (i >= chars.length) {
        this._clearTypewriter();
        this.setData({ isTyping: false });
        return;
      }
      const current = chars.slice(0, i + 1).join('');
      this.setData({ displayStory: current });
      i++;
    }, 50);
  },

  skipTypewriter() {
    if (!this.data.isTyping) return;
    this._clearTypewriter();
    this.setData({
      displayStory: this.data.fullStory,
      isTyping: false,
    });
  },

  _clearTypewriter() {
    if (this._typewriterTimer) {
      clearInterval(this._typewriterTimer);
      this._typewriterTimer = null;
    }
  },

  // ===== 关闭模态框 =====
  closeModal() {
    this.setData({
      showResultModal: false,
      fullStory: '',
      displayStory: '',
      isTyping: false,
      rewardName: '',
      rewardTier: '',
      isEmpty: false,
    });
    this.fetchChapter();
  },

  preventScroll() {
    // 阻止模态框下的滚动穿透
  },
});
