// pages/huatuo/battle/settle.js - 好友对战异步结算页
Page({
  data: {
    currentTheme: 'warm',

    // 核心判定
    isWinner: false,
    isDraw: false,

    // 比分
    myScore: 0,
    opponentScore: 0,
    totalQuestions: 7,

    // 双方身份
    myName: '',
    opponentName: '',
    myTier: '',
    opponentTier: '',

    // 数值变动
    energyChange: 0,
    rankChange: 0,

    // 掉段
    isRankDown: false,
    newRankName: '',
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });

    const payload = getApp().globalData.battleSettle;
    if (!payload || !payload.report) {
      wx.showToast({ title: '战报丢失，请返回重试', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }

    const { role, report } = payload;
    getApp().globalData.battleSettle = null;

    const isCreator = role === 'creator';
    const myScore = isCreator ? report.creator_score : report.challenger_score;
    const opponentScore = isCreator ? report.challenger_score : report.creator_score;
    const myName = isCreator ? (report.creator_name || '发起者') : (report.challenger_name || '挑战者');
    const opponentName = isCreator ? (report.challenger_name || '挑战者') : (report.creator_name || '发起者');
    const myTier = isCreator ? (report.creator_tier || '') : (report.challenger_tier || '');
    const opponentTier = isCreator ? (report.challenger_tier || '') : (report.creator_tier || '');

    this.setData({
      isWinner: report.result === 'win',
      isDraw: report.result === 'draw',
      myScore,
      opponentScore,
      totalQuestions: report.total_questions || 7,
      myName,
      opponentName,
      myTier,
      opponentTier,
      energyChange: report.energy_change || 0,
      rankChange: report.rank_change || 0,
      isRankDown: !!(report.demotion && report.demotion.demoted),
      newRankName: (report.demotion && report.demotion.to) || '',
    });
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
  },

  goToRank() {
    wx.navigateTo({ url: '/pages/huatuo/rank/rank' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/huatuo/huatuo' });
  },

  onShareAppMessage() {
    return {
      title: '中医知识脑洞对战，敢不敢来一局？',
      path: '/pages/huatuo/brain/index',
    };
  },
});
