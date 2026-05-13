import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, MessageSquare, BarChart3, 
  Settings, LogOut, Eye, Users, TrendingUp, Plus,
  Edit2, Trash2, Mail, Menu, X as CloseIcon, CheckCircle,
  Search, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  postService, messageService, analyticsService, 
  settingsService, initializeData 
} from '../lib/dataService';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function ManageApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
    { id: 'posts', label: '文章管理', icon: FileText },
    { id: 'messages', label: '访客留言', icon: MessageSquare },
    { id: 'analytics', label: '访问统计', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        className="fixed left-0 top-0 h-full w-64 bg-[#12121a] border-r border-white/10 z-50"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">雾</span>
            </div>
            <div>
              <h1 className="text-white font-bold">雾隐青山</h1>
              <p className="text-white/40 text-xs">管理后台</p>
            </div>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </motion.aside>

      <main className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white"
            >
              {sidebarOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-sm">管理员: Yaron</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'posts' && <PostsManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    unreadMessages: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    initializeData();
    const analyticsStats = analyticsService.getStats();
    const unreadCount = messageService.getUnreadCount();
    setStats({
      ...analyticsStats,
      unreadMessages: unreadCount
    });
    setChartData(analyticsService.getLast7Days());
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">数据概览</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: '总访问量', value: stats.totalVisits.toLocaleString(), icon: Eye, change: stats.change },
          { title: '独立访客', value: stats.uniqueVisitors.toLocaleString(), icon: Users, change: '+8%' },
          { title: '今日访问', value: stats.todayVisits.toString(), icon: TrendingUp, change: '+23%' },
          { title: '未读留言', value: stats.unreadMessages.toString(), icon: Mail, change: 'new' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <stat.icon className="w-6 h-6 text-purple-400 mb-4" />
            <p className="text-white/60 text-sm">{stat.title}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-green-400 mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">访问趋势（最近7天）</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a2e', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="visits" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setPosts(postService.getAll());
  };

  const handleDelete = (id) => {
    if (confirm('确定要删除这篇文章吗？')) {
      postService.delete(id);
      loadPosts();
    }
  };

  const handleSave = (post) => {
    if (editingPost) {
      postService.update(editingPost.id, post);
    } else {
      postService.create(post);
    }
    setShowEditor(false);
    setEditingPost(null);
    loadPosts();
  };

  if (showEditor) {
    return (
      <PostEditor 
        post={editingPost} 
        onSave={handleSave} 
        onCancel={() => { setShowEditor(false); setEditingPost(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">文章管理</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          <Plus className="w-4 h-4" />
          新建文章
        </motion.button>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-white/60 text-sm">
              <th className="px-6 py-4">标题</th>
              <th className="px-6 py-4">分类</th>
              <th className="px-6 py-4">浏览</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 text-white">{post.title}</td>
                <td className="px-6 py-4 text-white/60">{post.category}</td>
                <td className="px-6 py-4 text-white/60">{post.views}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {post.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingPost(post); setShowEditor(true); }}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostEditor({ post, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || '前端趋势',
    status: post?.status || 'draft',
    image: post?.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
    readTime: post?.readTime || '10 分钟',
    tags: post?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {post ? '编辑文章' : '新建文章'}
        </h2>
        <button onClick={onCancel} className="text-white/60 hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/60 text-sm mb-2">文章标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="前端趋势">前端趋势</option>
              <option value="TypeScript">TypeScript</option>
              <option value="AI编程">AI编程</option>
              <option value="CSS">CSS</option>
              <option value="工程化">工程化</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">摘要</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">正文内容 (Markdown)</label>
          <SimpleMDE
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            options={{
              spellChecker: false,
              placeholder: '使用 Markdown 格式编写文章...',
              toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', '|', 'preview', 'side-by-side', 'fullscreen'],
            }}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-white/60 text-sm mb-2">封面图片URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">阅读时间</label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">标签 (用逗号分隔)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="React, Vue, AI"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div className="flex gap-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
          >
            保存文章
          </motion.button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:text-white"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

function MessagesManager() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    setMessages(messageService.getAll());
  };

  const handleMarkAsRead = (id) => {
    messageService.markAsRead(id);
    loadMessages();
  };

  const handleDelete = (id) => {
    if (confirm('确定要删除这条留言吗？')) {
      messageService.delete(id);
      loadMessages();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">访客留言</h2>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无留言</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl border ${msg.read ? 'bg-white/5 border-white/10' : 'bg-purple-500/5 border-purple-500/20'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">{msg.name}</h3>
                  <p className="text-white/40 text-sm">{msg.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!msg.read && <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">未读</span>}
                  <span className="text-white/40 text-sm">{msg.time}</span>
                </div>
              </div>
              <p className="text-white/80">{msg.message || msg.content}</p>
              <div className="flex items-center gap-2 mt-4">
                {!msg.read && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkAsRead(msg.id)}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    标记已读
                  </motion.button>
                )}
                <button 
                  onClick={() => handleDelete(msg.id)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-red-400/60 text-sm hover:text-red-400"
                >
                  删除
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function AnalyticsView() {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    setChartData(analyticsService.getLast7Days());
    setStats(analyticsService.getStats());
  }, []);

  const categoryData = [
    { name: '前端框架', value: 35, color: '#3b82f6' },
    { name: 'AI编程', value: 28, color: '#a855f7' },
    { name: '工程化', value: 22, color: '#f97316' },
    { name: '其他', value: 15, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">访问统计</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '平均日访问', value: '93' },
          { label: '最高日访问', value: stats.todayVisits?.toString() || '156' },
          { label: '总访问时长', value: '45分钟' },
        ].map((item, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <p className="text-white/60 text-sm">{item.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">日访问量趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  dot={{ fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">内容分类占比</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-white/60 text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const [settings, setSettings] = useState({
    siteName: '雾隐青山',
    siteDescription: 'Yaron的个人技术博客',
    contactEmail: 'admin@example.com',
    enableComments: true,
    enableAnalytics: true
  });

  useEffect(() => {
    const saved = settingsService.get();
    setSettings(saved);
  }, []);

  const handleSave = () => {
    settingsService.update(settings);
    alert('设置已保存');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">系统设置</h2>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">基础设置</h3>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-white/60 text-sm mb-2">博客名称</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">博客描述</label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">联系邮箱</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white/60">
              <input
                type="checkbox"
                checked={settings.enableComments}
                onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                className="w-4 h-4 rounded bg-white/5 border-white/10"
              />
              启用留言功能
            </label>
            <label className="flex items-center gap-2 text-white/60">
              <input
                type="checkbox"
                checked={settings.enableAnalytics}
                onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
                className="w-4 h-4 rounded bg-white/5 border-white/10"
              />
              启用访问统计
            </label>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
          >
            保存设置
          </motion.button>
        </div>
      </div>
    </div>
  );
}
