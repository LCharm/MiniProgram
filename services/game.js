// services/game.js - 游戏模块 业务逻辑
const { request } = require('../utils/request');

/** 获取用户段位信息 */
const getUserRank = () => request({ url: '/game/getUserRank' });

/** 提交闯关结果 */
const submitStagePass = (stageId, score) =>
  request({
    url: '/game/submitStagePass',
    method: 'POST',
    data: { stageId, score },
  });

/** 开启盲盒 */
const openBlindBox = () =>
  request({ url: '/game/openBlindBox', method: 'POST' });

/** 获取每日任务列表 */
const getDailyTasks = () => request({ url: '/game/getDailyTasks' });

/** 提交任务完成 */
const completeTask = (taskId) =>
  request({
    url: '/game/completeTask',
    method: 'POST',
    data: { taskId },
  });

/** 发起 PK 挑战 */
const startPK = (targetUserId) =>
  request({
    url: '/game/startPK',
    method: 'POST',
    data: { targetUserId },
  });

/** 获取排行榜 */
const getRankList = (type = 'weekly') =>
  request({ url: '/game/getRankList', data: { type } });

/** 获取用户卡牌图鉴 */
const getCardBook = () => request({ url: '/game/getCardBook' });

/** 合成药材碎片 */
const synthesizeMaterial = (materialId) =>
  request({
    url: '/game/synthesizeMaterial',
    method: 'POST',
    data: { materialId },
  });

/** 兑换积分 */
const exchangePoints = (type, amount) =>
  request({
    url: '/game/exchangePoints',
    method: 'POST',
    data: { type, amount },
  });

module.exports = {
  getUserRank,
  submitStagePass,
  openBlindBox,
  getDailyTasks,
  completeTask,
  startPK,
  getRankList,
  getCardBook,
  synthesizeMaterial,
  exchangePoints,
};
