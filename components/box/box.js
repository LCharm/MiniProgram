// components/box/box.js - 每日盲盒抽奖动画组件
const { openBlindBox } = require('../../services/game');

Component({
  data: {
    currentTheme: 'warm',
    isOpening: false,
    showResult: false,
    prizeData: null,
    boxOpenedToday: false,
  },

  lifetimes: {
    attached() {
      this.setData({ currentTheme: getApp().globalData.theme });
      this._checkTodayOpened();
    },
  },

  pageLifetimes: {
    show() {
      this.setData({ currentTheme: getApp().globalData.theme });
      this._checkTodayOpened();
    },
  },

  methods: {
    _checkTodayOpened() {
      const record = wx.getStorageSync('blindBoxDate');
      const today = new Date().toLocaleDateString();
      this.setData({ boxOpenedToday: record === today });
    },

    /** 点击盲盒本体 → 向父页面派发事件，由父页面校验任务后回调用 open() */
    onTapBox() {
      if (this.data.isOpening) return;
      if (this.data.boxOpenedToday) {
        wx.showToast({ title: '今日已开，明天再来', icon: 'none' });
        return;
      }
      this.triggerEvent('tapopen');
    },

    /** 父页面校验通过后调用，执行完整抽奖流程 */
    open() {
      if (this.data.isOpening) return;
      this._doOpen();
    },

    async _doOpen() {
      this.setData({ isOpening: true });

      const minDuration = new Promise(r => setTimeout(r, 1500));
      const apiCall = openBlindBox().catch(err => ({ _error: err }));

      const [apiResult] = await Promise.all([apiCall, minDuration]);

      if (apiResult && apiResult._error) {
        this.setData({ isOpening: false });
        const msg = apiResult._error.message || '开盒失败，请重试';
        // 今日已开过：同步本地状态，不再当作错误
        if (msg && msg.includes('今日已开过')) {
          const today = new Date().toLocaleDateString();
          wx.setStorageSync('blindBoxDate', today);
          this.setData({ boxOpenedToday: true });
          wx.showToast({ title: '今日已开，明天再来', icon: 'none' });
        } else {
          wx.showToast({ title: msg, icon: 'none', duration: 2000 });
        }
        this.triggerEvent('done', { success: false });
        return;
      }

      const prizeData = this._normalize(apiResult);
      const today = new Date().toLocaleDateString();
      wx.setStorageSync('blindBoxDate', today);
      this.setData({ isOpening: false, showResult: true, prizeData, boxOpenedToday: true });
      this.triggerEvent('done', { success: true, prize: prizeData });
    },

    _normalize(raw) {
      if (!raw) {
        return { type: 'empty', name: '谢谢参与', remainEnergy: 0 };
      }
      const typeMap = { herb: 'herb', voucher: 'voucher', energy: 'spirit', action: 'retry', empty: 'empty' };
      return {
        type: typeMap[raw.prize_type] || 'empty',
        name: raw.prize_name || '',
        remainEnergy: raw.remain_energy || 0,
        isFirstUnlock: (raw.prize_name || '').includes('首次解锁'),
        amount: raw.prize_type === 'energy' ? (parseInt(raw.prize_name) || 0) : 0,
      };
    },

    closeResult() {
      this.setData({ showResult: false, prizeData: null });
    },

    onRetry() {
      this.setData({ showResult: false, prizeData: null });
      this._doOpen();
    },
  },
});
