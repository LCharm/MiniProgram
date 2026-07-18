// pages/quiz/quiz.js - 中医体质分类与判定量表 + 神游古迹答题
const { request } = require('../../utils/request.js');
const quizData = require('../../utils/quizData.js');
const { getLandmarkQuiz, settleLandmarkQuiz } = require('../../services/game.js');

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
    currentTheme: 'warm',
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
    resultData: null,

    // 神游古迹（景点答题）
    quizMode: 'constitution',   // 'constitution' | 'landmark'
    landmarkId: null,
    landmarkQuestions: [],
    landmarkIdx: 0,
    landmarkAnswers: [],        // { correct: bool, userIdx: int }
    landmarkShowResult: false,  // 每题作答后短暂展示正误
    landmarkResult: null,       // 结算结果
    landmarkLoading: false,
    landmarkSubmitting: false,
  },

  onLoad(options) {
    if (options.landmark_id) {
      this._enterLandmarkMode(Number(options.landmark_id));
    }
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1, currentTheme: getApp().globalData.theme });
    }
    // 来自"现世秘境-神游古迹"的跳转（通过 storage 传参）
    const landmarkId = wx.getStorageSync('quizLandmarkId');
    if (landmarkId) {
      wx.removeStorageSync('quizLandmarkId');
      this._enterLandmarkMode(landmarkId);
    }
  },

  _enterLandmarkMode(landmarkId) {
    if (this._landmarkTimer) { clearTimeout(this._landmarkTimer); this._landmarkTimer = null; }
    wx.setNavigationBarTitle({ title: '神游古迹' });
    this.setData({
      quizMode: 'landmark',
      landmarkId,
      landmarkQuestions: [],
      landmarkIdx: 0,
      landmarkAnswers: [],
      landmarkShowResult: false,
      landmarkResult: null,
      landmarkLoading: true,
    });
    this._fetchLandmarkQuestions();
  },

  async _fetchLandmarkQuestions() {
    try {
      const data = await getLandmarkQuiz(this.data.landmarkId);
      this.setData({ landmarkQuestions: data || [], landmarkLoading: false });
    } catch (err) {
      wx.showToast({ title: '题目加载失败', icon: 'none' });
      this.setData({ landmarkLoading: false, quizMode: 'constitution' });
    }
  },

  // ===== 神游古迹答题 =====
  selectLandmarkAnswer(e) {
    if (this.data.landmarkShowResult) return;
    const userIdx = e.currentTarget.dataset.idx;
    const question = this.data.landmarkQuestions[this.data.landmarkIdx];
    if (!question) return;

    const correct = userIdx === question.correct_index;
    const answers = [...this.data.landmarkAnswers, { correct, userIdx }];

    this.setData({ landmarkAnswers: answers, landmarkShowResult: true });

    if (correct) {
      // 答对 → 1.5s 后丝滑自动推进
      this._landmarkTimer = setTimeout(() => {
        this._advanceLandmark();
      }, 1500);
    }
    // 答错 → 打断自动流转，用户手动点击"下一题"
  },

  nextLandmarkQuestion() {
    if (this._landmarkTimer) {
      clearTimeout(this._landmarkTimer);
      this._landmarkTimer = null;
    }
    this._advanceLandmark();
  },

  _advanceLandmark() {
    if (this.data.landmarkIdx < 2) {
      this.setData({
        landmarkIdx: this.data.landmarkIdx + 1,
        landmarkShowResult: false,
      });
    } else {
      this._settleLandmarkQuiz();
    }
  },

  async _settleLandmarkQuiz() {
    if (this.data.landmarkSubmitting) return;
    const score = this.data.landmarkAnswers.filter(a => a.correct).length;

    this.setData({ landmarkSubmitting: true });
    try {
      const res = await settleLandmarkQuiz(this.data.landmarkId, score);
      this.setData({ landmarkResult: res, landmarkSubmitting: false });
    } catch (err) {
      wx.showToast({ title: err.message || '结算失败', icon: 'none' });
      this.setData({ landmarkSubmitting: false });
    }
  },

  exitLandmarkQuiz() {
    wx.setNavigationBarTitle({ title: '体质测评' });
    this.setData({ quizMode: 'constitution', landmarkResult: null });
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

  async generateFinalReport() {
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

    // 发送到云端入库
    try {
      await request({
        url: '/physical/submit',
        method: 'POST',
        data: {
          major_type: majorName,
          score: isPingHe ? finalScores['pinghe'] : highestBiasedScore,
          details: finalScores
        }
      });
    } catch (e) {
      console.error('云端入库失败', e);
    }

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
