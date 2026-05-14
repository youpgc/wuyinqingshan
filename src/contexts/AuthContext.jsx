import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});
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
        const userData = JSON.parse(session);
        setUser(userData);
      }
    } catch (err) {
      console.error('Check session error:', err);
    }
    setLoading(false);
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

    // 验证密码（明文比较，实际应该使用 bcrypt）
    // 注意：这里为了简化，直接比较明文密码
    // 生产环境应该使用加密存储
    const validPasswords = {
      'admin': 'Dw5pa,+>4+g,0Q2T',
      'youpgc@foxmail.com': '1@youpgc@VIP'
    };
    
    if (validPasswords[email] !== password) {
      throw new Error('密码错误');
    }

    const userInfo = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const signOut = async () => {
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
