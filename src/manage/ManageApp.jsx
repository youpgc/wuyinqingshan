import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, MessageSquare, BarChart3, 
  Settings, LogOut, Eye, Users, TrendingUp, Plus,
  Edit2, Trash2, Mail, Menu, X as CloseIcon, CheckCircle,
  Shield, UserPlus, Clock, Activity, ChevronRight, Power, Newspaper,
  Calendar, FileWarning
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, supabase } from '../lib/supabase';
import VisitChart from '../components/VisitChart';

export default function ManageApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut, user, isSuperAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
    { id: 'posts', label: '文章管理', icon: FileText },
    { id: 'news', label: '资讯管理', icon: Newspaper },
    { id: 'messages', label: '访客留言', icon: MessageSquare },
    { id: 'analytics', label: '访问统计', icon: BarChart3 },
    { id: 'sessions', label: '在线用户', icon: Activity },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  // 超级管理员专属
  if (isSuperAdmin) {
    menuItems.splice(5, 0, { id: 'users', label: '用户管理', icon: Shield });
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
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'sessions' && <SessionsManager />}
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
    todayVisits: 0,
    totalPosts: 0,
    totalNews: 0,
    totalMessages: 0,
    publishedPosts: 0,
    draftPosts: 0
  });
  const [recentData, setRecentData] = useState({
    posts: [],
    news: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 加载访问统计 - 使用新的 visit_logs 表
      const { count: totalVisits } = await supabase
        .from('visit_logs')
        .select('*', { count: 'exact', head: true });
      
      // 平台访问统计
      const { count: platformVisits } = await supabase
        .from('visit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('visit_type', 'platform');
      
      // 资源访问统计
      const { count: resourceVisits } = await supabase
        .from('visit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('visit_type', 'resource');
      
      const { data: visitsData } = await supabase
        .from('visit_logs')
        .select('visitor_id, created_at, visit_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const uniqueVisitors = new Set(visitsData?.map(v => v.visitor_id) || []).size;
      const todayStart = new Date().toISOString().split('T')[0];
      const todayVisits = visitsData?.filter(v => v.created_at.startsWith(todayStart)).length || 0;
      const todayPlatformVisits = visitsData?.filter(v => v.created_at.startsWith(todayStart) && v.visit_type === 'platform').length || 0;
      const todayResourceVisits = visitsData?.filter(v => v.created_at.startsWith(todayStart) && v.visit_type === 'resource').length || 0;

      // 加载文章统计
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      const { count: publishedPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      
      // 加载资讯统计
      const { count: totalNews } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });
      
      // 加载留言统计
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalVisits: totalVisits || 0,
        platformVisits: platformVisits || 0,
        resourceVisits: resourceVisits || 0,
        uniqueVisitors: uniqueVisitors,
        todayVisits: todayVisits,
        todayPlatformVisits: todayPlatformVisits || 0,
        todayResourceVisits: todayResourceVisits || 0,
        totalPosts: totalPosts || 0,
        totalNews: totalNews || 0,
        totalMessages: totalMessages || 0,
        publishedPosts: publishedPosts || 0,
        draftPosts: (totalPosts || 0) - (publishedPosts || 0)
      });

      // 加载最近数据
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('id, title, created_at, views, status')
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: recentNews } = await supabase
        .from('news')
        .select('id, title, created_at, views')
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, name, content, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentData({
        posts: recentPosts || [],
        news: recentNews || [],
        messages: recentMessages || []
      });
    } catch (err) {
      console.error('Load data error:', err);
    }
    setLoading(false);
  };

  const statCards = [
    { title: '总访问量', value: stats.totalVisits, icon: Eye, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10' },
    { title: '平台访问', value: stats.platformVisits || 0, icon: LayoutDashboard, color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-500/10' },
    { title: '资源访问', value: stats.resourceVisits || 0, icon: FileText, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10' },
    { title: '独立访客', value: stats.uniqueVisitors, icon: Users, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
    { title: '今日平台', value: stats.todayPlatformVisits || 0, icon: TrendingUp, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10' },
    { title: '今日资源', value: stats.todayResourceVisits || 0, icon: Newspaper, color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-500/10' },
    { title: '文章总数', value: stats.totalPosts, icon: FileText, color: 'from-orange-500 to-yellow-500', bgColor: 'bg-orange-500/10' },
    { title: '已发布', value: stats.publishedPosts, icon: CheckCircle, color: 'from-green-500 to-teal-500', bgColor: 'bg-green-500/10' },
    { title: '草稿', value: stats.draftPosts, icon: FileWarning, color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-500/10' },
    { title: '资讯总数', value: stats.totalNews, icon: Newspaper, color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-500/10' },
    { title: '留言总数', value: stats.totalMessages, icon: MessageSquare, color: 'from-indigo-500 to-violet-500', bgColor: 'bg-indigo-500/10' },
  ];

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
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${stat.bgColor} backdrop-blur-sm rounded-xl p-5 border border-white/5`}
              >
                <stat.icon className={`w-5 h-5 mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                <p className="text-white/60 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
          
          {/* 访问趋势图表 */}
          <VisitChart data={[]} title="访问趋势" />
          
          {/* 数据分布 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 最新文章 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  最新文章
                </h3>
                <span className="text-white/40 text-xs">{stats.totalPosts} 篇</span>
              </div>
              {recentData.posts.length === 0 ? (
                <p className="text-white/40 text-center py-6">暂无文章</p>
              ) : (
                <div className="space-y-3">
                  {recentData.posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{post.title}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(post.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-white/40 text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          post.status === 'published' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {post.status === 'published' ? '已发布' : '草稿'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 最新资讯 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-rose-400" />
                  最新资讯
                </h3>
                <span className="text-white/40 text-xs">{stats.totalNews} 条</span>
              </div>
              {recentData.news.length === 0 ? (
                <p className="text-white/40 text-center py-6">暂无资讯</p>
              ) : (
                <div className="space-y-3">
                  {recentData.news.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{item.title}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(item.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <span className="text-white/40 text-xs flex items-center gap-1 ml-4">
                        <Eye className="w-3 h-3" />
                        {item.views || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 最新留言 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  最新留言
                </h3>
                <span className="text-white/40 text-xs">{stats.totalMessages} 条</span>
              </div>
              {recentData.messages.length === 0 ? (
                <p className="text-white/40 text-center py-6">暂无留言</p>
              ) : (
                <div className="space-y-3">
                  {recentData.messages.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{msg.name}</p>
                        <p className="text-white/40 text-xs truncate mt-1">{msg.content?.substring(0, 30)}...</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ml-4 ${
                        msg.status === 'unread' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {msg.status === 'unread' ? '未读' : '已读'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 文章管理
function PostsManager() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredPosts = allPosts.filter(post => {
    const matchSearch = !searchTerm || post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await db.posts.getAll();
      setAllPosts(data);
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

  // 上架/下架文章
  const togglePublish = async (post) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await db.posts.update(post.id, { status: newStatus });
      loadPosts();
    } catch (err) {
      alert('操作失败');
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

      {/* 筛选表单 */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          placeholder="搜索标题..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm w-48"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">全部分类</option>
          <option value="前端趋势">前端趋势</option>
          <option value="TypeScript">TypeScript</option>
          <option value="AI编程">AI编程</option>
          <option value="CSS">CSS</option>
          <option value="工程化">工程化</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <button
          onClick={() => { setSearchTerm(''); setFilterCategory('all'); setFilterStatus('all'); }}
          className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:text-white hover:bg-white/10 transition-colors"
        >
          重置
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{allPosts.length === 0 ? '暂无文章' : '没有匹配的文章'}</p>
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
              {filteredPosts.map((post) => (
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
                      <button 
                        onClick={() => togglePublish(post)}
                        className={`px-3 py-1 rounded-lg text-xs ${
                          post.status === 'published' 
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {post.status === 'published' ? '下架' : '上架'}
                      </button>
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

// 在线用户管理
function SessionsManager() {
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [refreshInterval, setRefreshInterval] = useState(30000);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadSessions = async () => {
    try {
      // 获取所有活跃会话
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*, users(name, email, role)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      // 获取用户最后登录信息
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('last_login', { ascending: false });
      
      setSessions(sessionsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Load sessions error:', err);
    }
    setLoading(false);
  };

  const handleKickUser = async (sessionId, targetUserRole) => {
    // 权限检查
    if (targetUserRole === 'superadmin') {
      alert('无法强制下线超级管理员');
      return;
    }
    if (!isSuperAdmin && targetUserRole === 'admin') {
      alert('只有超级管理员可以强制下线管理员');
      return;
    }

    if (confirm('确定要强制该用户下线吗？')) {
      try {
        await supabase.from('sessions').delete().eq('id', sessionId);
        loadSessions();
      } catch (err) {
        alert('操作失败');
      }
    }
  };

  const handleKickAll = async () => {
    if (!confirm('确定要强制所有用户下线吗？（不包括自己）')) return;
    
    try {
      const otherSessions = sessions.filter(s => s.users?.email !== currentUser?.email);
      for (const session of otherSessions) {
        if (session.users?.role !== 'superadmin') {
          await supabase.from('sessions').delete().eq('id', session.id);
        }
      }
      loadSessions();
    } catch (err) {
      alert('操作失败');
    }
  };

  // 按用户分组会话
  const sessionsByUser = {};
  sessions.forEach(session => {
    const userId = session.user_id;
    if (!sessionsByUser[userId]) {
      sessionsByUser[userId] = { user: session.users, sessions: [] };
    }
    sessionsByUser[userId].sessions.push(session);
  });

  const roleLabels = {
    superadmin: '超级管理员',
    admin: '管理员',
    user: '用户'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">在线用户</h2>
        <div className="flex items-center gap-4">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          >
            <option value={10000}>每10秒刷新</option>
            <option value={30000}>每30秒刷新</option>
            <option value={60000}>每分钟刷新</option>
          </select>
          <button
            onClick={loadSessions}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white"
          >
            刷新
          </button>
          {isSuperAdmin && (
            <button
              onClick={handleKickAll}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              全部下线
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : Object.keys(sessionsByUser).length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>当前无其他在线用户</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(sessionsByUser).map(([userId, { user, sessions }]) => (
            <motion.div
              key={userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{user?.name || '未知用户'}</h3>
                      {user?.email === currentUser?.email && (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">当前</span>
                      )}
                    </div>
                    <p className="text-white/50 text-sm">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user?.role === 'superadmin' ? 'bg-red-500/20 text-red-400' : 
                    user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/60'
                  }`}>
                    {roleLabels[user?.role] || user?.role}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                    {sessions.length} 会话
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        登录: {new Date(session.created_at).toLocaleString('zh-CN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        到期: {new Date(session.expires_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    {user?.email !== currentUser?.email && (
                      <button
                        onClick={() => handleKickUser(session.id, user?.role)}
                        className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 flex items-center gap-1"
                      >
                        <Power className="w-4 h-4" />
                        下线
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 登录历史 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden mt-8">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">用户登录记录</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 sticky top-0 bg-[#12121a]">
              <tr className="text-left text-white/60 text-sm">
                <th className="px-6 py-3">用户</th>
                <th className="px-6 py-3">角色</th>
                <th className="px-6 py-3">最后登录时间</th>
                <th className="px-6 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white">{u.name}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === 'superadmin' ? 'bg-red-500/20 text-red-400' : 
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/60'
                    }`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {u.last_login ? new Date(u.last_login).toLocaleString('zh-CN') : '从未登录'}
                  </td>
                  <td className="px-6 py-4">
                    {sessions.some(s => s.user_id === u.id) ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        在线
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm">离线</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState(null);

  // 模块配置状态
  const [modules, setModules] = useState([
    { id: 'hero', name: 'Hero 横幅', enabled: true, order: 1, showCount: 1 },
    { id: 'about', name: '关于我', enabled: true, order: 2, showCount: 1 },
    { id: 'portfolio', name: '精选作品', enabled: true, order: 3, showCount: 6 },
    { id: 'blog', name: '技术博客', enabled: true, order: 4, showCount: 6 },
    { id: 'news', name: '每日资讯', enabled: true, order: 5, showCount: 6 },
    { id: 'contact', name: '联系我', enabled: true, order: 6, showCount: 1 },
  ]);
  const [savingModules, setSavingModules] = useState(false);

  // 数据清理
  const cleanData = async () => {
    if (!confirm('确定要执行数据清理吗？\n\n将执行以下操作：\n1. 删除重复标题的文章\n2. 删除内容为空的文章\n3. 删除重复标题的资讯\n4. 删除内容为空的资讯')) return;

    setCleaning(true);
    setCleanResult(null);
    
    try {
      let deletedPosts = 0;
      let deletedNews = 0;

      // 清理文章 - 删除重复标题
      const { data: allPosts } = await supabase
        .from('posts')
        .select('id, title, content');
      
      if (allPosts && allPosts.length > 0) {
        const seen = new Set();
        const toDelete = [];
        
        allPosts.forEach(post => {
          // 检查重复标题
          const titleKey = post.title?.trim().toLowerCase();
          if (titleKey && seen.has(titleKey)) {
            toDelete.push(post.id);
          } else if (titleKey) {
            seen.add(titleKey);
          }
          
          // 检查内容为空
          if (!post.content || post.content.trim().length < 10) {
            if (!toDelete.includes(post.id)) {
              toDelete.push(post.id);
            }
          }
        });

        if (toDelete.length > 0) {
          // 分批删除（每次最多100条）
          for (let i = 0; i < toDelete.length; i += 100) {
            const batch = toDelete.slice(i, i + 100);
            await supabase.from('posts').delete().in('id', batch);
          }
          deletedPosts = toDelete.length;
        }
      }

      // 清理资讯 - 删除重复标题
      const { data: allNews } = await supabase
        .from('news')
        .select('id, title, content');
      
      if (allNews && allNews.length > 0) {
        const seen = new Set();
        const toDelete = [];
        
        allNews.forEach(item => {
          const titleKey = item.title?.trim().toLowerCase();
          if (titleKey && seen.has(titleKey)) {
            toDelete.push(item.id);
          } else if (titleKey) {
            seen.add(titleKey);
          }
        });

        if (toDelete.length > 0) {
          for (let i = 0; i < toDelete.length; i += 100) {
            const batch = toDelete.slice(i, i + 100);
            await supabase.from('news').delete().in('id', batch);
          }
          deletedNews = toDelete.length;
        }
      }

      setCleanResult({
        success: true,
        deletedPosts,
        deletedNews,
        message: `清理完成：删除 ${deletedPosts} 篇重复/空文章，${deletedNews} 条重复资讯`,
      });
    } catch (err) {
      setCleanResult({
        success: false,
        message: `清理失败：${err.message}`,
      });
    }
    
    setCleaning(false);
  };

  // 保存模块配置
  const saveModules = async () => {
    setSavingModules(true);
    try {
      // 保存到 localStorage（后续可迁移到数据库）
      localStorage.setItem('wuyinqingshan_modules', JSON.stringify(modules));
      
      // 尝试保存到数据库
      try {
        await supabase.from('site_config').upsert({
          key: 'modules',
          value: JSON.stringify(modules),
        }, { onConflict: 'key' });
      } catch (e) {
        // 如果表不存在，忽略
      }
      
      alert('模块配置已保存');
    } catch (err) {
      alert('保存失败');
    }
    setSavingModules(false);
  };

  // 切换模块启用/禁用
  const toggleModule = (id) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  // 更新模块配置
  const updateModule = (id, field, value) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  // 上移/下移模块顺序
  const moveModule = (id, direction) => {
    setModules(prev => {
      const idx = prev.findIndex(m => m.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const newModules = [...prev];
      [newModules[idx], newModules[newIdx]] = [newModules[newIdx], newModules[idx]];
      return newModules.map((m, i) => ({ ...m, order: i + 1 }));
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">系统设置</h2>
      
      {/* 当前账号 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">当前账号</h3>
        <div className="space-y-2">
          <p className="text-white/60">用户名：<span className="text-white">{user?.name}</span></p>
          <p className="text-white/60">邮箱：<span className="text-white">{user?.email}</span></p>
          <p className="text-white/60">角色：<span className="text-white capitalize">{user?.role === 'superadmin' ? '超级管理员' : user?.role === 'admin' ? '管理员' : '用户'}</span></p>
        </div>
      </div>

      {/* 模块配置 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">模块配置</h3>
          <button
            onClick={saveModules}
            disabled={savingModules}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm disabled:opacity-50"
          >
            {savingModules ? '保存中...' : '保存配置'}
          </button>
        </div>
        
        <p className="text-white/40 text-sm mb-4">
          配置前台首页各模块的显示顺序、启用状态和展示条数
        </p>

        <div className="space-y-3">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                mod.enabled ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-60'
              }`}
            >
              {/* 启用开关 */}
              <button
                onClick={() => toggleModule(mod.id)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  mod.enabled ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  mod.enabled ? 'left-7' : 'left-1'
                }`} />
              </button>

              {/* 模块名称 */}
              <div className="flex-1">
                <span className="text-white font-medium">{mod.name}</span>
                <span className="text-white/40 text-sm ml-2">#{mod.order}</span>
              </div>

              {/* 展示条数 */}
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">条数:</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={mod.showCount}
                  onChange={(e) => updateModule(mod.id, 'showCount', Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm text-center"
                />
              </div>

              {/* 上移/下移 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveModule(mod.id, -1)}
                  disabled={mod.order === 1}
                  className="p-1 rounded text-white/40 hover:text-white disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveModule(mod.id, 1)}
                  disabled={mod.order === modules.length}
                  className="p-1 rounded text-white/40 hover:text-white disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 数据清理 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">数据清理</h3>
        <p className="text-white/40 text-sm mb-4">
          清理重复数据和空内容，优化数据库存储
        </p>
        
        <button
          onClick={cleanData}
          disabled={cleaning}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
        >
          {cleaning ? '清理中...' : '执行数据清理'}
        </button>

        {cleanResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            cleanResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <p className={cleanResult.success ? 'text-green-400' : 'text-red-400'}>
              {cleanResult.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 资讯管理
function NewsManager() {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredNews = allNews.filter(item => {
    const matchSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllNews(data || []);
    } catch (err) {
      console.error('Load news error:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('确定要删除这条资讯吗？')) {
      try {
        await supabase.from('news').delete().eq('id', id);
        loadNews();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">资讯管理</h2>
        <button 
          onClick={() => { setEditingNews(null); setShowEditor(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          <Plus className="w-4 h-4" />
          新建资讯
        </button>
      </div>

      {/* 筛选表单 */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          placeholder="搜索标题..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm w-48"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">全部分类</option>
          <option value="前端趋势">前端趋势</option>
          <option value="AI编程">AI编程</option>
          <option value="工程化">工程化</option>
          <option value="技术动态">技术动态</option>
          <option value="产品发布">产品发布</option>
        </select>
        <button
          onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
          className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:text-white hover:bg-white/10 transition-colors"
        >
          重置
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{allNews.length === 0 ? '暂无资讯' : '没有匹配的资讯'}</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/60 text-sm">
                <th className="px-6 py-4">标题</th>
                <th className="px-6 py-4">分类</th>
                <th className="px-6 py-4">来源</th>
                <th className="px-6 py-4">浏览量</th>
                <th className="px-6 py-4">创建时间</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white max-w-xs truncate">{item.title}</td>
                  <td className="px-6 py-4 text-white/60">{item.category || '-'}</td>
                  <td className="px-6 py-4 text-white/60">{item.source || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/60">
                      {item.views || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {new Date(item.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400">
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
        <NewsEditor 
          news={editingNews} 
          onClose={() => setShowEditor(false)} 
          onSave={() => { setShowEditor(false); loadNews(); }}
        />
      )}
    </div>
  );
}

// 资讯编辑器
function NewsEditor({ news, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    source: news?.source || '',
    category: news?.category || '技术动态',
    url: news?.url || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (news) {
        await supabase.from('news').update(formData).eq('id', news.id);
      } else {
        await supabase.from('news').insert([{ ...formData, created_at: new Date().toISOString() }]);
      }
      onSave();
    } catch (err) {
      alert('保存失败');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{news ? '编辑资讯' : '新建资讯'}</h3>
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
              <label className="block text-white/60 text-sm mb-2">来源</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
                <option value="AI编程">AI编程</option>
                <option value="工程化">工程化</option>
                <option value="技术动态">技术动态</option>
                <option value="产品发布">产品发布</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">原文链接</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              placeholder="https://"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}