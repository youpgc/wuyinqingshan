import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, MessageSquare, BarChart3, 
  Settings, LogOut, Eye, Users, TrendingUp, Plus,
  Edit2, Trash2, Mail, Menu, X as CloseIcon, CheckCircle,
  Shield, UserPlus, Clock, Activity, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';

export default function ManageApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut, user, isSuperAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
    { id: 'posts', label: '文章管理', icon: FileText },
    { id: 'messages', label: '访客留言', icon: MessageSquare },
    { id: 'analytics', label: '访问统计', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  // 超级管理员专属
  if (isSuperAdmin) {
    menuItems.splice(4, 0, { id: 'users', label: '用户管理', icon: Shield });
  }

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
              <div className="text-right">
                <p className="text-white text-sm">{user?.name}</p>
                <p className="text-white/40 text-xs capitalize">
                  {user?.role === 'superadmin' ? '超级管理员' : user?.role === 'admin' ? '管理员' : '用户'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'posts' && <PostsManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'users' && isSuperAdmin && <UsersManager />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

// 数据概览
function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsData = await db.visits.getStats();
      setStats({
        totalVisits: statsData.totalVisits,
        uniqueVisitors: statsData.uniqueVisitors,
        todayVisits: statsData.todayVisits
      });
      setChartData(statsData.last7Days);
      
      const messages = await db.messages.getAll();
      setRecentMessages(messages.slice(0, 5));
    } catch (err) {
      console.error('Load data error:', err);
    }
    setLoading(false);
  };

  const maxVisits = Math.max(...chartData.map(d => d.visits), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">数据概览</h2>
        <span className="text-white/40 text-sm">数据来源：Supabase</span>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: '总访问量', value: stats.totalVisits.toLocaleString(), icon: Eye, color: 'text-blue-400' },
              { title: '独立访客', value: stats.uniqueVisitors.toLocaleString(), icon: Users, color: 'text-green-400' },
              { title: '今日访问', value: stats.todayVisits.toLocaleString(), icon: TrendingUp, color: 'text-purple-400' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
                <p className="text-white/60 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">访问趋势（最近7天）</h3>
            <div className="h-48 flex items-end gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg min-h-[4px]"
                    style={{ height: `${(item.visits / maxVisits) * 100}%` }}
                  />
                  <span className="text-xs text-white/40">{item.date}</span>
                  <span className="text-xs text-white/60">{item.visits}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">最新留言</h3>
            {recentMessages.length === 0 ? (
              <p className="text-white/40 text-center py-8">暂无留言</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="text-white font-medium">{msg.name}</p>
                      <p className="text-white/40 text-sm">{msg.content?.substring(0, 50)}...</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        msg.status === 'unread' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {msg.status === 'unread' ? '未读' : '已读'}
                      </span>
                      <p className="text-white/40 text-xs mt-1">{new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// 文章管理
function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await db.posts.getAll();
      setPosts(data);
    } catch (err) {
      console.error('Load posts error:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('确定要删除这篇文章吗？')) {
      try {
        await db.posts.delete(id);
        loadPosts();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">文章管理</h2>
        <button 
          onClick={() => { setEditingPost(null); setShowEditor(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          <Plus className="w-4 h-4" />
          新建文章
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无文章</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/60 text-sm">
                <th className="px-6 py-4">标题</th>
                <th className="px-6 py-4">分类</th>
                <th className="px-6 py-4">浏览</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">创建时间</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{post.title}</td>
                  <td className="px-6 py-4 text-white/60">{post.category || '-'}</td>
                  <td className="px-6 py-4 text-white/60">{post.views || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {new Date(post.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(post)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <PostEditor 
          post={editingPost} 
          onClose={() => setShowEditor(false)} 
          onSave={() => { setShowEditor(false); loadPosts(); }}
        />
      )}
    </div>
  );
}

// 文章编辑器
function PostEditor({ post, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || '前端趋势',
    status: post?.status || 'draft',
    image: post?.image || '',
    tags: post?.tags || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (post) {
        await db.posts.update(post.id, formData);
      } else {
        await db.posts.create(formData);
      }
      onSave();
    } catch (err) {
      alert('保存失败');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{post ? '编辑文章' : '新建文章'}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
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
            <label className="block text-white/60 text-sm mb-2">摘要</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">正文内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none font-mono text-sm"
              placeholder="支持 Markdown 格式..."
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">封面图片URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              {saving ? '保存中...' : '保存文章'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/5 text-white/60"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 访客留言
function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await db.messages.getAll();
      setMessages(data);
    } catch (err) {
      console.error('Load messages error:', err);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await db.messages.update(id, { status: 'read' });
      loadMessages();
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('确定要删除这条留言吗？')) {
      try {
        await db.messages.delete(id);
        loadMessages();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">访客留言</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : messages.length === 0 ? (
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
              className={`p-6 rounded-xl border ${
                msg.status === 'unread' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">{msg.name}</h3>
                  <p className="text-white/40 text-sm">{msg.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {msg.status === 'unread' && <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">未读</span>}
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-white/40 text-sm">{new Date(msg.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
              <p className="text-white/80">{msg.content}</p>
              {msg.reply && (
                <div className="mt-4 p-4 rounded-lg bg-white/5">
                  <p className="text-white/60 text-sm mb-1">回复：</p>
                  <p className="text-white/80">{msg.reply}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-4">
                {msg.status === 'unread' && (
                  <button
                    onClick={() => handleMarkAsRead(msg.id)}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    标记已读
                  </button>
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await db.visits.getStats();
      setStats(data);
    } catch (err) {
      console.error('Load stats error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">访问统计</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Activity className="w-6 h-6 text-blue-400 mb-4" />
              <p className="text-white/60 text-sm">总访问量</p>
              <p className="text-2xl font-bold text-white">{stats?.totalVisits || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Users className="w-6 h-6 text-green-400 mb-4" />
              <p className="text-white/60 text-sm">独立访客</p>
              <p className="text-2xl font-bold text-white">{stats?.uniqueVisitors || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Eye className="w-6 h-6 text-purple-400 mb-4" />
              <p className="text-white/60 text-sm">今日访问</p>
              <p className="text-2xl font-bold text-white">{stats?.todayVisits || 0}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-6">日访问量趋势</h3>
            <div className="h-64 flex items-end gap-2">
              {stats?.last7Days?.map((item, index) => {
                const max = Math.max(...(stats.last7Days?.map(d => d.visits) || [1]));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg min-h-[4px]"
                      style={{ height: `${(item.visits / max) * 100}%` }}
                    />
                    <span className="text-xs text-white/40">{item.date}</span>
                    <span className="text-sm text-white/60">{item.visits}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 用户管理（超级管理员）
function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await db.users.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Load users error:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('确定要删除这个用户吗？')) {
      try {
        await db.users.delete(id);
        loadUsers();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const roleLabels = {
    superadmin: '超级管理员',
    admin: '管理员',
    user: '用户'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">用户管理</h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/60 text-sm">
                <th className="px-6 py-4">用户名</th>
                <th className="px-6 py-4">邮箱</th>
                <th className="px-6 py-4">角色</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">创建时间</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{u.name}</td>
                  <td className="px-6 py-4 text-white/60">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === 'superadmin' ? 'bg-red-500/20 text-red-400' : 
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/60'
                    }`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.status === 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.status === 1 ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {new Date(u.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="p-2 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 系统设置
function SettingsView() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage('两次输入的密码不一致');
      return;
    }
    if (passwords.new.length < 6) {
      setMessage('密码长度至少6位');
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setMessage('密码修改成功');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      setMessage(err.message || '修改失败');
    }
    
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">系统设置</h2>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">当前账号</h3>
        <div className="space-y-2">
          <p className="text-white/60">用户名：<span className="text-white">{user?.name}</span></p>
          <p className="text-white/60">邮箱：<span className="text-white">{user?.email}</span></p>
          <p className="text-white/60">角色：<span className="text-white capitalize">{user?.role === 'superadmin' ? '超级管理员' : user?.role === 'admin' ? '管理员' : '用户'}</span></p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">修改密码</h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {message && (
            <div className={`p-3 rounded-lg ${message.includes('成功') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-sm`}>
              {message}
            </div>
          )}
          <div>
            <label className="block text-white/60 text-sm mb-2">新密码</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">确认新密码</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {saving ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  );
}
