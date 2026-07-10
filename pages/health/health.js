// pages/health/health.js - AI体质养生管家首页
const { submitClock, getSolarTermInfo } = require('../../services/health');
const { getDailyTasks, openBlindBox, getUserRank } = require('../../services/game');
const app = getApp();

const DEFAULT_TASKS = [
  { id: 'sleep', type: 'sleep', text: '早睡打卡（23:00前）', reward: '+20灵力', action: 'clock' },
  { id: 'water', type: 'water', text: '晨起喝水记录', reward: '+15灵力', action: 'clock' },
  { id: 'exercise', type: 'exercise', text: '今日运动30分钟', reward: '+25灵力', action: 'clock' },
  { id: 'quiz', type: 'quiz', text: '完成养生答题', reward: '+30灵力', action: 'navigate', url: '/pages/huatuo/huatuo' },
];

const RECOMMENDATIONS = {
  pinghe: {
    tea: '百花蜜茶 · 枸杞菊花茶', teaTip: '日常保健，随意饮用',
    exercise: '五禽戏全套', exerciseTip: '每日20分钟，全面调理',
    diet: '五谷杂粮 · 荤素搭配', dietTip: '食不过饱，三餐规律',
    routine: '22:30入睡 · 6:30起床', routineTip: '保持规律作息即可'
  },
  qixu: {
    tea: '黄芪大枣茶 · 党参茶', teaTip: '每日1杯，避免空腹',
    exercise: '五禽戏·鸟戏', exerciseTip: '轻柔缓慢，不宜大汗',
    diet: '山药粥 · 小米红枣粥', dietTip: '多食甘温益气之品，少食生冷',
    routine: '22:00入睡 · 午休30分钟', routineTip: '避免过劳，保存体力'
  },
  yangxu: {
    tea: '姜枣桂圆茶 · 肉桂红茶', teaTip: '上午饮用，温热服',
    exercise: '八段锦·两手托天', exerciseTip: '上午锻炼，注意保暖',
    diet: '当归生姜羊肉汤 · 韭菜炒蛋', dietTip: '多食温热食物，少食寒凉',
    routine: '早睡晚起 · 多晒太阳', routineTip: '尤其注意腰腹和足部保暖'
  },
  yinxu: {
    tea: '银耳百合羹 · 麦冬枸杞茶', teaTip: '下午或晚间饮用',
    exercise: '太极拳云手', exerciseTip: '微汗即止，避免高温',
    diet: '银耳莲子羹 · 鸭肉炖汤', dietTip: '多食滋阴润燥之品，忌辛辣',
    routine: '23:00前入睡 · 午后小憩', routineTip: '避免熬夜，节制房事'
  },
  tanshi: {
    tea: '荷叶茯苓茶 · 陈皮薏米水', teaTip: '早晚各一杯',
    exercise: '快走 · 五禽戏·熊经', exerciseTip: '每次30分钟以上，微出汗',
    diet: '薏米冬瓜汤 · 白萝卜炖排骨', dietTip: '清淡饮食，少食肥甘厚腻',
    routine: '早睡早起 · 饭后散步', routineTip: '避免久坐，多活动身体'
  },
  shire: {
    tea: '绿豆薏米水 · 苦丁茶', teaTip: '饭后饮用，避免甜腻',
    exercise: '游泳 · 高强度间歇', exerciseTip: '多出汗，注意清洁',
    diet: '苦瓜炒蛋 · 芹菜拌木耳', dietTip: '清热利湿，忌辛辣油腻甜食',
    routine: '保持皮肤干爽 · 勤换衣物', routineTip: '避免潮湿闷热环境'
  },
  xueyu: {
    tea: '山楂红糖茶 · 桃仁茶', teaTip: '饭后半小时饮用',
    exercise: '跑步 · 舞蹈', exerciseTip: '促进气血运行，每日坚持',
    diet: '黑豆炖汤 · 醋泡花生', dietTip: '多食活血化瘀之品，少食寒凝',
    routine: '避免久坐久卧 · 常活动', routineTip: '保持心情舒畅，忌郁闷'
  },
  qiyu: {
    tea: '玫瑰花茶 · 佛手柑茶', teaTip: '下午泡饮，舒缓情绪',
    exercise: '瑜伽 · 户外散步', exerciseTip: '多接触自然，放松心情',
    diet: '柑橘 · 香蕉 · 小米粥', dietTip: '多食行气解郁之品，少饮咖啡',
    routine: '睡前冥想10分钟', routineTip: '多社交，避免独处沉思'
  },
  tebing: {
    tea: '玉屏风茶 · 黄芪防风茶', teaTip: '增强免疫，避开过敏原',
    exercise: '太极 · 慢跑', exerciseTip: '循序渐进，避免过劳',
    diet: '清淡饮食 · 避免发物', dietTip: '注意食物过敏，饮食有节',
    routine: '注意防寒保暖 · 戴口罩', routineTip: '远离花粉、尘螨等过敏原'
  }
};

Page({
  data: {
    currentTheme: 'default',
    userInfo: null,
    rankInfo: null,
    dailyTasks: DEFAULT_TASKS,
    solarTerm: null,
    report: null,
    rec: null,
    loading: true,
    todayClocks: {},
    rankStages: [
      { name: '青铜行者', short: '青铜', level: 1, key: 'bronze', bg: '#72563E', text: '#F0D9BF' },
      { name: '白银药师', short: '白银', level: 2, key: 'silver', bg: '#B9BCBF', text: '#FFFFFF' },
      { name: '黄金医士', short: '黄金', level: 3, key: 'gold', bg: '#D3AD36', text: '#FFF7DD' },
      { name: '翡翠圣医', short: '翡翠', level: 4, key: 'emerald', bg: '#2E8074', text: '#D2ECE7' },
      { name: '华佗王者', short: '王者', level: 5, key: 'king', bg: '#9C2923', text: '#FFE2A8' },
    ],
    stageList: [],
    xpPercent: 0,
    xpText: '',
  },

  async onLoad() {
    this.setData({ currentTheme: app.globalData.theme });
    this.loadReport();
    this.loadPageData();
  },

  onShow() {
    this.setData({ currentTheme: app.globalData.theme });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadDailyTasks();
    this.loadReport();
    this.syncQuizCompletion();
  },

  syncQuizCompletion() {
    const quizDone = wx.getStorageSync('brainQuizDone');
    const today = new Date().toLocaleDateString();
    if (quizDone && quizDone.date === today && !this.data.todayClocks['quiz']) {
      const clocks = { ...this.data.todayClocks, quiz: true };
      this.setData({ todayClocks: clocks });
    }
  },

  loadReport() {
    try {
      const report = wx.getStorageSync('latestPhysicalResult');
      if (report) {
        const rec = RECOMMENDATIONS[report.id] || RECOMMENDATIONS.pinghe;
        this.setData({ report, rec });
      }
    } catch (e) {}
  },

  ensureTaskType(tasks) {
    const defaultMap = {};
    DEFAULT_TASKS.forEach(d => { defaultMap[d.id || d.type] = d; });
    const result = (tasks || []).map(t => {
      const def = defaultMap[t.id] || defaultMap[t.type] || {};
      if (!t.type) t.type = String(t.id || '');
      if (!t.action) t.action = def.action || 'clock';
      if (!t.url && def.url) t.url = def.url;
      return t;
    });

    // 确保至少有一个答题类任务指向脑洞答题
    const quizDef = DEFAULT_TASKS.find(d => d.action === 'navigate');
    const hasNavigate = result.some(t => t.action === 'navigate');
    if (!hasNavigate && quizDef) {
      const quizTask = result.find(t =>
        (t.text || t.name || '').includes('答题') ||
        (t.text || t.name || '').includes('测评') ||
        t.type === 'quiz'
      );
      if (quizTask) {
        quizTask.action = 'navigate';
        quizTask.url = quizDef.url;
      }
    }

    return result;
  },

  async loadPageData() {
    this.setData({ loading: true });
    try {
      const [rankInfo, tasks, solarTerm] = await Promise.all([
        getUserRank(),
        getDailyTasks(),
        getSolarTermInfo(),
      ]);
      const currentLevel = (rankInfo && rankInfo.level) || 1;
      const stageList = this.data.rankStages.map(s => ({
        ...s,
        status: s.level < currentLevel ? 'done' : s.level === currentLevel ? 'current' : 'locked'
      }));
      const currentRankStage = this.data.rankStages.find(
        s => s.level === currentLevel
      );
      const rankBadgeStyle = currentRankStage
        ? `background:${currentRankStage.bg};color:${currentRankStage.text}`
        : '';
      const nextStage = this.data.rankStages.find(s => s.level === currentLevel + 1);
      const xpCurrent = rankInfo?.xp || rankInfo?.power || 0;
      const xpNext = rankInfo?.nextXp || rankInfo?.nextPower || 1000;
      const xpPercent = Math.min(100, Math.round((xpCurrent / xpNext) * 100));
      const xpText = nextStage
        ? `战力 ${xpCurrent} / ${xpNext} → 升级${nextStage.name}`
        : `战力 ${xpCurrent} — 已达最高段位`;
      this.setData({
        userInfo: app.globalData.userInfo,
        rankInfo,
        rankBadgeStyle,
        stageList,
        xpPercent,
        xpText,
        dailyTasks: this.ensureTaskType(tasks).length ? tasks : DEFAULT_TASKS,
        solarTerm,
        loading: false,
      });
    } catch (e) {
      this.setData({
        dailyTasks: DEFAULT_TASKS,
        loading: false,
      });
    }
  },

  async loadDailyTasks() {
    try {
      const tasks = await getDailyTasks();
      if (tasks && tasks.length) {
        this.setData({ dailyTasks: this.ensureTaskType(tasks) });
      }
    } catch (e) {}
  },

  handleTaskTap(e) {
    const { type, label, action, url } = e.currentTarget.dataset;
    const key = type || String(e.currentTarget.dataset.id || '');
    if (!key) return;

    if (action === 'navigate') {
      if (this.data.todayClocks[key]) {
        wx.showToast({ title: '已完成', icon: 'none' });
        return;
      }
      wx.setStorageSync('huatuoSubTab', 'quiz');
      wx.switchTab({ url: url || '/pages/huatuo/huatuo' });
      return;
    }

    if (this.data.todayClocks[key]) {
      wx.showToast({ title: '已完成', icon: 'none' });
      return;
    }
    const clocks = { ...this.data.todayClocks, [key]: true };
    this.setData({ todayClocks: clocks });

    try { submitClock(key, label); } catch (e) {}

    wx.showToast({ title: '已打卡', icon: 'success' });
  },

  handleOpenBox() {
    const tasks = this.data.dailyTasks;
    const total = tasks.length;
    const doneCount = tasks.filter(t => this.data.todayClocks[t.type]).length;
    if (doneCount < total) {
      wx.showToast({ title: `${doneCount}/${total}，全部完成才能开盒`, icon: 'none' });
      return;
    }

    try { openBlindBox(); } catch (e) {}

    const now = new Date().toLocaleDateString();
    const items = wx.getStorageSync('backpackItems') || [];
    items.push({ name: '亳菊茯苓茶体验装', qty: 1, source: '盲盒', date: now });
    wx.setStorageSync('backpackItems', items);

    wx.showModal({
      title: '🎁 盲盒开启！',
      content: '🎁 亳菊茯苓茶体验装 ×1\n ⚡ 灵力 +30',
      showCancel: false,
      confirmText: '太棒了！',
    });
  },

  viewAllTasks() {
    wx.showToast({ title: '更多任务开发中', icon: 'none' });
  },

  goToQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' });
  },

  goTongue() {
    wx.showToast({ title: '舌象识别功能开发中', icon: 'none' });
  },

  goReport() {
    wx.navigateTo({ url: '/pages/health/report/report' });
  },

  goStation() {
    wx.showToast({ title: '养生驿站功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    const rank = this.data.rankInfo;
    return {
      title: `我在华佗养生秘境达到了${rank?.rankName || '白银药师'}段位！`,
      path: '/pages/health/health',
      imageUrl: '',
    };
  },

  onShareTimeline() {
    return {
      title: '亳州华佗AI养生小程序，免费测体质！',
      query: 'from=timeline',
    };
  },

  onPullDownRefresh() {
    this.loadPageData().then(() => wx.stopPullDownRefresh());
  },
});
