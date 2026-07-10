// pages/health/report/report.js - 体质养生报告页
const quizData = require('../../../utils/quizData.js');

const CONST_EMOJI = {
  pinghe: '✨', qixu: '😮‍💨', yangxu: '🥶', yinxu: '🔥',
  tanshi: '💧', shire: '🌡️', xueyu: '🫀', qiyu: '😔', tebing: '🤧'
};

const CONST_TIPS = {
  pinghe: '您的体质属于平和质，是中医九种体质中最理想的状态。保持规律作息、均衡饮食、适量运动即可。',
  qixu: '气虚体质以补气养气为原则。宜食山药、大枣、黄芪等，避免过度劳累，可练习五禽戏中的"鸟戏"。',
  yangxu: '阳虚体质以温阳祛寒为原则。宜食羊肉、生姜、桂圆等温性食物，注意保暖，多晒太阳。',
  yinxu: '阴虚体质以滋阴降火为原则。宜食银耳、百合、梨等，少吃辛辣，避免熬夜。',
  tanshi: '痰湿体质以健脾祛湿为原则。宜食薏米、茯苓、冬瓜等，少食肥甘厚腻，增加运动量。',
  shire: '湿热体质以清热利湿为原则。宜食绿豆、苦瓜、薏米等，忌辛辣油腻，保持皮肤清洁。',
  xueyu: '血瘀体质以活血化瘀为原则。宜食山楂、黑豆、红糖等，适当运动促进气血运行。',
  qiyu: '气郁体质以疏肝理气为原则。宜食柑橘、玫瑰花茶等，多参加户外活动，保持心情舒畅。',
  tebing: '特禀体质以益气固表为原则。注意避开过敏原，饮食清淡，适当锻炼增强免疫力。'
};

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
    routine: '早睡晚起 · 多晒太阳', routineTip: '注意腰腹和足部保暖'
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
    report: null,
    rec: null,
    details: [],
  },

  onLoad() {
    const app = getApp();
    this.setData({ currentTheme: app.globalData.theme });

    const report = wx.getStorageSync('latestPhysicalResult');
    if (report) {
      const rec = RECOMMENDATIONS[report.id] || RECOMMENDATIONS.pinghe;
      const details = this.buildDetails(report.details || {}, report.id);
      const tip = CONST_TIPS[report.id] || CONST_TIPS.pinghe;
      this.setData({ report, rec, details, tip });
    }
  },

  buildDetails(scoreMap, majorId) {
    return quizData.constitutions.map(c => ({
      id: c.id,
      name: c.name,
      emoji: CONST_EMOJI[c.id],
      score: scoreMap[c.id] || 0,
      judgment: this.getJudgment(c.id, scoreMap[c.id] || 0),
      isMajor: c.id === majorId
    }));
  },

  getJudgment(id, score) {
    if (id === 'pinghe') {
      return score >= 60 ? '是' : '否';
    }
    if (score >= 40) return '是';
    if (score >= 30) return '倾向是';
    return '否';
  },

  goToQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' });
  },

  goBack() {
    wx.switchTab({ url: '/pages/health/health' });
  },

  onShareAppMessage() {
    const report = this.data.report;
    return {
      title: report
        ? `我的体质是${report.name}，来看看你的！`
        : 'AI体质养生报告',
      path: '/pages/health/report/report',
    };
  },
});
