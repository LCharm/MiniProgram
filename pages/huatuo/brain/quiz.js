// pages/huatuo/brain/quiz.js - 脑洞答题页（单人 + 好友对战）
const { settleBrainQuiz, battleSubmit } = require('../../../services/game');

const QUESTION_SEC = 10;       // 每题限时（秒）
const POLL_INTERVAL = 3000;   // 轮询间隔（毫秒）

Page({
  data: {
    currentTheme: 'warm',
    mode: 'solo',
    role: '',
    roomId: '',
    sessionId: '',
    questions: [],
    currentIdx: 0,
    answers: [],
    selectedChoice: '',
    settling: false,
    battleReport: null,
    soloResult: null,
    waitingOpponent: false,
    blurContent: false,       // 分享/切后台时模糊遮盖
    // 倒计时
    timerSec: QUESTION_SEC,
    timerWidth: 100,
  },

  _pollTimer: null,
  _countdownTimer: null,
  _paused: false,
  _pausedRemaining: 0,

  onLoad(options) {
    this.setData({ currentTheme: getApp().globalData.theme });
    const quiz = getApp().globalData.brainQuiz;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      wx.showToast({ title: '题目数据丢失，请返回重试', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({
      mode: quiz.mode || 'solo',
      role: quiz.role || '',
      roomId: quiz.roomId || '',
      sessionId: quiz.sessionId || '',
      questions: quiz.questions,
      currentIdx: 0,
      answers: [],
    });
    getApp().globalData.brainQuiz = null;
    this._startTimer();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    // 分享面板关闭 → 恢复倒计时，移除模糊
    this.setData({ blurContent: false });
    if (this._paused && !this.data.settling && !this.data.battleReport && !this.data.soloResult && !this.data.waitingOpponent) {
      this._paused = false;
      this._resumeTimer(this._pausedRemaining);
    }
  },

  onHide() {
    // 分享面板弹出 / 切后台 → 暂停倒计时 + 模糊遮盖
    const active = !this.data.settling && !this.data.battleReport && !this.data.soloResult && !this.data.waitingOpponent;
    if (this._countdownTimer && active) {
      this._paused = true;
      this._pausedRemaining = this.data.timerSec;
      this._clearTimers();
    }
    if (active) {
      this.setData({ blurContent: true });
    }
  },

  onUnload() {
    this._clearTimers();
  },

  /* ── 倒计时 ── */
  _startTimer() {
    this._clearTimers();
    this.setData({ timerSec: QUESTION_SEC, timerWidth: 100 });
    this._runCountdown();
  },

  _resumeTimer(remaining) {
    this._clearTimers();
    this.setData({ timerSec: remaining, timerWidth: (remaining / QUESTION_SEC) * 100 });
    this._runCountdown();
  },

  _runCountdown() {
    this._countdownTimer = setInterval(() => {
      const sec = this.data.timerSec - 1;
      if (sec <= 0) {
        this._clearTimers();
        this._timeUp();
      } else {
        this.setData({
          timerSec: sec,
          timerWidth: (sec / QUESTION_SEC) * 100,
        });
      }
    }, 1000);
  },

  _clearTimers() {
    if (this._countdownTimer) { clearInterval(this._countdownTimer); this._countdownTimer = null; }
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
  },

  _timeUp() {
    if (this.data.settling || this.data.battleReport || this.data.soloResult) return;
    if (this.data.waitingOpponent) return;
    const q = this.data.questions[this.data.currentIdx];
    if (!q) return;
    // 超时视为未作答，填入空答案
    const answers = [...this.data.answers, { question_id: q.question_id, selected_choice: '' }];
    const nextIdx = this.data.currentIdx + 1;
    if (nextIdx >= this.data.questions.length) {
      this.setData({ answers, selectedChoice: '' });
      this.settle();
    } else {
      this.setData({ answers, currentIdx: nextIdx, selectedChoice: '' });
      this._startTimer();
    }
  },

  /* ── 选择答案 ── */
  selectAnswer(e) {
    if (this.data.settling || this.data.battleReport || this.data.soloResult) return;
    if (this.data.waitingOpponent) return;
    this._clearTimers();

    const choiceIdx = e.currentTarget.dataset.idx;
    const choiceLetter = String.fromCharCode(65 + choiceIdx);
    const q = this.data.questions[this.data.currentIdx];
    if (!q) return;

    this.setData({ selectedChoice: choiceLetter });

    setTimeout(() => {
      const answers = [...this.data.answers, { question_id: q.question_id, selected_choice: choiceLetter }];
      const nextIdx = this.data.currentIdx + 1;
      if (nextIdx >= this.data.questions.length) {
        this.setData({ answers, selectedChoice: '' });
        this.settle();
      } else {
        this.setData({ answers, currentIdx: nextIdx, selectedChoice: '' });
        this._startTimer();
      }
    }, 200);
  },

  /* ── 结算 ── */
  async settle() {
    if (this.data.settling) return;
    this.setData({ settling: true });
    wx.showLoading({ title: '正在结算...', mask: true });

    try {
      if (this.data.mode === 'battle') {
        const res = await battleSubmit(this.data.roomId, this.data.answers);
        wx.hideLoading();
        if (res.status === 'waiting') {
          this.setData({ waitingOpponent: true, settling: false });
          this._startPolling();
        } else {
          this._clearTimers();
          getApp().globalData.battleSettle = { role: this.data.role, report: res };
          wx.redirectTo({ url: '/pages/huatuo/battle/settle' });
        }
      } else {
        const res = await settleBrainQuiz(this.data.sessionId, this.data.answers);
        wx.hideLoading();
        this._clearTimers();
        this.setData({ soloResult: res, settling: false });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '结算失败，请重试', icon: 'none' });
      this.setData({ settling: false });
    }
  },

  /* ── 轮询等待对手 ── */
  _startPolling() {
    this._pollTimer = setInterval(async () => {
      try {
        // 幂等重提交：后端会返回当前状态或结算结果
        const res = await battleSubmit(this.data.roomId, this.data.answers);
        if (res.status !== 'waiting') {
          this._clearTimers();
          getApp().globalData.battleSettle = { role: this.data.role, report: res };
          wx.redirectTo({ url: '/pages/huatuo/battle/settle' });
        }
      } catch (_) {
        // 网络波动静默忽略，下次轮询重试
      }
    }, POLL_INTERVAL);
  },

  /* ── 禁止复制（长按菜单） ── */
  noop() {},

  goBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    if (this.data.mode === 'battle' && this.data.roomId) {
      return {
        title: '我押了30点灵力，敢不敢来跟我拼一下中医知识？',
        path: '/pages/huatuo/brain/index?room_id=' + this.data.roomId + '&action=challenge',
        imageUrl: '',
      };
    }
    return {
      title: '华佗AI养生 · 脑洞答题大挑战',
      path: '/pages/huatuo/brain/index',
    };
  },
});
