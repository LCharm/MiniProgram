// services/tea.js - 亳州花茶AI配方生成器 业务逻辑
const { request } = require('../utils/request');

const getHotFormula = () => request({ url: '/tea/getHotFormula' });

const getFormulaBySymptom = (symptomType) =>
  request({ url: '/tea/getFormulaBySymptom', data: { symptomType } });

const getFormulaByPhysical = (physicalType) =>
  request({ url: '/tea/getFormulaByPhysical', data: { physicalType } });

const aiCreateFormula = (materialIds, season, crowd) =>
  request({
    url: '/tea/aiCreateFormula',
    method: 'POST',
    data: { materialIds, season, crowd },
  });

const collectFormula = (formulaId, status) =>
  request({
    url: '/tea/collectFormula',
    method: 'POST',
    data: { formulaId, status },
  });

const getMyCollect = () => request({ url: '/tea/getMyCollect' });

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
    url: '/tea/submitContest',
    method: 'POST',
    data: params,
  });

const getContestList = () => request({ url: '/tea/getContestList' });

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
};
