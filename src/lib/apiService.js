// API 服务层 - 连接后端真实数据
const API_BASE = 'https://wuyinqingshan-production.up.railway.app';

// 获取 token
const getToken = () => {
  const session = localStorage.getItem('wuyinqingshan_admin_session');
  if (session) {
    try {
      const { token } = JSON.parse(session);
      return token;
    } catch {}
  }
  return null;
};

// 通用请求
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// ========== 认证 ==========
export const authAPI = {
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  }),
  
  me: () => request('/api/auth/me'),
  
  changePassword: (oldPassword, newPassword) => request('/api/auth/password', {
    method: 'PUT',
    body: { oldPassword, newPassword }
  })
};

// ========== 用户管理 ==========
export const userAPI = {
  getAll: () => request('/api/users'),
  
  create: (data) => request('/api/users', {
    method: 'POST',
    body: data
  }),
  
  update: (id, data) => request(`/api/users/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  delete: (id) => request(`/api/users/${id}`, {
    method: 'DELETE'
  })
};

// ========== 文章管理 ==========
export const postAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/posts?${query}`);
  },
  
  getById: (id) => request(`/api/posts/${id}`),
  
  create: (data) => request('/api/posts', {
    method: 'POST',
    body: data
  }),
  
  update: (id, data) => request(`/api/posts/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  delete: (id) => request(`/api/posts/${id}`, {
    method: 'DELETE'
  })
};

// ========== 留言管理 ==========
export const messageAPI = {
  getAll: () => request('/api/messages'),
  
  create: (data) => request('/api/messages', {
    method: 'POST',
    body: data
  }),
  
  update: (id, data) => request(`/api/messages/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  delete: (id) => request(`/api/messages/${id}`, {
    method: 'DELETE'
  })
};

// ========== 访问统计 ==========
export const analyticsAPI = {
  recordVisit: (visitorId, page = 'home') => request('/api/analytics/visit', {
    method: 'POST',
    body: { visitorId, page }
  }),
  
  getStats: () => request('/api/analytics/stats')
};

// ========== 操作日志 ==========
export const logAPI = {
  getAll: () => request('/api/logs')
};

export default {
  auth: authAPI,
  users: userAPI,
  posts: postAPI,
  messages: messageAPI,
  analytics: analyticsAPI,
  logs: logAPI
};
