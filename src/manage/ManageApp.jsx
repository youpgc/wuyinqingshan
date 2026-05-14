import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, MessageSquare, BarChart3, 
  Settings, LogOut, Eye, Users, TrendingUp, Plus,
  Edit2, Trash2, Mail, Menu, X as CloseIcon, CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  postService, messageService, analyticsService, 
  settingsService, initializeData 
} from '../lib/dataService';

export default function ManageApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut, user } = useAuth();

  useEffect(() => {
    initializeData();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
    { id: 'posts', label: '文章管理', icon: FileText },
    { id: 'messages', label: '访客留言', icon: MessageSquare },
    { id: 'analytics', label: '访问统计', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* 侧边栏 */}
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

      {/* 主内容区 */}
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
              <span className="text-white/60 text-sm">管理员: {user?.name || 'Yaron'}</span>
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

// 数据概览
function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVisits: 1234,
    uniqueVisitors: 823,
    todayVisits: 156,
    unreadMessages: 0
  });

  useEffect(() => {
    const analyticsStats = analyticsService.getStats();
    const unreadCount = messageService.getUnreadCount();
    setStats({
      totalVisits: analyticsStats.totalVisits || 1234,
      uniqueVisitors: analyticsStats.uniqueVisitors || 823,
      todayVisits: analyticsStats.todayVisits || 156,
      unreadMessages: unreadCount
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">数据概览</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: '总访问量', value: stats.totalVisits.toLocaleString(), icon: Eye },
          { title: '独立访客', value: stats.uniqueVisitors.toLocaleString(), icon: Users },
          { title: '今日访问', value: stats.todayVisits.toString(), icon: TrendingUp },
          { title: '未读留言', value: stats.unreadMessages.toString(), icon: Mail },
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
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">访问趋势（最近7天）</h3>
        <div className="h-48 flex items-end gap-2">
          {[65, 78, 52, 89, 95, 120, 156].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(value / 156) * 100}%` }}
                className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg"
              />
              <span className="text-xs text-white/40">{['一', '二', '三', '四', '五', '六', '日'][index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 文章管理
function PostsManager() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts(postService.getAll());
  }, []);

  const handleDelete = (id) => {
    if (confirm('确定要删除这篇文章吗？')) {
      postService.delete(id);
      setPosts(postService.getAll());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">文章管理</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
                    <button className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white">
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

// 访客留言
function MessagesManager() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages(messageService.getAll());
  }, []);

  const handleMarkAsRead = (id) => {
    messageService.markAsRead(id);
    setMessages(messageService.getAll());
  };

  const handleDelete = (id) => {
    if (confirm('确定要删除这条留言吗？')) {
      messageService.delete(id);
      setMessages(messageService.getAll());
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">访客留言</h2>
      {messages.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无留言</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

// 访问统计
function AnalyticsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">访问统计</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '平均日访问', value: '93' },
          { label: '最高日访问', value: '156' },
          { label: '总访问时长', value: '45分钟' },
        ].map((item, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <p className="text-white/60 text-sm">{item.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6">日访问量趋势</h3>
        <div className="h-48 flex items-end gap-2">
          {[65, 78, 52, 89, 95, 120, 156].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg"
                style={{ height: `${(value / 156) * 100}%` }}
              />
              <span className="text-xs text-white/40">{index + 1}日</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 系统设置
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
    if (saved) setSettings(saved);
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
