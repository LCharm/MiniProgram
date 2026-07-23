Component({
  data: {
    selected: 0,
    currentTheme: 'warm',
    hidden: false,
  },
  lifetimes: {
    attached() {
      const app = getApp();
      if (app && app.globalData) {
        this.setData({ currentTheme: app.globalData.theme });
      }
    },
  },
  pageLifetimes: {
    show() {
      const app = getApp();
      if (app && app.globalData) {
        this.setData({ currentTheme: app.globalData.theme });
      }
    },
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    },
  },
});
