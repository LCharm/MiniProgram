const { aiCreateFormula } = require('../../../services/tea.js');

Page({
  data: {
    materials: [
      { id: 'boju', name: '亳菊', icon: '🌼', selected: false },
      { id: 'gouqi', name: '枸杞', icon: '🔴', selected: false },
      { id: 'chenpi', name: '陈皮', icon: '🍊', selected: false },
      { id: 'juemingzi', name: '决明子', icon: '🫘', selected: false },
      { id: 'jinyinhua', name: '金银花', icon: '🌿', selected: false },
      { id: 'sangye', name: '桑叶', icon: '🍃', selected: false },
      { id: 'huangqi', name: '黄芪', icon: '🪵', selected: false },
      { id: 'fuling', name: '茯苓', icon: '🍄', selected: false }
    ],
    season: 'summer',
    crowd: '上班族',
    loading: false,
    result: null
  },

  toggleMaterial(e) {
    const id = e.currentTarget.dataset.id;
    let count = 0;
    const materials = this.data.materials.map(item => {
      if (item.selected) count++;
      return item;
    });

    const index = materials.findIndex(item => item.id === id);
    if (!materials[index].selected && count >= 3) {
      wx.showToast({ title: '最多选择3种药材', icon: 'none' });
      return;
    }

    materials[index].selected = !materials[index].selected;
    this.setData({ materials, result: null });
  },

  setSeason(e) {
    this.setData({ season: e.currentTarget.dataset.val, result: null });
  },

  setCrowd(e) {
    this.setData({ crowd: e.currentTarget.dataset.val, result: null });
  },

  async generate() {
    const selectedIds = this.data.materials.filter(m => m.selected).map(m => m.id);
    if (selectedIds.length === 0) {
      wx.showToast({ title: '请至少选择1种药材', icon: 'none' });
      return;
    }

    this.setData({ loading: true, result: null });

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
  }
});
