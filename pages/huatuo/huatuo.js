// pages/huatuo/huatuo.js - 华佗AI轻问诊 + 奇遇记 + 脑洞答题 + 修行闯关
const { request } = require('../../utils/request');

function parseMarkdown(text) {
  if (!text) return [{ type: 'text', inlines: [{ style: '', text: '' }] }];
  const lines = text.split('\n');
  const segments = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank line → spacer
    if (!trimmed) {
      segments.push({ type: 'spacer' });
      continue;
    }

    // heading: entire line wrapped in **...**
    if (/^\*\*.+\*\*$/.test(trimmed)) {
      segments.push({
        type: 'heading',
        inlines: [{ style: 'b', text: trimmed.replace(/^\*\*|\*\*$/g, '') }]
      });
      continue;
    }

    // bullet list: - text or • text
    const bulletMatch = trimmed.match(/^([-•])\s+(.+)/);
    if (bulletMatch) {
      segments.push({
        type: 'list',
        inlines: parseInlines(bulletMatch[2])
      });
      continue;
    }

    // numbered list: 1. text or 1、text
    const numMatch = trimmed.match(/^(\d+)[.、]\s*(.+)/);
    if (numMatch) {
      segments.push({
        type: 'list-num',
        num: numMatch[1],
        inlines: parseInlines(numMatch[2])
      });
      continue;
    }

    // regular text with possible inline bold
    segments.push({
      type: 'text',
      inlines: parseInlines(trimmed)
    });
  }

  return segments;
}

function parseInlines(text) {
  const parts = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const boldStart = remaining.indexOf('**');
    if (boldStart === -1) {
      parts.push({ style: '', text: remaining });
      break;
    }
    if (boldStart > 0) {
      parts.push({ style: '', text: remaining.substring(0, boldStart) });
    }
    remaining = remaining.substring(boldStart + 2);
    const boldEnd = remaining.indexOf('**');
    if (boldEnd === -1) {
      parts.push({ style: 'b', text: remaining });
      break;
    }
    parts.push({ style: 'b', text: remaining.substring(0, boldEnd) });
    remaining = remaining.substring(boldEnd + 2);
  }

  return parts.filter(p => p.text.length > 0);
}

const DUNGEON_STAGES = [
  { id: 0, name: '亳菊山谷', emoji: '🌼', desc: '亳菊盛开之地，学习基础养生知识', reward: '亳菊卡牌 ×1 · 灵力+50' },
  { id: 1, name: '白芍花海', emoji: '🌸', desc: '白芍芬芳，掌握四季调理要诀', reward: '白芍卡牌 ×1 · 灵力+80' },
  { id: 2, name: '茯苓秘境', emoji: '🍄', desc: '深入秘境，挑战体质辨识难题', reward: '茯苓卡牌 ×1 · 灵力+120' },
  { id: 3, name: '华佗试炼', emoji: '⚕️', desc: '华佗亲设关卡，综合养生大考', reward: '华佗真传卡牌 ×1 · 灵力+200' },
  { id: 4, name: '王者之巅', emoji: '👑', desc: '终极试炼，解锁王者宗师段位', reward: '王者勋章 ×1 · 灵力+500' },
];

const BRAIN_QUESTIONS = [
  { q: '以下哪种说法是正确的养生常识？', opts: ['A. 喝凉水对肠胃有好处', 'B. 熬夜后多睡一天就能补回来', 'C. 五禽戏是华佗创立的养生运动 ✓', 'D. 喝酒能活血，每天喝点好'], ans: 2 },
  { q: '亳州"四大道地药材"包含哪个？', opts: ['A. 人参', 'B. 亳菊 ✓', 'C. 冬虫夏草', 'D. 三七'], ans: 1 },
  { q: '中医体质共分为几种？', opts: ['A. 5种', 'B. 7种', 'C. 9种 ✓', 'D. 12种'], ans: 2 },
  { q: '华佗创立的养生功法叫什么？', opts: ['A. 太极拳', 'B. 五禽戏 ✓', 'C. 八段锦', 'D. 易筋经'], ans: 1 },
  { q: '以下哪个不是亳州道地药材？', opts: ['A. 亳菊', 'B. 白芍', 'C. 人参 ✓', 'D. 茯苓'], ans: 2 },
];

Page({
  data: {
    currentTheme: 'default',
    currentTab: 'chat',
    inputValue: '',
    scrollToId: '',
    recording: false,
    msgList: [
      { id: 'msg-0', role: 'ai', content: '老夫华佗，在此候诊。观你气色，近日可有不适？' }
    ],

    // 脑洞答题
    energyVal: 0,
    brainQ: BRAIN_QUESTIONS[0],
    brainAnswered: -1,

    // 修行闯关
    dungeonStages: [],
    currentStage: null,
    dungeonCleared: 0,
    cardCount: 3,
    totalPower: 650,
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.initDungeon();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    const subTab = wx.getStorageSync('huatuoSubTab');
    if (subTab) {
      wx.removeStorageSync('huatuoSubTab');
      if (subTab === 'quiz' || subTab === 'story' || subTab === 'dungeon') {
        this.setData({ currentTab: subTab });
      }
    }
  },

  // ===== 子标签切换 =====
  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // ===== 问诊 =====
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  askQuick(e) {
    this.setData({ inputValue: e.currentTarget.dataset.text });
    this.sendMessage();
  },

  async sendMessage() {
    const text = this.data.inputValue.trim();
    if (!text) return;

    const userMsg = { id: `msg-${Date.now()}`, role: 'user', content: text };
    let currentMsgs = [...this.data.msgList, userMsg];
    this.setData({ msgList: currentMsgs, inputValue: '', scrollToId: 'scroll-bottom' });

    const loadingId = `msg-${Date.now() + 1}`;
    const loadingMsg = { id: loadingId, role: 'ai', typing: true };
    this.setData({ msgList: [...currentMsgs, loadingMsg], scrollToId: 'scroll-bottom' });

    try {
      const res = await request({
        url: '/huatuo/chat',
        method: 'POST',
        data: { message: text }
      });
      currentMsgs = this.data.msgList.filter(msg => msg.id !== loadingId);
      const replyText = res.reply || '老夫刚打了个盹，你再重述一遍。';
      currentMsgs.push({
        id: `msg-${Date.now() + 2}`, role: 'ai',
        content: replyText,
        segments: parseMarkdown(replyText)
      });
      this.setData({ msgList: currentMsgs, scrollToId: 'scroll-bottom' });
    } catch (err) {
      console.error('问诊接口报错:', err);
      currentMsgs = this.data.msgList.filter(msg => msg.id !== loadingId);
      currentMsgs.push({ id: `msg-${Date.now() + 2}`, role: 'ai', content: '网络经络受阻，传音失败。' });
      this.setData({ msgList: currentMsgs, scrollToId: 'scroll-bottom' });
    }
  },

  // ===== 语音输入 =====
  startRecord() {
    this.setData({ recording: true });
    const rm = wx.getRecorderManager();
    rm.start({
      duration: 30000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
    });
    this._recorderManager = rm;
  },

  stopRecord() {
    if (!this._recorderManager) return;
    this.setData({ recording: false });
    this._recorderManager.stop();
    this._recorderManager.onStop((res) => {
      const { tempFilePath } = res;
      wx.showToast({ title: '语音识别开发中', icon: 'none' });
    });
  },

  // ===== 奇遇记 =====
  storyChoice(e) {
    const idx = e.currentTarget.dataset.idx;
    const responses = [
      '✨ 完美！华佗赞许点头：此乃上佳之举。解锁「华佗真传」成就！',
      '💡 华佗微笑道：晨起温水，乃养生第一步，明日试试？',
      '🌿 华佗说：空腹晨游，可先采几朵白芍花，泡水而饮...',
    ];
    wx.showModal({
      title: '📖 华佗回应',
      content: responses[idx] || '华佗捋须沉思...',
      showCancel: false,
      confirmText: '继续游历',
    });
  },

  // ===== 脑洞答题 =====
  brainAnswer(e) {
    if (this.data.brainAnswered >= 0) return;
    const idx = e.currentTarget.dataset.idx;
    const q = this.data.brainQ;
    const correct = idx === q.ans;

    this.setData({ brainAnswered: idx });

    if (correct) {
      const newEnergy = Math.min(100, this.data.energyVal + 25);
      this.setData({ energyVal: newEnergy });
      wx.setStorageSync('brainQuizDone', { date: new Date().toLocaleDateString() });
      wx.showToast({ title: '+25元气值！', icon: 'success' });
    } else {
      wx.showToast({ title: '答错了~', icon: 'none' });
    }

    setTimeout(() => {
      const nextIdx = (BRAIN_QUESTIONS.indexOf(q) + 1) % BRAIN_QUESTIONS.length;
      this.setData({
        brainQ: BRAIN_QUESTIONS[nextIdx],
        brainAnswered: -1,
      });
    }, 1200);
  },

  // ===== 修行闯关 =====
  initDungeon() {
    const cleared = wx.getStorageSync('dungeonCleared') || 0;
    const stages = DUNGEON_STAGES.map((s, i) => ({
      ...s,
      unlocked: i <= cleared,
      current: i === cleared,
    }));
    this.setData({
      dungeonStages: stages,
      currentStage: stages[cleared] || stages[0],
      dungeonCleared: cleared,
    });
  },

  enterStage(e) {
    const stage = this.data.dungeonStages[e.currentTarget.dataset.idx];
    if (!stage.unlocked) {
      wx.showToast({ title: '请先完成前置关卡', icon: 'none' });
      return;
    }
    this.setData({ currentStage: stage });
  },

  startBattle() {
    const stage = this.data.currentStage;
    wx.showModal({
      title: `⚔️ ${stage.name}`,
      content: `${stage.desc}\n\n${stage.reward}\n\n此功能正在开发中，敬请期待！`,
      showCancel: false,
      confirmText: '知道了',
    });
  },

  placeholderTap(e) {
    wx.showToast({ title: e.currentTarget.dataset.msg || '功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: '华佗AI在线问诊，亳州道地药材养生！',
      path: '/pages/huatuo/huatuo',
    };
  },
});
