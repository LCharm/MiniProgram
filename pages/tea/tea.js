// pages/tea/tea.js - AI智能配茶坊 + 消消乐 + 推荐茶方 + 创意赛
const { request } = require('../../utils/request');

Page({
  data: {
    currentTheme: 'default',
    currentTab: 'home',

    // 推荐茶方
    activeSymptom: '',
    symptomTags: [
      { id: 'sleep', label: '助眠', emoji: '😴' },
      { id: 'damp', label: '祛湿', emoji: '💦' },
      { id: 'fire', label: '清火', emoji: '🔥' },
      { id: 'spleen', label: '健脾', emoji: '🍃' },
      { id: 'blood', label: '气血', emoji: '🩸' },
      { id: 'light', label: '轻畅', emoji: '🧘' },
      { id: 'throat', label: '润喉', emoji: '😮‍💨' },
      { id: 'night', label: '熬夜', emoji: '🌙' }
    ],

    // 消消乐
    cards: [],
    gameScore: 0,
    gameTimer: 60,
    gameLevel: 1,
    gameRunning: false,
    gameOver: false,
    flippedIndices: [],
    isLocked: false,
    showCouponModal: false,
    couponReward: ''
  },

  _timerInterval: null,

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.initGame();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  onHide() {
    this.stopTimer();
  },

  onUnload() {
    this.stopTimer();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === 'formula') {
      wx.navigateTo({ url: '/pages/tea/create/create' });
      return;
    }
    this.setData({ currentTab: tab });
    if (tab === 'game') {
      this.stopTimer();
      this.setData({ gameRunning: false, gameOver: false });
      this.initGame();
    }
  },

  // ==================== 推荐茶方 ====================

  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      activeSymptom: this.data.activeSymptom === id ? '' : id
    });
  },

  viewAllFormulas() {
    wx.showToast({ title: '更多茶方开发中', icon: 'none' });
  },

  // ==================== AI配茶 ====================

  goToCreate() {
    wx.navigateTo({ url: '/pages/tea/create/create' });
  },

  // ==================== 消消乐 ====================

  initGame() {
    this.stopTimer();

    const baseHerbs = [
      { id: 1, name: '亳菊', icon: '🌼' }, { id: 2, name: '枸杞', icon: '🔴' },
      { id: 3, name: '陈皮', icon: '🍊' }, { id: 4, name: '黄芪', icon: '🪵' },
      { id: 5, name: '金银花', icon: '🌿' }, { id: 6, name: '决明子', icon: '🫘' },
      { id: 7, name: '桑叶', icon: '🍃' }, { id: 8, name: '茯苓', icon: '🍄' }
    ];

    let deck = [...baseHerbs, ...baseHerbs].map((item, index) => ({
      ...item,
      uid: index,
      isFlipped: false,
      isMatched: false
    }));

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.setData({
      cards: deck,
      gameScore: 0,
      gameTimer: 60,
      gameLevel: 1,
      flippedIndices: [],
      isLocked: false,
      showCouponModal: false,
      couponReward: ''
    });
  },

  startGame() {
    if (this.data.gameRunning) return;

    this.setData({
      gameScore: 0,
      gameTimer: 60,
      gameRunning: true,
      gameOver: false
    });

    this.initGame();
    this.startTimer();
  },

  startTimer() {
    this.stopTimer();
    this._timerInterval = setInterval(() => {
      const timer = this.data.gameTimer - 1;
      if (timer <= 0) {
        this.stopTimer();
        this.endGameByTime();
      } else {
        this.setData({ gameTimer: timer });
      }
    }, 1000);
  },

  stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  },

  endGameByTime() {
    this.setData({ gameRunning: false, gameOver: true });
    this.checkReward();
  },

  flipCard(e) {
    if (this.data.isLocked || !this.data.gameRunning || this.data.gameOver) return;

    const index = e.currentTarget.dataset.index;
    const { cards, flippedIndices } = this.data;
    const card = cards[index];

    if (card.isFlipped || card.isMatched) return;

    cards[index].isFlipped = true;
    flippedIndices.push(index);
    this.setData({ cards, flippedIndices });

    if (flippedIndices.length === 2) {
      this.setData({ isLocked: true });
      this.checkMatch();
    }
  },

  checkMatch() {
    const { cards, flippedIndices, gameScore } = this.data;
    const [idx1, idx2] = flippedIndices;

    if (cards[idx1].id === cards[idx2].id) {
      cards[idx1].isMatched = true;
      cards[idx2].isMatched = true;

      this.setData({
        cards,
        gameScore: gameScore + 20,
        flippedIndices: [],
        isLocked: false
      });

      this.checkWin();
    } else {
      setTimeout(() => {
        cards[idx1].isFlipped = false;
        cards[idx2].isFlipped = false;
        this.setData({
          cards,
          flippedIndices: [],
          isLocked: false
        });
      }, 800);
    }
  },

  checkWin() {
    const isAllMatched = this.data.cards.every(card => card.isMatched);
    if (isAllMatched) {
      this.stopTimer();
      this.setData({ gameRunning: false, gameOver: true });
      this.checkReward();
    }
  },

  checkReward() {
    const score = this.data.gameScore;
    let reward = '';

    if (score >= 100) {
      reward = '8折优惠券';
    } else if (score >= 50) {
      reward = '9折优惠券';
    }

    if (reward) {
      this.setData({
        showCouponModal: true,
        couponReward: reward
      });
    } else {
      wx.showModal({
        title: '游戏结束',
        content: `获得 ${score} 积分\n满50积分即可兑换9折券，继续加油！`,
        showCancel: false,
        confirmText: '再来一局',
        success: () => { this.startGame(); }
      });
    }
  },

  claimCoupon() {
    const coupons = wx.getStorageSync('coupons') || [];
    coupons.push({
      type: this.data.couponReward,
      date: new Date().toLocaleDateString(),
      score: this.data.gameScore
    });
    wx.setStorageSync('coupons', coupons);

    wx.showModal({
      title: '领取成功',
      content: `恭喜获得「${this.data.couponReward}」\n已发放至「我的 → 背包」`,
      showCancel: false,
      confirmText: '好的',
      success: () => {
        this.setData({ showCouponModal: false });
        this.initGame();
      }
    });
  },

  closeCouponModal() {
    this.setData({ showCouponModal: false });
    this.initGame();
  },

  // ==================== 创意赛 ====================

  likeFormula(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: `已为「${name}」点赞`, icon: 'none' });
  },

  submitFormula() {
    wx.showModal({
      title: '提交创意配方',
      content: '请描述您的创意茶方，审核通过后将公开展示并获得灵力奖励',
      showCancel: true,
      confirmText: '立即提交',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已提交审核', icon: 'success' });
        }
      }
    });
  }
});
