import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// 后端 API 地址
const API_BASE = 'https://wuyinqingshan-production.up.railway.app';

const SESSION_KEY = 'wuyinqingshan_admin_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { token, user: savedUser } = JSON.parse(session);
        
        // 验证 token 是否有效
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (err) {
      // API 未部署，使用本地 session
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          const { user: savedUser } = JSON.parse(session);
          setUser(savedUser);
        } catch {}
      }
    }
    setLoading(false);
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '登录失败');
      }

      const data = await response.json();
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setUser(data.user);
      return data.user;
    } catch (err) {
      // 如果 API 未部署，使用本地验证
      console.warn('API 未部署，使用本地验证');
      
      // 本地账号验证
      const localAccounts = [
        { email: 'admin', password: 'Dw5pa,+>4+g,0Q2T', name: '超级管理员', role: 'superadmin' },
        { email: 'youpgc@foxmail.com', password: '1@youpgc@VIP', name: '管理员', role: 'admin' }
      ];

      const account = localAccounts.find(a => a.email === email);
      if (!account) {
        throw new Error('账号不存在');
      }
      if (account.password !== password) {
        throw new Error('密码错误');
      }

      const userData = {
        email: account.email,
        name: account.name,
        role: account.role
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData }));
      setUser(userData);
      return userData;
    }
  };

  const signOut = async () => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { token } = JSON.parse(session);
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch {}
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
