// pages/tea/tea.js - AI智能配茶坊 + 消消乐 + 推荐茶方 + 创意赛
const { request } = require('../../utils/request');
const { matchStart, matchSettle } = require('../../services/game');
const { getFormulaBySymptom, getHotFormula, brewTea, submitContest, getPublicFormulas, toggleContestLike } = require('../../services/tea');
const { getBackpack } = require('../../services/user');

Page({
  data: {
    currentTheme: 'warm',
    currentTab: 'home',

    // 推荐茶方
    activeSymptom: '',
    formulas: [],
    userHerbs: {},
    symptomTags: [
      { id: '助眠', label: '助眠', emoji: '😴' },
      { id: '祛湿', label: '祛湿', emoji: '💦' },
      { id: '清火', label: '清火', emoji: '🔥' },
      { id: '健脾', label: '健脾', emoji: '🍃' },
      { id: '气血', label: '气血', emoji: '🩸' },
      { id: '轻畅', label: '轻畅', emoji: '🧘' },
      { id: '润喉', label: '润喉', emoji: '😮‍💨' },
      { id: '熬夜', label: '熬夜', emoji: '🌙' }
    ],

    // 熬制状态
    isBrewing: false,
    showSuccessModal: false,
    brewResult: null,

    // 消消乐
    sessionId: '',
    cards: [],
    gameScore: 0,
    gameTimer: 60,
    gameLevel: 1,
    gameRunning: false,
    gameOver: false,
    flippedIndices: [],
    isLocked: false,
    showCouponModal: false,
    couponReward: '',
    settleResult: null,

    // 创意大赛
    publicFormulas: [],
    showSubmitModal: false,
    formData: { title: '', ingredients: '', efficacy: '', tags: '', suitable_for: '', brewing_method: '', taboos: '' },
    tagOptions: ['助眠', '养颜', '补气', '去火', '祛湿', '健脾', '润喉', '轻畅'],
  },

  _timerInterval: null,
  _brewTimer: null,

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.initGame();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3, currentTheme: getApp().globalData.theme });
    }
    // 读取外部设置的子 tab
    const subTab = wx.getStorageSync('teaSubTab');
    if (subTab) {
      wx.removeStorageSync('teaSubTab');
      this.setData({ currentTab: subTab });
      if (subTab === 'game') this.initGame();
    }
    // 每次切回页面刷新库存与配方
    this.refreshFormulas();
    this.fetchPublicFormulas();
  },

  onHide() {
    this.stopTimer();
  },

  onUnload() {
    this.stopTimer();
    if (this._brewTimer) clearTimeout(this._brewTimer);
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === 'formula') {
      wx.navigateTo({ url: '/pages/tea/create/create' });
      return;
    }
    this.setData({ currentTab: tab });
    if (tab === 'contest' && this.data.publicFormulas.length === 0) {
      this.fetchPublicFormulas();
    }
    if (tab === 'game') {
      this.stopTimer();
      this.setData({ sessionId: '', gameRunning: false, gameOver: false });
      this.initGame();
    }
  },

  // ==================== 推荐茶方：聚合请求 + 状态计算 ====================

  async refreshFormulas() {
    const symptom = this.data.activeSymptom;
    try {
      const [res, backpack] = await Promise.all([
        symptom ? getFormulaBySymptom(symptom) : getHotFormula(),
        getBackpack().catch(() => ({ herbs: [] })),
      ]);
      const data = res.data || res;
      if (data && data.formulas) {
        const herbMap = {};
        (backpack.herbs || []).forEach(h => { herbMap[h.item_id || h.id] = h.quantity || 0; });
        console.log("=== 背包库存 herbMap ===", JSON.stringify(herbMap));
        const formulas = data.formulas.map(f => {
          const req = f.recipe_req || {};
          const reqEntries = Object.entries(req);
          const hasRecipeReq = reqEntries.length > 0;
          const isCraftable = hasRecipeReq &&
            reqEntries.every(([hid, qty]) => (herbMap[hid] || 0) >= qty);
          return {
            ...f,
            formulaIdStr: String(f.id),
            herbList: (f.herbs || '').split(','),
            isCraftable,
            hasRecipeReq,
            recipe_req: req,
          };
        });
        console.log("=== 组装后的茶方数据 ===", formulas.map(f => ({
          id: f.id, name: f.name, recipe_req: f.recipe_req,
          isCraftable: f.isCraftable,
        })));
        this.setData({ formulas, userHerbs: herbMap });
      } else {
        this.setData({ formulas: [], userHerbs: {} });
      }
    } catch (e) {
      // 网络异常保持现有数据
    }
  },

  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const next = this.data.activeSymptom === id ? '' : id;
    this.setData({ activeSymptom: next });
    this.refreshFormulas();
  },

  viewAllFormulas() {
    wx.showToast({ title: '更多茶方开发中', icon: 'none' });
  },

  // ==================== 熬制交互 ====================

  handleBrew(e) {
    const id = e.currentTarget.dataset.id;
    // dataset 值一律为字符串，需显式比较
    const isCraftable = e.currentTarget.dataset.craftable === 'true';

    if (!isCraftable) {
      // 不可熬制 → 跳转盲盒/秘境
      wx.showModal({
        title: '药材不足',
        content: '背包药材不够合成此茶方，前往盲盒或秘境获取更多药材',
        confirmText: '去获取',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            this.setData({ currentTab: 'game' });
          }
        }
      });
      return;
    }

    // 可熬制 → 启动全屏动画 + 调接口
    this.setData({ isBrewing: true });

    const formulaId = parseInt(id, 10);
    const start = Date.now();

    brewTea(formulaId).then(res => {
      // 强制动画播放至少 1.5 秒
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1500 - elapsed);
      this._brewTimer = setTimeout(() => {
        this.setData({ isBrewing: false });
        const result = (res.data || res).data || (res.data || res);
        this.setData({
          showSuccessModal: true,
          brewResult: {
            name: result.name || '',
            effect: result.effect || '',
            itemId: result.brew_item_id || '',
          },
        });
        this.refreshFormulas();
      }, remaining);
    }).catch(err => {
      this.setData({ isBrewing: false });
      if (this._brewTimer) clearTimeout(this._brewTimer);
      const detail = (err.data || err).detail || '库存不足';
      wx.showToast({ title: detail, icon: 'none', duration: 2000 });
    });
  },

  closeSuccessModal() {
    this.setData({ showSuccessModal: false, brewResult: null });
  },

  // ==================== AI配茶 ====================

  goToCreate() {
    wx.navigateTo({ url: '/pages/tea/create/create' });
  },

  // ==================== 消消乐 ====================

  initGame() {
    this.stopTimer();

    const baseHerbs = [
      { id: 1, name: '亳菊', label: '菊', icon_url: '' }, { id: 2, name: '枸杞', label: '杞', icon_url: '' },
      { id: 3, name: '陈皮', label: '陈皮', icon_url: '' }, { id: 4, name: '黄芪', label: '黄芪', icon_url: '' },
      { id: 5, name: '金银花', label: '银花', icon_url: '' }, { id: 6, name: '决明子', label: '决明', icon_url: '' },
      { id: 7, name: '桑叶', label: '桑叶', icon_url: '' }, { id: 8, name: '茯苓', label: '茯苓', icon_url: '' }
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
      gameRunning: false,
      gameOver: false,
      flippedIndices: [],
      isLocked: false,
      showCouponModal: false,
      couponReward: '',
      settleResult: null
    });
  },

  async startGame() {
    if (this.data.gameRunning) return;

    try {
      const res = await matchStart();
      if (!res || !res.session_id) {
        wx.showToast({ title: '对局创建失败，请重试', icon: 'none' });
        return;
      }
      const sessionId = res.session_id;
      const remainEnergy = res.remain_energy;

      this.setData({
        sessionId,
        gameScore: 0,
        gameTimer: 60,
        gameRunning: true,
        gameOver: false,
        settleResult: null
      });

      this.initGame();
      this.startTimer();
    } catch (err) {
      console.error('对局启动失败', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
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
        showCancel: true,
        cancelText: '退出',
        confirmText: '再来一局',
        success: (res) => {
          if (res.confirm) {
            this.startGame();
          } else {
            this.setData({ sessionId: '' });
            this.initGame();
          }
        }
      });
    }
  },

  async claimCoupon() {
    const { sessionId, gameScore } = this.data;

    if (!sessionId) {
      wx.showToast({ title: '对局信息异常', icon: 'none' });
      this.setData({ showCouponModal: false });
      this.initGame();
      return;
    }

    try {
      const res = await matchSettle(sessionId, gameScore);
      const earned = (res && res.earned_points) || 0;

      this.setData({
        settleResult: res,
        sessionId: ''
      });

      wx.showModal({
        title: '领取成功',
        content: `恭喜获得「${this.data.couponReward}」\n灵力 +${earned}\n已发放至「我的 → 背包」`,
        showCancel: false,
        confirmText: '好的',
        success: () => {
          this.setData({ showCouponModal: false });
          this.initGame();
        }
      });
    } catch (err) {
      console.error('结算失败', err);
      wx.showToast({ title: '结算异常，请重试', icon: 'none' });
      this.setData({ showCouponModal: false });
      this.initGame();
    }
  },

  closeCouponModal() {
    this.setData({ showCouponModal: false });
    this.initGame();
  },

  // ==================== 创意赛 ====================

  async fetchPublicFormulas() {
    try {
      const data = await getPublicFormulas();
      const list = Array.isArray(data) ? data : (data.list || []);
      this.setData({ publicFormulas: list });
    } catch (err) {
      console.error('[Contest] 列表加载失败', err);
    }
  },

  async handleLike(e) {
    const formulaId = e.currentTarget.dataset.id;
    try {
      const res = await toggleContestLike(formulaId);
      if (res) {
        const newLikesCount = res.likes_count;
        const index = this.data.publicFormulas.findIndex(item => item.id === formulaId);
        if (index !== -1) {
          this.setData({
            [`publicFormulas[${index}].likes_count`]: newLikesCount
          });
        }
      }
    } catch (err) {
      const msg = (err && err.message) || '操作频繁';
      wx.showToast({ title: msg, icon: 'none' });
    }
  },

  openSubmitModal() {
    this.setData({ showSubmitModal: true, formData: { title: '', ingredients: '', efficacy: '', tags: '', suitable_for: '', brewing_method: '', taboos: '' } });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ hidden: true });
    }
  },

  closeSubmitModal() {
    this.setData({ showSubmitModal: false });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ hidden: false });
    }
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const next = this.data.formData.tags === tag ? '' : tag;
    this.setData({ 'formData.tags': next });
  },

  onFormFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  preventClose() {},

  async handleSubmitAction() {
    const title = (this.data.formData.title || '').trim();
    const ingredients = (this.data.formData.ingredients || '').trim();
    const efficacy = (this.data.formData.efficacy || '').trim();
    const tags = this.data.formData.tags || '';
    const suitable_for = (this.data.formData.suitable_for || '').trim();
    const brewing_method = (this.data.formData.brewing_method || '').trim();
    const taboos = (this.data.formData.taboos || '').trim();

    if (!title || !ingredients || !efficacy) {
      return wx.showToast({ title: '请填写完整配方', icon: 'none' });
    }

    if (title.length < 2) {
      return wx.showToast({ title: '茶方名称至少2个字', icon: 'none' });
    }
    if (ingredients.length < 5) {
      return wx.showToast({ title: '配方材料至少5个字', icon: 'none' });
    }
    if (efficacy.length < 5) {
      return wx.showToast({ title: '功效说明至少5个字', icon: 'none' });
    }

    try {
      const res = await submitContest({ title, ingredients, efficacy, tags, suitable_for, brewing_method, taboos });
      if (res && res.id) {
        this.closeSubmitModal();
        this.setData({
          formData: { title: '', ingredients: '', efficacy: '', tags: '', suitable_for: '', brewing_method: '', taboos: '' }
        });

        wx.showModal({
          title: '提交成功',
          content: '您的茶方已提交，请等待人工审核。是否前往查看进度？',
          confirmText: '去查看',
          cancelText: '留在本页',
          success(modalRes) {
            if (modalRes.confirm) {
              wx.navigateTo({ url: '/pages/my-formulas/index' });
            }
          }
        });
      }
    } catch (err) {
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  }
});
