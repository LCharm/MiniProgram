// services/user.js - 用户资产与背包
const { request } = require('../utils/request');

const getBackpack = () => request({ url: '/user/backpack' });

module.exports = { getBackpack };
