import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});
const SESSION_KEY = 'wuyinqingshan_admin_session';
const TOKEN_KEY = 'wuyinqingshan_token';
const SESSION_ID_KEY = 'wuyinqingshan_session_id';

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
      const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
      
      if (sessionData && token) {
        const userData = JSON.parse(sessionData);
        setUser(userData);
        // 使用存储的真实 session ID（如果有），用于在线状态检查
        setSessionId(storedSessionId || 'local_session');
      }
    } catch (err) {
      console.error('Check session error:', err);
    }
    
    setLoading(false);
  };

  const checkSessionOnline = async () => {
    if (!user || !sessionId || sessionId.startsWith('local_')) return;
    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('id, expires_at')
        .eq('id', sessionId)
        .single();
      
      if (!session || new Date(session.expires_at) <= new Date()) {
        // 会话过期，自动登出
        await supabase.from('sessions').delete().eq('id', sessionId).catch(() => {});
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_ID_KEY);
        setUser(null);
        setSessionId(null);
      }
    } catch {}
  };

  const signIn = async (email, password) => {
    // 验证密码（硬编码验证）
    // numericUserId 用于 sessions 表（user_id 为 bigint 类型）
    const validUsers = {
      'admin': { password: 'Dw5pa,+>4+g,0Q2T', name: 'Admin', role: 'admin', id: '3a587f51-badd-4c5c-8824-789998080b7b', numericUserId: 1 },
      'youpgc@foxmail.com': { password: '1@youpgc@VIP', name: 'Yaron', role: 'admin', id: '92451b31-09d4-41cb-916d-38a4ee361b75', numericUserId: 2 },
      'claude@wuyinqingshan.com': { password: 'Claude2024!@#', name: 'Claude', role: 'admin', id: '687346ae-36b6-4793-81d5-fe1e18f3f33c', numericUserId: 3 }
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
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2小时后过期

    const userInfo = {
      id: userConfig.id,
      email: email,
      name: userConfig.name,
      role: userConfig.role,
      numericUserId: userConfig.numericUserId
    };
    
    // 写入 sessions 表（用于在线用户统计）
    // sessions.user_id 为 bigint 类型，使用数字ID
    let newSessionId = 'local_' + Date.now();
    try {
      const { data: newSession } = await supabase
        .from('sessions')
        .insert({
          user_id: userConfig.numericUserId,
          expires_at: expiresAt
        })
        .select('id')
        .single();
      if (newSession) newSessionId = newSession.id;
    } catch (e) {
      console.error('Failed to create session:', e);
    }
    
    setUser(userInfo);
    setSessionId(newSessionId);
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
    localStorage.setItem(TOKEN_KEY, token);
    // 持久化 session ID，用于页面刷新后的在线状态检查
    if (!newSessionId.startsWith('local_')) {
      localStorage.setItem(SESSION_ID_KEY, newSessionId);
    }
    
    return userInfo;
  };

  const signOut = async () => {
    // 删除 sessions 表记录
    if (sessionId && !sessionId.startsWith('local_')) {
      try { await supabase.from('sessions').delete().eq('id', sessionId); } catch {}
    }
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
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
