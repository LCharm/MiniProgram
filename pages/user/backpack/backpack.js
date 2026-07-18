// pages/user/backpack/backpack.js - 我的背包
const { getBackpack } = require('../../../services/user');
const { redeemItem } = require('../../../services/tea');

Page({
  data: {
    currentTheme: 'warm',
    currentTab: 'herbs',
    herbs: [],
    vouchers: [],
    props: [],
    loading: true,

    // 兑换 Modal
    showRedeemModal: false,
    currentRedeemItem: null,
    redeemForm: { name: '', phone: '', address: '' },
  },

  _submitLocked: false,

  onLoad() {
    this.setData({ currentTheme: getApp().globalData.theme });
    this.fetchBackpack();
  },

  onShow() {
    this.setData({ currentTheme: getApp().globalData.theme });
    getApp().updateNavigationBar(getApp().globalData.theme);
    this.fetchBackpack();
  },

  async fetchBackpack() {
    this.setData({ loading: true });
    try {
      const data = await getBackpack();
      this.setData({
        herbs: data.herbs || [],
        vouchers: data.vouchers || [],
        props: data.props || [],
        loading: false,
      });
    } catch (err) {
      console.error('背包加载失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  openRedeemModal(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showRedeemModal: true,
      currentRedeemItem: item,
      redeemForm: { name: '', phone: '', address: '' },
    });
  },

  closeRedeemModal() {
    this.setData({ showRedeemModal: false, currentRedeemItem: null });
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['redeemForm.' + field]: e.detail.value });
  },

  async submitRedeem() {
    // 防抖：防止重复提交
    if (this._submitLocked) return;
    this._submitLocked = true;

    const { name, phone, address } = this.data.redeemForm;

    // 校验非空
    if (!name || !phone || !address) {
      wx.showToast({ title: '请填写完整收货信息', icon: 'none' });
      this._submitLocked = false;
      return;
    }

    // 校验手机号格式（11位数字）
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      wx.showToast({ title: '请输入正确的11位手机号码', icon: 'none' });
      this._submitLocked = false;
      return;
    }

    wx.showLoading({ title: '提交中...', mask: true });

    try {
      await redeemItem(this.data.currentRedeemItem.item_id, name, phone, address);
      wx.hideLoading();
      wx.showToast({ title: '兑换订单已生成', icon: 'success' });
      this.closeRedeemModal();
      this.fetchBackpack();
    } catch (err) {
      wx.hideLoading();
      const errMsg = (err.data || err).detail || err.message || '兑换失败';
      wx.showToast({ title: errMsg, icon: 'none', duration: 2000 });
    }

    this._submitLocked = false;
  },

  onPullDownRefresh() {
    this.fetchBackpack().then(() => wx.stopPullDownRefresh());
  },
});
