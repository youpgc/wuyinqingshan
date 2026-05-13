import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, MessageSquare, BarChart3, 
  Settings, LogOut, Eye, Users, TrendingUp, Calendar,
  Plus, Edit2, Trash2, Check, X, Mail, Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// 模拟数据存储（实际项目中使用 Supabase）
const STORAGE_KEYS = {
  posts: 'wuyinqingshan_posts',
  messages: 'wuyinqingshan_messages',
  analytics: 'wuyinqingshan_analytics',
  settings: 'wuyinqingshan_settings'
};

// 初始化示例数据
const initData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.posts)) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify([
      {
        id: 1,
        title: '2025前端复盘：AI重构生态，前端人的生存破局之路',
        excerpt: '深入分析React 19、Vue 3.6、Vite 6等主流框架的核心迭代...',
        category: '前端趋势',
        views: 1234,
        likes: 89,
        published: true,
        createdAt: '2026-05-13'
      },
      {
        id: 2,
        title: 'TypeScript 6.0 正式发布：开发体验全面升级',
        excerpt: '详解 TypeScript 6.0 的新特性，包括 using 关键字...',
        category: 'TypeScript',
        views: 892,
        likes: 67,
        published: true,
        createdAt: '2026-05-10'
      }
    ]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.messages)) {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify([
      {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        content: '博主的文章写得很棒，学到了很多！',
        read: false,
        createdAt: '2026-05-13 10:30'
      },
      {
        id: 2,
        name: '李四',
        email: 'lisi@example.com',
        content: '请问可以转载您的文章吗？会注明出处。',
        read: true,
        createdAt: '2026-05-12 15:20'
      }
    ]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.analytics)) {
    // 生成30天的访问数据
    const analytics = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      analytics.push({
        date: date.toISOString().split('T')[0],
        visits: Math.floor(Math.random() * 200) + 50,
        uniqueVisitors: Math.floor(Math.random() * 150) + 30,
        pageViews: Math.floor(Math.random() * 500) + 100
      });
    }
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(analytics));
  }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const { signOut } = useAuth();

  useEffect(() => {
    initData();
    setPosts(JSON.parse(localStorage.getItem(STORAGE_KEYS.posts) || '[]'));
    setMessages(JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]'));
    setAnalytics(JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || '[]'));
  }, []);

  const stats = {
    totalViews: analytics.reduce((sum, a) => sum + a.pageViews, 0),
    totalVisitors: analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0),
    todayVisits: analytics[analytics.length - 1]?.visits || 0,
    unreadMessages: messages.filter(m => !m.read).length,
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.published).length
  };

  const markMessageAsRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(updated));
  };

  const deleteMessage = (id) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(updated));
  };

  const deletePost = (id) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(updated));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: '总访问量', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'blue' },
          { title: '独立访客', value: stats.totalVisitors.toLocaleString(), icon: Users, color: 'green' },
          { title: '今日访问', value: stats.todayVisits, icon: TrendingUp, color: 'purple' },
          { title: '未读留言', value: stats.unreadMessages, icon: MessageSquare, color: 'red' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 访问趋势图 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">访问趋势（最近30天）</h3>
        <div className="h-64 flex items-end gap-2">
          {analytics.slice(-14).map((day, index) => {
            const maxVisits = Math.max(...analytics.map(a => a.visits));
            const height = (day.visits / maxVisits) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  className="w-full bg-gradient-to-t from-purple-500/50 to-purple-400 rounded-t"
                />
                <span className="text-xs text-white/40">{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">快捷操作</h3>
          <div className="space-y-