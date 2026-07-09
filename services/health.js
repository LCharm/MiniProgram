// services/health.js - AI体质养生管家 业务逻辑
const { request, upload } = require('../utils/request');

/**
 * 获取体质测评题库
 */
const getQuestionList = () => {
  return request({ url: '/physical/getQuestionList' });
};

/**
 * 提交问卷答案
 * @param {Array} answerList [{questionId, userAnswer}]
 * @param {number} testType 1=问卷 2=舌象 3=综合
 */
const submitAnswer = (answerList, testType = 1) => {
  return request({
    url: '/physical/submitAnswer',
    method: 'POST',
    data: { answerList, testType },
  });
};

/**
 * 舌象图片 AI 识别
 * @param {string} filePath 图片本地路径
 */
const uploadTongue = (filePath) => {
  return upload({
    url: '/tongue/uploadAndAnalyse',
    filePath,
    name: 'imageFile',
  });
};

/**
 * 生成综合养生报告
 */
const generateReport = (params) => {
  return request({
    url: '/physical/generateReport',
    method: 'POST',
    data: {
      questionPhysical: params.questionPhysical,
      tonguePhysical: params.tonguePhysical || '',
      age: params.age,
      sex: params.sex,
    },
  });
};

/**
 * 查询历史测评记录
 */
const getTestHistory = () => {
  return request({ url: '/physical/getTestHistory' });
};

/**
 * 健康打卡提交
 * @param {string} clockType sleep|water|exercise|tea
 * @param {string} content 打卡内容
 */
const submitClock = (clockType, content) => {
  return request({
    url: '/clock/submitClock',
    method: 'POST',
    data: { clockType, content },
  });
};

/**
 * 获取附近养生驿站
 */
const getNearStation = (longitude, latitude) => {
  return request({
    url: '/station/getNearStation',
    data: { longitude, latitude },
  });
};

/**
 * 节气养生内容
 */
const getSolarTermInfo = () => {
  return request({ url: '/knowledge/solarTermInfo' });
};

module.exports = {
  getQuestionList,
  submitAnswer,
  uploadTongue,
  generateReport,
  getTestHistory,
  submitClock,
  getNearStation,
  getSolarTermInfo,
};
