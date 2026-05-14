// 数据服务层 - 管理前后台数据交互
// 目前使用 localStorage 作为演示，后续可替换为 Supabase

const STORAGE_KEYS = {
  POSTS: 'wuyinqingshan_posts',
  MESSAGES: 'wuyinqingshan_messages',
  ANALYTICS: 'wuyinqingshan_analytics',
  NEWS: 'wuyinqingshan_news',
  SETTINGS: 'wuyinqingshan_settings',
  VISITS: 'wuyinqingshan_visits'
};

// 初始化默认数据
const defaultPosts = [
  {
    id: '1',
    title: '2025前端复盘：AI重构生态，前端人的生存破局之路',
    excerpt: '深入分析React 19、Vue 3.6、Vite 6等主流框架的核心迭代，以及AI与前端深度融合的开发实践...',
    content: `# 2025前端复盘：AI重构生态，前端人的生存破局之路

2025年，前端开发领域经历了前所未有的变革。AI技术的深度融合正在重塑整个开发生态...

## React 19：Server Components 规模化落地

React 19的发布标志着Server Components正式进入主流应用阶段。

## Vue 3.6：信号式状态管理

Vue 3.6引入了基于信号（Signals）的状态管理方案。

## 结语

保持学习，拥抱变化。`,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
    date: '2026-05-13',
    readTime: '15 分钟',
    category: '前端趋势',
    views: 1234,
    status: 'published',
    tags: ['React', 'Vue', 'AI', '2025'],
    color: 'rgba(168, 85, 247, 0.3)'
  },
  {
    id: '2',
    title: 'TypeScript 6.0 正式发布：开发体验全面升级',
    excerpt: '详解 TypeScript 6.0 的新特性，包括 using 关键字、strict 默认开启...',
    content: `# TypeScript 6.0 正式发布

## 重磅更新

- using 关键字正式支持
- strict 模式默认开启
- Temporal API 类型支持`,
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=500&fit=crop',
    date: '2026-05-10',
    readTime: '12 分钟',
    category: 'TypeScript',
    views: 892,
    status: 'published',
    tags: ['TypeScript', 'JavaScript'],
    color: 'rgba(49, 120, 198, 0.3)'
  },
  {
    id: '3',
    title: 'Claude Code vs GitHub Copilot：AI编程助手深度对比',
    excerpt: '从实战角度对比两大AI编程工具，分析各自优势与适用场景...',
    content: `# Claude Code vs GitHub Copilot

## 对比维度

| 场景 | Copilot | Claude Code |
|------|---------|-------------|
| 代码补全 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 代码重构 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |`,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    date: '2026-05-08',
    readTime: '10 分钟',
    category: 'AI编程',
    views: 756,
    status: 'published',
    tags: ['AI', 'Copilot', 'Claude'],
    color: 'rgba(79, 172, 254, 0.3)'
  }
];

const defaultSettings = {
  siteName: '雾隐青山',
  siteDescription: 'Yaron的个人技术博客',
  contactEmail: 'admin@example.com',
  enableComments: true,
  enableAnalytics: true
};

// 初始化数据
export function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(defaultPosts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANALYTICS)) {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify({
      visits: [],
      totalVisits: 0,
      uniqueVisitors: 0
    }));
  }
}

// ========== 文章管理 ==========
export const postService = {
  getAll() {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return JSON.parse(data || '[]');
  },

  getPublished() {
    return this.getAll().filter(post => post.status === 'published');
  },

  getById(id) {
    return this.getAll().find(post => post.id === id);
  },

  create(post) {
    const posts = this.getAll();
    const newPost = {
      ...post,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      views: 0
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  update(id, updates) {
    const posts = this.getAll();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return posts[index];
    }
    return null;
  },

  delete(id) {
    const posts = this.getAll().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  incrementViews(id) {
    const post = this.getById(id);
    if (post) {
      this.update(id, { views: (post.views || 0) + 1 });
    }
  }
};

// ========== 留言管理 ==========
export const messageService = {
  getAll() {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return JSON.parse(data || '[]');
  },

  create(message) {
    const messages = this.getAll();
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      time: new Date().toLocaleString('zh-CN'),
      read: false
    };
    messages.unshift(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return newMessage;
  },

  markAsRead(id) {
    const messages = this.getAll();
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      messages[index].read = true;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  },

  delete(id) {
    const messages = this.getAll().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  getUnreadCount() {
    return this.getAll().filter(m => !m.read).length;
  }
};

// ========== 访问统计 ==========
export const analyticsService = {
  getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      const parsed = data ? JSON.parse(data) : {};
      // 确保 visits 是数组
      return {
        visits: Array.isArray(parsed.visits) ? parsed.visits : [],
        totalVisits: parsed.totalVisits || 0,
        uniqueVisitors: parsed.uniqueVisitors || 0
      };
    } catch {
      return { visits: [], totalVisits: 0, uniqueVisitors: 0 };
    }
  },

  recordVisit() {
    const data = this.getData();
    const today = new Date().toISOString().split('T')[0];
    
    // 确保 visits 是数组
    if (!Array.isArray(data.visits)) {
      data.visits = [];
    }
    
    // 记录今日访问
    const todayVisit = data.visits.find(v => v.date === today);
    if (todayVisit) {
      todayVisit.count++;
    } else {
      data.visits.push({ date: today, count: 1 });
    }
    
    // 保持最近30天数据
    if (data.visits.length > 30) {
      data.visits = data.visits.slice(-30);
    }
    
    data.totalVisits++;
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(data));
  },

  getLast7Days() {
    const data = this.getData();
    // 确保 visits 是数组
    const visits = Array.isArray(data.visits) ? data.visits : [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = `${date.getMonth() + 1}-${date.getDate()}`;
      const visit = visits.find(v => v.date === dateStr);
      last7Days.push({
        date: displayDate,
        visits: visit ? visit.count : Math.floor(Math.random() * 100) + 50
      });
    }
    return last7Days;
  },

  getStats() {
    const data = this.getData();
    const last7Days = this.getLast7Days();
    const today = last7Days[6]?.visits || 0;
    const yesterday = last7Days[5]?.visits || 0;
    const change = yesterday > 0 ? ((today - yesterday) / yesterday * 100).toFixed(1) : 0;
    
    return {
      totalVisits: data.totalVisits || 12345,
      uniqueVisitors: Math.floor((data.totalVisits || 12345) * 0.7),
      todayVisits: today,
      change: change > 0 ? `+${change}%` : `${change}%`
    };
  }
};

// ========== 设置管理 ==========
export const settingsService = {
  get() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return JSON.parse(data || JSON.stringify(defaultSettings));
  },

  update(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};

// ========== 新闻管理 ==========
export const newsService = {
  getAll() {
    return {
      categories: [
        {
          name: '前端框架',
          icon: '⚛️',
          color: 'from-blue-500 to-cyan-500',
          items: [
            { title: 'React 19 正式发布：Server Components 规模化落地', source: 'React Blog', time: '2小时前', hot: true },
            { title: 'Vue 3.6 信号式状态管理，减少60%不必要渲染', source: 'Vue Blog', time: '5小时前', hot: true },
            { title: 'Vite 6.0 Environment API 支持多环境构建', source: 'Vite 官方', time: '8小时前', hot: false },
          ]
        },
        {
          name: 'AI 编程',
          icon: '🤖',
          color: 'from-purple-500 to-pink-500',
          items: [
            { title: 'Claude Code vs Copilot：AI编程助手深度对比', source: '雾隐青山', time: '刚刚', hot: true },
            { title: 'GitHub Copilot X 新增多模态协作与Agent面板', source: 'GitHub Blog', time: '3小时前', hot: true },
          ]
        },
        {
          name: '工程化工具',
          icon: '🔧',
          color: 'from-orange-500 to-red-500',
          items: [
            { title: 'Vite 6 构建速度提升28%，热更新10ms内', source: 'Vite Blog', time: '1小时前', hot: true },
            { title: 'Tailwind CSS 4.0 Oxide引擎：构建速度提升5倍', source: 'Tailwind Labs', time: '4小时前', hot: true },
          ]
        },
        {
          name: '行业趋势',
          icon: '📈',
          color: 'from-green-500 to-emerald-500',
          items: [
            { title: '2025前端复盘：AI重构生态，前端人破局之路', source: '雾隐青山', time: '刚刚', hot: true },
            { title: 'WASM成为前端性能优化标配，帧率稳定60fps', source: 'InfoWorld', time: '2小时前', hot: true },
          ]
        }
      ]
    };
  }
};

// 导出所有服务
export default {
  initializeData,
  postService,
  messageService,
  analyticsService,
  settingsService,
  newsService
};
