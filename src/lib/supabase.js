// Supabase 客户端配置
// 如需使用 Supabase，请设置环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 只有在配置了环境变量时才创建客户端
let supabase = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')) {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// 数据库表操作辅助函数（本地存储版本）
export const db = {
  // 访问记录
  analytics: {
    async getAll(limit = 100) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_analytics') || '[]');
      return data.slice(0, limit);
    },
    async add(record) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_analytics') || '[]');
      data.push({ ...record, id: Date.now(), created_at: new Date().toISOString() });
      localStorage.setItem('wuyinqingshan_analytics', JSON.stringify(data));
      return record;
    },
    async getStats(days = 30) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_analytics') || '[]');
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      return data.filter(d => d.created_at >= cutoff);
    }
  },

  // 博客文章
  posts: {
    async getAll() {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_posts') || '[]');
      return data;
    },
    async getById(id) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_posts') || '[]');
      return data.find(p => p.id === id);
    },
    async create(post) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_posts') || '[]');
      const newPost = { ...post, id: Date.now().toString(), created_at: new Date().toISOString() };
      data.unshift(newPost);
      localStorage.setItem('wuyinqingshan_posts', JSON.stringify(data));
      return newPost;
    },
    async update(id, post) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_posts') || '[]');
      const index = data.findIndex(p => p.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...post };
        localStorage.setItem('wuyinqingshan_posts', JSON.stringify(data));
      }
      return data[index];
    },
    async delete(id) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_posts') || '[]');
      const filtered = data.filter(p => p.id !== id);
      localStorage.setItem('wuyinqingshan_posts', JSON.stringify(filtered));
    }
  },

  // 访客留言
  messages: {
    async getAll() {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_messages') || '[]');
      return data;
    },
    async getUnread() {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_messages') || '[]');
      return data.filter(m => !m.read);
    },
    async create(message) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_messages') || '[]');
      const newMessage = { 
        ...message, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(),
        read: false 
      };
      data.unshift(newMessage);
      localStorage.setItem('wuyinqingshan_messages', JSON.stringify(data));
      return newMessage;
    },
    async markAsRead(id) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_messages') || '[]');
      const msg = data.find(m => m.id === id);
      if (msg) {
        msg.read = true;
        localStorage.setItem('wuyinqingshan_messages', JSON.stringify(data));
      }
    },
    async delete(id) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_messages') || '[]');
      const filtered = data.filter(m => m.id !== id);
      localStorage.setItem('wuyinqingshan_messages', JSON.stringify(filtered));
    }
  },

  // 资讯
  news: {
    async getAll() {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_news') || '[]');
      return data;
    },
    async create(news) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_news') || '[]');
      const newNews = { ...news, id: Date.now().toString(), created_at: new Date().toISOString() };
      data.unshift(newNews);
      localStorage.setItem('wuyinqingshan_news', JSON.stringify(data));
      return newNews;
    },
    async update(id, news) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_news') || '[]');
      const index = data.findIndex(n => n.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...news };
        localStorage.setItem('wuyinqingshan_news', JSON.stringify(data));
      }
      return data[index];
    },
    async delete(id) {
      const data = JSON.parse(localStorage.getItem('wuyinqingshan_news') || '[]');
      const filtered = data.filter(n => n.id !== id);
      localStorage.setItem('wuyinqingshan_news', JSON.stringify(filtered));
    }
  }
};
