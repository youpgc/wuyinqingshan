import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});
const SESSION_KEY = 'wuyinqingshan_admin_session';
const TOKEN_KEY = 'wuyinqingshan_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    checkSession();
    // 定时检查会话有效性
    const interval = setInterval(checkSessionOnline, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (sessionData && token) {
        const userData = JSON.parse(sessionData);
        // 本地验证，不依赖 sessions 表
        setUser(userData);
        setSessionId('local_session');
      }
    } catch (err) {
      console.error('Check session error:', err);
    }
    
    setLoading(false);
  };

  const checkSessionOnline = async () => {
    // 本地会话管理，不依赖 sessions 表
    if (!user || !sessionId) return;
    // 可选：添加本地会话过期检查
  };

  const signIn = async (email, password) => {
    // 验证密码（硬编码验证）
    const validUsers = {
      'admin': { password: 'Dw5pa,+>4+g,0Q2T', name: 'Admin', role: 'admin', id: 'admin' },
      'youpgc@foxmail.com': { password: '1@youpgc@VIP', name: 'Yaron', role: 'admin', id: 'user1' },
      'claude@wuyinqingshan.com': { password: 'Claude2024!@#', name: 'Claude', role: 'admin', id: 'user2' }
    };
    
    const userConfig = validUsers[email];
    if (!userConfig) {
      throw new Error('账号不存在');
    }
    
    if (userConfig.password !== password) {
      throw new Error('密码错误');
    }

    // 生成会话 token
    const token = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 32);

    const userInfo = {
      id: userConfig.id,
      email: email,
      name: userConfig.name,
      role: userConfig.role
    };
    
    setUser(userInfo);
    setSessionId('local_' + Date.now());
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
    localStorage.setItem(TOKEN_KEY, token);
    
    return userInfo;
  };

  const signOut = async () => {
    // 本地登出，不依赖 sessions 表
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSessionId(null);
  };

  const value = {
    user,
    loading,
    sessionId,
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
