// components/constitution-sheet/constitution-sheet.js — 体质详情半屏弹窗
const { constitutions } = require('../../utils/constitutionData');

Component({
  properties: {
    typeId: {
      type: String,
      value: '',
      observer: '_onTypeIdChange'
    }
  },

  data: {
    visible: false,
    data: null,
    sections: []
  },

  methods: {
    _onTypeIdChange(id) {
      if (!id) return;
      const info = constitutions[id];
      if (!info) return;

      this.setData({
        data: info,
        sections: [
          { title: '总体特征', content: info.overview },
          { title: '形体特征', content: info.features },
          { title: '常见表现', content: info.manifestations },
          { title: '心理特征', content: info.psychology },
          { title: '易患疾病', content: info.susceptibility },
          { title: '环境适应', content: info.environment },
          { title: '饮食建议', content: info.diet },
          { title: '运动方案', content: info.exercise },
          { title: '起居要点', content: info.routine },
          { title: '推荐茶方', content: info.tea },
          { title: '保健穴位', content: info.acupoints },
        ]
      });
    },

    show(typeId) {
      this._onTypeIdChange(typeId || this.properties.typeId);
      this.setData({ visible: true });
    },

    hide() {
      this.setData({ visible: false });
    },

    onTapMask() {
      this.hide();
    },

    onTapSheet() {
      // 阻止冒泡，空函数占位
    },

    onAskAI() {
      const info = this.data.data;
      if (!info) return;
      this.triggerEvent('askAi', { constitutionName: info.name });
    }
  }
});
