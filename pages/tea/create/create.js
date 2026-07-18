const { request } = require('../../../utils/request.js');
const { aiCreateFormula, collectFormula } = require('../../../services/tea.js');

Page({
  data: {
    currentTheme: 'warm',
    materials: [],
    seasons: [],
    crowds: [],
    season: '',
    crowd: '',
    loading: false,
    result: null,
    isCollected: false,
    collectedId: null
  },

  async onLoad() {
    const app = getApp();
    this.setData({ currentTheme: app.globalData.theme });
    app.updateNavigationBar(app.globalData.theme);

    wx.showLoading({ title: '加载配置中' });
    try {
      const config = await request({ url: '/api/config/teaOptions' });
      const basicHerbs = (config.basic_herbs || []).map(m => ({ ...m, selected: false, locked: false }));
      const rareHerbs = (config.rare_herbs || []).map(m => ({
        ...m, selected: false,
        locked: m.status === 'locked',
      }));
      const materials = [...basicHerbs, ...rareHerbs];

      this.setData({
        materials,
        seasons: config.seasons || [],
        crowds: config.crowds || [],
        season: config.seasons?.[0]?.val || 'summer',
        crowd: (config.crowds || [])[0] || '上班族'
      });
    } catch (e) {
      console.error('加载字典失败', e);
      wx.showToast({ title: '网络异常，使用默认配置', icon: 'none' });
      this.setData({
        materials: [
          { id: 'boju', name: '亳菊', label: '菊', icon_url: '', desc: '散风清热', selected: false, locked: false },
          { id: 'gouqi', name: '枸杞', label: '杞', icon_url: '', desc: '滋补肝肾', selected: false, locked: false },
          { id: 'chenpi', name: '陈皮', label: '陈皮', icon_url: '', desc: '理气健脾', selected: false, locked: false },
          { id: 'juemingzi', name: '决明子', label: '决明', icon_url: '', desc: '清肝明目', selected: false, locked: false },
          { id: 'renshen', name: '人参', label: '人参', icon_url: '', desc: '大补元气', selected: false, locked: true, unlock_tips: '盲盒抽取或秘境闯关获取' },
          { id: 'lingzhi', name: '灵芝', label: '灵芝', icon_url: '', desc: '补气安神', selected: false, locked: true, unlock_tips: '盲盒抽取或秘境闯关获取' },
        ],
        seasons: [
          { val: 'spring', label: '春季' },
          { val: 'summer', label: '夏季' },
          { val: 'autumn', label: '秋季' },
          { val: 'winter', label: '冬季' }
        ],
        crowds: ['上班族', '学生党', '中老年', '女性调理', '熬夜人群'],
        season: 'summer',
        crowd: '上班族'
      });
    } finally {
      wx.hideLoading();
    }
  },

  toggleMaterial(e) {
    const id = e.currentTarget.dataset.id;
    const materials = this.data.materials;
    const index = materials.findIndex(item => item.id === id);
    const item = materials[index];

    // 钩子：锁定药材弹窗引导至游戏系统
    if (item.locked) {
      wx.showModal({
        title: '🔒 ' + item.name,
        content: item.unlock_tips || '需通过盲盒抽取或秘境闯关解锁',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    const count = materials.filter(m => m.selected).length;
    if (!item.selected && count >= 3) {
      wx.showToast({ title: '最多选择3种药材', icon: 'none' });
      return;
    }

    materials[index].selected = !materials[index].selected;
    this.setData({ materials, result: null, isCollected: false, collectedId: null });
  },

  setSeason(e) {
    this.setData({ season: e.currentTarget.dataset.val, result: null, isCollected: false, collectedId: null });
  },

  setCrowd(e) {
    this.setData({ crowd: e.currentTarget.dataset.val, result: null, isCollected: false, collectedId: null });
  },

  async generate() {
    const selectedIds = this.data.materials.filter(m => m.selected).map(m => m.id);
    if (selectedIds.length === 0) {
      wx.showToast({ title: '请至少选择1种药材', icon: 'none' });
      return;
    }

    this.setData({ loading: true, result: null, isCollected: false, collectedId: null });

    try {
      const res = await aiCreateFormula(selectedIds, this.data.season, this.data.crowd);
      this.setData({
        result: res.data || res,
        loading: false
      });
      wx.pageScrollTo({ scrollTop: 800, duration: 300 });
    } catch (err) {
      console.error(err);
      this.setData({ loading: false });
      wx.showToast({ title: '生成异常，已使用基础配方', icon: 'none' });
    }
  },

  async toggleCollect() {
    const { result, isCollected, collectedId } = this.data;

    if (isCollected) {
      try {
        await collectFormula({ action: 0, id: collectedId });
        this.setData({ isCollected: false, collectedId: null });
        wx.showToast({ title: '已取消收藏', icon: 'success' });
      } catch (err) {
        console.error(err);
        wx.showToast({ title: '操作失败，请重试', icon: 'none' });
      }
    } else {
      if (!result || !result.name) {
        wx.showToast({ title: '配方信息异常，无法收藏', icon: 'none' });
        return;
      }
      try {
        const res = await collectFormula({
          action: 1,
          name: result.name,
          tags: result.tags || [],
          desc: result.desc || '',
          formula: result.formula || '',
          suitable: result.suitable || '',
          contraindications: result.contraindications || ''
        });
        const newId = (res && res.id);
        this.setData({ isCollected: true, collectedId: newId });
        wx.showToast({ title: '已收藏', icon: 'success' });
      } catch (err) {
        console.error(err);
        wx.showToast({ title: '操作失败，请重试', icon: 'none' });
      }
    }
  }
});
