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
  request({ url: '/game/openBox', method: 'POST', idempotent: true });

/** 获取每日任务列表 */
const getDailyTasks = () => request({ url: '/game/task/list' });

/** 提交任务打卡 */
const completeTask = (taskId) =>
  request({
    url: '/game/task/complete',
    method: 'POST',
    data: { task_id: taskId },
  });

/** 发起 PK 挑战 */
const startPK = (targetUserId) =>
  request({
    url: '/game/startPK',
    method: 'POST',
    data: { targetUserId },
  });

/** 获取排行榜 */
const getRankList = () =>
  request({ url: '/game/rank/list' });

/** 获取用户百草药材图鉴 */
const getCardBook = () => request({ url: '/game/cardBook' });

/** 对局开始：扣除灵力，获取 session_id */
const matchStart = () => request({ url: '/game/match/start', method: 'POST' });

/** 对局结算：提交 session_id + 分数 */
const matchSettle = (sessionId, score) =>
  request({
    url: '/game/match/settle',
    method: 'POST',
    data: { session_id: sessionId, score },
  });

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

/** 获取脑洞答题题目（随机5题 + session_id） */
const getBrainQuestions = () => request({ url: '/game/brain/questions' });

/** 提交脑洞答题答案进行结算 */
const settleBrainQuiz = (sessionId, answers) =>
  request({
    url: '/game/brain/settle',
    method: 'POST',
    data: { session_id: sessionId, answers },
  });

/** 获取脑洞答题今日排行榜 */
const getBrainRank = () => request({ url: '/game/brain/rank' });

/** 好友对战：创建房间 */
const battleCreate = () => request({ url: '/game/battle/create', method: 'POST' });

/** 好友对战：加入房间 */
const battleJoin = (roomId) =>
  request({ url: '/game/battle/join', method: 'POST', data: { room_id: roomId } });

/** 好友对战：提交答案结算 */
const battleSubmit = (roomId, answers) =>
  request({
    url: '/game/battle/settle',
    method: 'POST',
    data: { room_id: roomId, answers },
  });

/** 获取现世秘境景点列表 */
const getLandmarks = () => request({ url: '/landmarks' });

/** 亲临打卡上传照片 */
const checkinLandmark = (landmarkId, filePath) =>
  new Promise((resolve, reject) => {
    const token = wx.getStorageSync('access_token');
    wx.uploadFile({
      url: 'http://120.27.144.30:8080/landmarks/checkin',
      filePath,
      name: 'photo',
      formData: { landmark_id: String(landmarkId) },
      header: { 'Authorization': token ? `Bearer ${token}` : '' },
      success: (res) => {
        const body = JSON.parse(res.data);
        if (body.code === 200) resolve(body.data);
        else reject(body);
      },
      fail: reject,
    });
  });

/** 神游古迹：获取景点随机3题 */
const getLandmarkQuiz = (landmarkId) =>
  request({ url: `/quiz/questions?landmark_id=${landmarkId}` });

/** 神游古迹：答题结算 */
const settleLandmarkQuiz = (landmarkId, score) =>
  request({
    url: '/quiz/settle',
    method: 'POST',
    data: { landmark_id: landmarkId, score },
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
  matchStart,
  matchSettle,
  getBrainQuestions,
  settleBrainQuiz,
  getBrainRank,
  battleCreate,
  battleJoin,
  battleSubmit,
  getLandmarks,
  checkinLandmark,
  getLandmarkQuiz,
  settleLandmarkQuiz,
};
