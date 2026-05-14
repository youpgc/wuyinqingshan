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
        
        // 验证会话是否仍然有效
        const { data: session } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userData.id)
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .single();
        
        if (session) {
          setUser(userData);
          setSessionId(session.id);
          
          // 更新最后活跃时间
          await supabase
            .from('sessions')
            .update({ expires_at: new Date(Date.now() + 3600000).toISOString() })
            .eq('id', session.id);
        } else {
          // 会话已过期
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (err) {
      console.error('Check session error:', err);
    }
    setLoading(false);
  };

  const checkSessionOnline = async () => {
    if (!user || !sessionId) return;
    
    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (!session) {
        // 会话被强制下线
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        alert('您已被管理员强制下线');
        window.location.reload();
      }
    } catch {}
  };

  const signIn = async (email, password) => {
    // 从数据库验证用户
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !userData) {
      throw new Error('账号不存在');
    }

    if (userData.status !== 1) {
      throw new Error('账号已被禁用');
    }

    // 验证密码
    const validPasswords = {
      'admin': 'Dw5pa,+>4+g,0Q2T',
      'youpgc@foxmail.com': '1@youpgc@VIP',
      'claude@wuyinqingshan.com': 'Claude2024!@#'
    };
    
    if (validPasswords[email] !== password) {
      throw new Error('密码错误');
    }

    // 生成会话 token
    const token = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7天后过期

    // 记录会话
    const { data: newSession, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userData.id,
        token: token,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    // 更新用户最后登录信息
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        last_ip: 'client'
      })
      .eq('id', userData.id);

    const userInfo = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userInfo);
    setSessionId(newSession?.id);
    
    return userInfo;
  };

  const signOut = async () => {
    // 删除会话
    if (sessionId) {
      await supabase.from('sessions').delete().eq('id', sessionId);
    }
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
