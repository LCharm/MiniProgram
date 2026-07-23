Component({
  properties: {
    chartData: {
      type: Array,
      value: [],
      observer: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.initAndDraw();
        }
      }
    }
  },

  methods: {
    initAndDraw() {
      const query = this.createSelectorQuery().in(this);
      query.select('#lineChart')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0] || !res[0].node) return;

          const width = res[0].width;
          const height = res[0].height;
          if (width <= 0 || height <= 0) return;

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          this.renderChart(ctx, width, height, this.properties.chartData);
        });
    },

    renderChart(ctx, width, height, data) {
      if (!data || data.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      const padding = { top: 40, right: 30, bottom: 30, left: 45 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const scores = data.map(item => item.score || 0);
      let maxScore = Math.max(...scores);
      let minScore = Math.min(...scores);

      if (maxScore === minScore) {
        maxScore = maxScore < 90 ? maxScore + 10 : 100;
        minScore = minScore > 10 ? minScore - 10 : 0;
      } else {
        const diff = maxScore - minScore;
        maxScore += diff * 0.2;
        minScore -= diff * 0.2;
      }

      if (maxScore > 100) maxScore = 100;
      if (minScore < 0) minScore = 0;

      const yRange = maxScore - minScore;

      // Y 轴网格与刻度
      const ySteps = 4;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '11px sans-serif';

      for (let i = 0; i <= ySteps; i++) {
        const stepVal = minScore + (yRange / ySteps) * i;
        const y = padding.top + chartHeight - (chartHeight / ySteps) * i;

        ctx.fillStyle = '#999999';
        ctx.fillText(Math.round(stepVal), padding.left - 10, y);

        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.strokeStyle = '#F0EDEB';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 坐标映射
      const points = data.map((item, index) => {
        const x = data.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (chartWidth / (data.length - 1)) * index;
        const y = padding.top + chartHeight - ((item.score - minScore) / yRange) * chartHeight;
        return { x, y, score: item.score, date: item.date };
      });

      // 折线
      if (points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#C38B3A';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }

      // 数据点与文本
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#C38B3A';
        ctx.stroke();

        ctx.fillStyle = '#C38B3A';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(p.score, p.x, p.y - 10);

        ctx.fillStyle = '#999999';
        ctx.font = '11px sans-serif';
        ctx.fillText(p.date || '', p.x, height - 8);
      });
    }
  }
});
