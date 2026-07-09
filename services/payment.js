// services/payment.js - 微信支付集成
const { request } = require('../utils/request');

/**
 * 创建会员订单并拉起支付
 * @param {number} vipType 1=月度 2=季度 3=年度
 */
const createVipOrder = async (vipType) => {
  const prepayResult = await request({
    url: '/vip/createVipOrder',
    method: 'POST',
    data: { vipType },
  });

  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: prepayResult.timeStamp,
      nonceStr: prepayResult.nonceStr,
      package: prepayResult.package,
      signType: prepayResult.signType || 'RSA',
      paySign: prepayResult.paySign,
      success: () => resolve({ success: true, orderId: prepayResult.orderId }),
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          resolve({ success: false, reason: 'cancelled' });
        } else {
          reject({ success: false, reason: 'payment_failed', detail: err });
        }
      },
    });
  });
};

/**
 * 申请订阅消息推送权限（通关提醒、打卡提醒等）
 * @param {Array} templateIds 模板 ID 列表
 */
const requestSubscription = async (templateIds) => {
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res) => {
        const accepted = templateIds.filter((id) => res[id] === 'accept');
        resolve({ accepted, result: res });
      },
      fail: () => resolve({ accepted: [], result: {} }),
    });
  });
};

/**
 * 查询订单支付状态
 */
const queryOrderStatus = (orderId) =>
  request({ url: '/order/queryStatus', data: { orderId } });

module.exports = { createVipOrder, requestSubscription, queryOrderStatus };
