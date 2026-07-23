// services/tea.js - 亳州花茶AI配方生成器 业务逻辑
const { request } = require('../utils/request');

const getHotFormula = () => request({ url: '/tea/formulas' });

const getFormulaBySymptom = (symptomType) =>
  request({ url: '/tea/formulas', data: { symptom: symptomType } });

const getFormulaByPhysical = (physicalType) =>
  request({ url: '/tea/formulas', data: { symptom: physicalType } });

const aiCreateFormula = (materialIds, season, crowd) =>
  request({
    url: '/tea/aiCreateFormula',
    method: 'POST',
    data: { materialIds, season, crowd },
  });

const collectFormula = (data) =>
  request({
    url: '/tea/collect',
    method: 'POST',
    data,
  });

const getMyCollect = () => request({ url: '/tea/myCollect' });

const setDrinkRemind = (formulaId, remindTime) =>
  request({
    url: '/tea/setDrinkRemind',
    method: 'POST',
    data: { formulaId, remindTime },
  });

const getMaterialList = () => request({ url: '/tea/getMaterialList' });

const getUserMaterialPieces = () => request({ url: '/game/getUserMaterialPieces' });

const submitContest = (params) =>
  request({
    url: '/contest/formulas',
    method: 'POST',
    data: params,
  });

const getContestList = (params) =>
  request({ url: '/contest/formulas', data: params });

const toggleContestLike = (formulaId) =>
  request({
    url: `/contest/formulas/${formulaId}/like`,
    method: 'POST',
  });

const getBrewedList = () => request({ url: '/tea/brewed' });

const brewTea = (formulaId) =>
  request({ url: '/tea/brew', method: 'POST', data: { formula_id: formulaId } });

const redeemItem = (itemId, recipientName, phone, address) =>
  request({
    url: '/shop/redeem', method: 'POST',
    data: { item_id: itemId, recipient_name: recipientName, phone, address },
  });

const getPublicFormulas = (params = {}) =>
  request({ url: '/contest/formulas/public', data: params });

module.exports = {
  getHotFormula,
  getFormulaBySymptom,
  getFormulaByPhysical,
  aiCreateFormula,
  collectFormula,
  getMyCollect,
  setDrinkRemind,
  getMaterialList,
  getUserMaterialPieces,
  submitContest,
  getContestList,
  toggleContestLike,
  getBrewedList,
  brewTea,
  redeemItem,
  getPublicFormulas,
};
