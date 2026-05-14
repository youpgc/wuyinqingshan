import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, auth as supabaseAuth, db } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 获取用户完整信息
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      }
    } catch (err) {
      console.error('Check user error:', err);
    }
    setLoading(false);
  };

  const signIn = async (email, password) => {
    // Supabase Auth 登录
    const { data, error } = await supabaseAuth.signIn(email, password);
    if (error) throw error;
    
    // 获取用户完整信息
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userData) {
      const userInfo = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };
      setUser(userInfo);
      return userInfo;
    }
    throw new Error('用户信息不存在');
  };

  const signOut = async () => {
    await supabaseAuth.signOut();
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
