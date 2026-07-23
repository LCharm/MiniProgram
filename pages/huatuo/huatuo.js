// pages/huatuo/huatuo.js - 华佗AI轻问诊 + 奇遇记 + 脑洞答题 + 修行闯关
const { request } = require('../../utils/request');
const { getLandmarks, checkinLandmark, getBrainQuestions, battleCreate } = require('../../services/game');

/** Haversine 公式：计算两点经纬度的直线距离（米） */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

Page({
  data: {
    currentTheme: 'warm',
    currentTab: 'chat',
    inputValue: '',
    scrollToId: '',
    recording: false,
    msgList: [
      { id: 'msg-0', role: 'ai', content: '老夫华佗，在此候诊。观你气色，近日可有不适？' }
    ],

    // 现世秘境（LBS 景点打卡）
    landmarks: [],
    activeLandmark: null,
    showModal: false,
    isSubmitting: false,
    centerLng: 115.77,
    centerLat: 33.84,
    mapScale: 12,
    markers: [],

    // 快捷标签（含食谱康养）
    quickTags: [
      { id: 'physique', label: '我的体质食谱', prompt: '' },
      { id: 'seasonal', label: '时令药膳推荐', prompt: '请结合当前季节，为我推荐三道日常养生药膳，说明做法和功效。' },
      { id: 'slim', label: '减脂去水肿食谱', prompt: '请给我推荐一套健康的减脂去水肿食谱，食材要容易买到。' },
      { id: 'late', label: '熬夜调理', prompt: '我熬夜怎么调理？' },
      { id: 'stomach', label: '脾胃调养', prompt: '我脾胃不好吃什么？' },
      { id: 'spring', label: '春季养生', prompt: '春季养生怎么做？' },
      { id: 'chrysanthemum', label: '亳菊功效', prompt: '亳菊有什么功效？' },
      { id: 'wuqinxi', label: '五禽戏', prompt: '五禽戏怎么练？' },
    ],
    userPhysical: '',
    showPhysiqueModal: false,
  },

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2, currentTheme: getApp().globalData.theme });
    }
    let subTabApplied = false;
    const subTab = wx.getStorageSync('huatuoSubTab');
    if (subTab) {
      wx.removeStorageSync('huatuoSubTab');
      if (subTab === 'quiz' || subTab === 'story' || subTab === 'dungeon') {
        this.setData({ currentTab: subTab });
        if (subTab === 'dungeon') this.fetchLandmarks();
        subTabApplied = true;
      }
    }
    // 体质详情页 → AI 问诊跨 Tab 跳转（仅在无 subTab 时生效，避免覆盖现世秘境等）
    const app = getApp();
    if (app.globalData.pendingAiPrompt && !subTabApplied) {
      this.setData({ currentTab: 'chat', inputValue: app.globalData.pendingAiPrompt });
      delete app.globalData.pendingAiPrompt;
      this.sendMessage();
    }
    // 加载用户体质数据
    const userPhysical = wx.getStorageSync('userPhysical');
    if (userPhysical) {
      this.setData({ userPhysical });
    }
  },

  // ===== 子标签切换 =====
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab === 'dungeon') this.fetchLandmarks();
  },

  // ===== 问诊 =====
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onQuickTag(e) {
    const { id, prompt } = e.currentTarget.dataset;
    if (id === 'physique' && !this.data.userPhysical) {
      this.setData({ showPhysiqueModal: true });
      return;
    }
    if (id === 'physique') {
      const p = '我最近的体质测试结果是【' + this.data.userPhysical + '】，请为我定制专属的一周养生食谱。';
      this.setData({ inputValue: p });
    } else {
      this.setData({ inputValue: prompt });
    }
    this.sendMessage();
  },

  closePhysiqueModal() {
    this.setData({ showPhysiqueModal: false });
  },

  goToQuiz() {
    this.setData({ showPhysiqueModal: false });
    wx.switchTab({ url: '/pages/quiz/quiz' });
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

  // ===== 奇遇记 → 独立页面 =====
  goToAdventure() {
    wx.navigateTo({ url: '/pages/adventure/adventure' });
  },

  // ===== 脑洞对战大厅 =====
  roomId: '',

  goToBrainBattle() {
    this.setData({ currentTab: 'quiz' });
  },

  async startSolo() {
    if (this._loading) return;
    this._loading = true;
    try {
      const res = await getBrainQuestions();
      const questions = (res && res.questions) ? res.questions : [];
      const isFree = res.is_free !== undefined ? res.is_free : true;
      if (!isFree) {
        wx.showToast({ title: '今日免费次数已用完，本局消耗30灵力', icon: 'none', duration: 2000 });
      }
      getApp().globalData.brainQuiz = { sessionId: res.session_id || '', questions, mode: 'solo' };
      wx.navigateTo({ url: '/pages/huatuo/brain/quiz?mode=solo' });
    } catch (err) {
      if (err.code === 402) {
        wx.showToast({ title: '灵力不足，每局需消耗30灵力', icon: 'none' });
      } else {
        wx.showToast({ title: '题目加载失败，请重试', icon: 'none' });
      }
    } finally {
      this._loading = false;
    }
  },

  async startBattle() {
    if (this._loading) return;
    this._loading = true;
    try {
      const res = await battleCreate();
      this.setData({ roomId: res.room_id });
      wx.showToast({ title: '房间已创建，请分享给好友', icon: 'none', duration: 2000 });
      getApp().globalData.brainQuiz = {
        roomId: res.room_id,
        questions: res.questions || [],
        mode: 'battle',
        role: 'creator'
      };
      wx.navigateTo({ url: '/pages/huatuo/brain/quiz?mode=battle&role=creator' });
    } catch (err) {
      if (err.code === 402) {
        wx.showToast({ title: '灵力不足，对战需要30灵力', icon: 'none' });
      } else {
        wx.showToast({ title: '创建房间失败，请重试', icon: 'none' });
      }
    } finally {
      this._loading = false;
    }
  },

  // ===== 脑洞排行榜 =====
  goToBrainRank() {
    wx.navigateTo({ url: '/pages/huatuo/rank/rank' });
  },

  // ===== 现世秘境（LBS 景点打卡）=====
  async fetchLandmarks() {
    try {
      const data = await getLandmarks();
      const landmarks = data || [];
      const markers = landmarks.map(l => ({
        id: l.id,
        latitude: l.latitude,
        longitude: l.longitude,
        title: l.name,
        iconPath: '/images/marker-lantern.png',
        width: 64,
        height: 64,
        anchor: { x: 0.5, y: 0.25 },
        callout: {
          content: l.name,
          color: '#5C3A21',
          fontSize: 14,
          borderRadius: 8,
          bgColor: '#F4EFE6',
          padding: 8,
          display: 'ALWAYS',
          textAlign: 'center',
        },
      }));
      let centerLng = 115.77, centerLat = 33.84;
      if (landmarks.length > 0) {
        const lngs = landmarks.map(l => l.longitude);
        const lats = landmarks.map(l => l.latitude);
        centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      }
      this.setData({ landmarks, markers, centerLng, centerLat });
    } catch (err) {
      console.error('[Landmarks] 加载失败', err);
    }
  },

  onMarkerTap(e) {
    const id = e.detail.markerId;
    const landmark = this.data.landmarks.find(l => l.id === id);
    if (!landmark) return;
    this.setData({ activeLandmark: landmark, showModal: true });
  },

  onTapLandmark(e) {
    const id = e.currentTarget.dataset.id;
    const landmark = this.data.landmarks.find(l => l.id === id);
    if (!landmark) return;
    this.setData({ activeLandmark: landmark, showModal: true });
  },

  closeModal() {
    this.setData({ showModal: false, activeLandmark: null });
  },

  preventBubble() {},

  async onCheckin() {
    if (this.data.isSubmitting) return;
    const landmark = this.data.activeLandmark;
    if (!landmark) return;

    this.setData({ isSubmitting: true });

    try {
      const locRes = await this._getLocation();
      const { latitude, longitude } = locRes;

      const dist = haversineDistance(latitude, longitude, landmark.latitude, landmark.longitude);
      if (dist > (landmark.radius || 500)) {
        wx.showToast({ title: '距离太远，请前往实地', icon: 'none' });
        this.setData({ isSubmitting: false });
        return;
      }

      const imgRes = await this._chooseImage();
      const filePath = imgRes.tempFilePaths[0];

      wx.showLoading({ title: '打卡中...', mask: true });
      await checkinLandmark(landmark.id, filePath);
      wx.hideLoading();
      wx.showToast({ title: '打卡成功！', icon: 'success' });
      this.closeModal();
    } catch (err) {
      wx.hideLoading();
      if (err && err.detail === '该景点已打卡，无需重复提交') {
        wx.showToast({ title: '该景点已打卡', icon: 'none' });
      } else if (err && err.errMsg && err.errMsg.includes('cancel')) {
        // 用户取消选图/定位，静默
      } else {
        wx.showToast({ title: err.message || '打卡失败', icon: 'none' });
      }
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  onQuiz() {
    const landmark = this.data.activeLandmark;
    if (!landmark) return;
    wx.setStorageSync('quizLandmarkId', landmark.id);
    wx.switchTab({ url: '/pages/quiz/quiz' });
    this.closeModal();
  },

  _getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({ type: 'gcj02', success: resolve, fail: reject });
    });
  },

  _chooseImage() {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: resolve,
        fail: reject,
      });
    });
  },

  preventScroll() {},

  placeholderTap(e) {
    wx.showToast({ title: e.currentTarget.dataset.msg || '功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    if (this.data.roomId) {
      return {
        title: '我押了30点灵力，敢不敢来跟我拼一下中医知识？',
        path: '/pages/huatuo/brain/index?room_id=' + this.data.roomId + '&action=challenge',
      };
    }
    return {
      title: '华佗AI在线问诊，亳州道地药材养生！',
      path: '/pages/huatuo/huatuo',
    };
  },
});
