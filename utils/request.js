// utils/request.js - 统一请求封装
const BASE_URL = 'http://120.27.144.30:8080';

// 拦截器列表
const interceptors = [];

/**
 * 核心请求方法
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('access_token');

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header,
      },
      timeout: 15000,
      success: (res) => {
        if (res.statusCode === 401) {
          // Token 过期，重新登录
          wx.removeStorageSync('access_token');
          return refreshTokenAndRetry(options).then(resolve).catch(reject);
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data;
          if (body.code === 200) {
            resolve(body.data);
          } else {
            reject({ code: body.code, message: body.msg || '请求失败' });
          }
        } else {
          reject({ code: res.statusCode, message: `HTTP ${res.statusCode}` });
        }
      },
      fail: (err) => {
        console.error('[Request] 网络错误', options.url, err);
        wx.showToast({ title: '网络异常，请检查网络', icon: 'none' });
        reject({ code: -1, message: '网络错误', detail: err });
      },
    });
  });
};

/**
 * 文件上传
 */
const upload = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('access_token');
    wx.uploadFile({
      url: `${BASE_URL}${options.url}`,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        const body = JSON.parse(res.data);
        if (body.code === 200) {
          resolve(body.data);
        } else {
          reject(body);
        }
      },
      fail: reject,
    });
  });
};

/**
 * 微信一键登录流程
 */
const login = async () => {
  try {
    const { code } = await wxPromise(wx.login);
    const data = await request({
      url: '/user/wxLogin',
      method: 'POST',
      data: { code },
    });
    wx.setStorageSync('access_token', data.token);
    return data.userInfo;
  } catch (e) {
    console.error('[login] 登录失败', e);
    throw e;
  }
};

/**
 * Token 刷新重试
 */
const refreshTokenAndRetry = async (options) => {
  const user = await login();
  return request(options);
};

/**
 * wx API Promise 化工具
 */
const wxPromise = (fn, params = {}) => {
  return new Promise((resolve, reject) => {
    fn({ ...params, success: resolve, fail: reject });
  });
};

module.exports = { request, upload, login, wxPromise };
