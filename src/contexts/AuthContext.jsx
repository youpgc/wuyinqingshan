import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// 本地管理员账号配置
const ADMIN_ACCOUNT = {
  email: 'admin@wuyinqingshan.com',
  password: 'admin123'
};

const SESSION_KEY = 'wuyinqingshan_admin_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的会话
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // 本地验证账号密码
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      const userData = {
        email: ADMIN_ACCOUNT.email,
        name: 'Yaron',
        role: 'admin',
        loginAt: new Date().toISOString()
      };
      // 保存会话到本地
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error('邮箱或密码错误');
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
