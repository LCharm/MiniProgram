// pages/quiz/quiz.js - 中医体质分类与判定量表
const quizData = require('../../utils/quizData.js');

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

Page({
  data: {
    currentTheme: 'default',
    step: 'gender',
    userGender: '',
    selectedPhysical: null,
    isFullVersion: false,

    currentQueue: [],
    currentIndex: 0,
    currentAnswer: null,

    answerDict: {},

    optionsList: [
      { label: '没有 (根本不)', score: 1 },
      { label: '很少 (有一点)', score: 2 },
      { label: '有时 (有些)', score: 3 },
      { label: '经常 (相当)', score: 4 },
      { label: '总是 (非常)', score: 5 }
    ],

    // 结果页
    resultData: null
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    wx.removeStorageSync('quizCompletedToday');
    this.setData({ userGender: gender, step: 'testing' });
    this.buildQueue('basic');
  },

  buildQueue(mode) {
    let queue = [];
    const consts = quizData.constitutions;

    consts.forEach(cType => {
      const items = mode === 'basic' ? cType.basic_items : cType.extra_items;
      items.forEach(item => {
        if (item.gender && item.gender !== 'all' && item.gender !== this.data.userGender) {
          return;
        }
        queue.push({
          ...item,
          target: cType.id,
          type: cType.name
        });
      });
    });

    this.setData({
      currentQueue: queue,
      currentIndex: 0,
      currentAnswer: null
    });
  },

  selectOption(e) {
    const score = e.currentTarget.dataset.score;
    const currentQ = this.data.currentQueue[this.data.currentIndex];

    const actualScore = currentQ.reverse ? (6 - score) : score;

    this.setData({ currentAnswer: score });

    this.data.answerDict[currentQ.id] = {
      target: currentQ.target,
      rawScore: actualScore
    };

    setTimeout(() => {
      this.handleNext();
    }, 250);
  },

  handleNext() {
    const { currentIndex, currentQueue } = this.data;

    if (currentIndex < currentQueue.length - 1) {
      this.setData({
        currentIndex: currentIndex + 1,
        currentAnswer: null
      });
    } else {
      if (currentQueue.length <= 30) {
        this.setData({ step: 'intermission' });
      } else {
        this.generateFinalReport();
      }
    }
  },

  prevQuestion() {
    const prev = this.data.currentIndex - 1;
    this.setData({ currentIndex: prev, currentAnswer: null });
  },

  startAdvancedMode() {
    this.setData({ step: 'testing', isFullVersion: true });
    this.buildQueue('extra');
  },

  getJudgment(id, score) {
    const rules = quizData.judgment_rules;
    if (id === 'pinghe') {
      if (score >= 60) return '是';
      return '否';
    }
    if (score >= 40) return '是';
    if (score >= 30) return '倾向是';
    return '否';
  },

  generateFinalReport() {
    wx.showLoading({ title: '国标引擎计算中' });

    const ansDict = this.data.answerDict;
    const scoreMap = {};

    for (let qId in ansDict) {
      const item = ansDict[qId];
      if (!scoreMap[item.target]) {
        scoreMap[item.target] = { totalRaw: 0, count: 0 };
      }
      scoreMap[item.target].totalRaw += item.rawScore;
      scoreMap[item.target].count += 1;
    }

    const finalScores = {};
    for (let target in scoreMap) {
      const { totalRaw, count } = scoreMap[target];
      let converted = ((totalRaw - count) / (count * 4)) * 100;
      finalScores[target] = Math.round(converted);
    }

    let majorId = '';
    let highestBiasedScore = -1;
    let tiedCount = 0;

    for (let target in finalScores) {
      if (target !== 'pinghe') {
        if (finalScores[target] > highestBiasedScore) {
          highestBiasedScore = finalScores[target];
          majorId = target;
          tiedCount = 1;
        } else if (finalScores[target] === highestBiasedScore) {
          tiedCount += 1;
        }
      }
    }

    // 兜底：所有偏颇分数相同时取第一个
    if (!majorId) {
      majorId = quizData.constitutions.find(c => c.type === 'biased').id;
    }

    const isPingHe = finalScores['pinghe'] >= 60 && highestBiasedScore < 30;
    if (isPingHe) { majorId = 'pinghe'; tiedCount = 0; }

    const majorName = quizData.constitutions.find(c => c.id === majorId).name;
    const majorScore = isPingHe ? finalScores['pinghe'] : highestBiasedScore;

    const details = quizData.constitutions.map(c => ({
      id: c.id,
      name: c.name,
      emoji: CONST_EMOJI[c.id],
      score: finalScores[c.id] || 0,
      judgment: this.getJudgment(c.id, finalScores[c.id] || 0)
    }));

    const tieNote = tiedCount > 1
      ? (this.data.isFullVersion
        ? `检测到 ${tiedCount} 种偏颇体质转化分相同（均${highestBiasedScore}分）。您已完成完整版60题，但作答模式高度一致，体质特征不突出。建议结合舌象识别或咨询中医师进一步判断。`
        : `检测到 ${tiedCount} 种偏颇体质转化分相同（均${highestBiasedScore}分），提示您的作答可能过于均匀。建议继续完成进阶测试以获得更精准的区分结果。`)
      : '';

    const resultData = {
      majorId,
      majorName,
      majorScore,
      majorEmoji: CONST_EMOJI[majorId],
      isPingHe,
      details,
      tip: CONST_TIPS[majorId],
      tieNote,
      date: new Date().toLocaleDateString()
    };

    wx.setStorageSync('latestPhysicalResult', {
      id: majorId,
      name: majorName,
      score: majorScore,
      emoji: CONST_EMOJI[majorId],
      date: resultData.date,
      details: finalScores
    });
    wx.setStorageSync('quizCompletedToday', {
      done: true,
      date: new Date().toLocaleDateString()
    });

    wx.hideLoading();
    this.setData({ step: 'result', resultData });
  },

  retakeQuiz() {
    this.setData({
      step: 'gender',
      userGender: '',
      answerDict: {},
      currentQueue: [],
      currentIndex: 0,
      currentAnswer: null,
      resultData: null,
      isFullVersion: false
    });
  },

  goToHealth() {
    wx.switchTab({ url: '/pages/health/health' });
  },

  selectPhysical(e) {
    const { name, desc } = e.currentTarget.dataset;
    this.setData({ selectedPhysical: name });
    wx.showToast({
      title: `${name}：${desc}`,
      icon: 'none',
      duration: 2000
    });
  },

  openTongue() {
    wx.showToast({
      title: '舌象识别功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
});
