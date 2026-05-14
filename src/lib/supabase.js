import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lucinfxeiedkyvjxdwwh.supabase.co';
const supabaseAnonKey = 'sb_publishable_PDhTv2Y2oTPgbQuO6DTOeg_8KaSm7Nm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 获取当前会话
export const getSession = () => supabase.auth.getSession();

// 获取当前用户
export const getCurrentUser = () => supabase.auth.getUser();

// 认证
export const auth = {
  // 登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },
  
  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // 注册
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    return data;
  }
};

// 数据库操作
export const db = {
  // 用户
  users: {
    async getAll() {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getByEmail(email) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // 文章
  posts: {
    async getAll(params = {}) {
      let query = supabase.from('posts').select('*, users(name)');
      if (params.status) query = query.eq('status', params.status);
      if (params.category) query = query.eq('category', params.category);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getPublished() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, users(name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getById(id) {
      const { data, error } = await supabase
        .from('posts')
        .select('*, users(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    async create(post) {
      const { data, error } = await supabase.from('posts').insert(post).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
    },
    async incrementViews(id) {
      const { data, error } = await supabase.rpc('increment_views', { post_id: id });
      if (error) console.error('Views increment error:', error);
    }
  },

  // 留言
  messages: {
    async getAll() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async create(message) {
      const { data, error } = await supabase.from('messages').insert(message).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('messages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // 访问统计
  visits: {
    async record(visitorId, page) {
      const { error } = await supabase.from('visits').insert({
        visitor_id: visitorId,
        page: page || 'home'
      });
      if (error) console.error('Visit record error:', error);
    },
    async getStats() {
      const { data: total, error: totalError } = await supabase.from('visits').select('id', { count: 'exact' });
      const { data: unique, error: uniqueError } = await supabase.from('visits').select('visitor_id', { count: 'exact', distinct: true });
      
      // 获取最近7天数据
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recent, error: recentError } = await supabase
        .from('visits')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());
      
      // 按天分组
      const byDay = {};
      recent?.forEach(v => {
        const day = v.created_at.split('T')[0];
        byDay[day] = (byDay[day] || 0) + 1;
      });
      
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        last7Days.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          visits: byDay[dateStr] || 0
        });
      }
      
      return {
        totalVisits: total?.length || 0,
        uniqueVisitors: unique?.length || 0,
        todayVisits: byDay[new Date().toISOString().split('T')[0]] || 0,
        last7Days
      };
    }
  },

  // 操作日志
  logs: {
    async getAll() {
      const { data, error } = await supabase
        .from('logs')
        .select('*, users(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    async create(log) {
      const { error } = await supabase.from('logs').insert(log);
      if (error) console.error('Log create error:', error);
    }
  }
};

export default { supabase, auth, db };
