import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
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
import { MiniBarChart } from '../components/ECharts';

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
  const navigate = useNavigate();
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
  const [visitsData, setVisitsData] = useState([]);
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
      
      const { data: rawVisits } = await supabase
        .from('visit_logs')
        .select('visitor_id, created_at, visit_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const uniqueVisitors = new Set(rawVisits?.map(v => v.visitor_id) || []).size;
      const todayStart = new Date().toISOString().split('T')[0];
      const todayVisits = rawVisits?.filter(v => v.created_at.startsWith(todayStart)).length || 0;
      const todayPlatformVisits = rawVisits?.filter(v => v.created_at.startsWith(todayStart) && v.visit_type === 'platform').length || 0;
      const todayResourceVisits = rawVisits?.filter(v => v.created_at.startsWith(todayStart) && v.visit_type === 'resource').length || 0;
      
      // 保存访问数据用于图表
      setVisitsData(rawVisits || []);

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
          
          {/* 访问趋势图表 - 传递真实的访问数据 */}
          <VisitChart data={visitsData || []} title="访问趋势" />
          
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
                    <div 
                      key={post.id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
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
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/news/${item.id}`)}
                    >
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
  const [pageModuleStats, setPageModuleStats] = useState([]);
  const [homeModuleStats, setHomeModuleStats] = useState([]);
  const [moduleTrends, setModuleTrends] = useState({});
  const [homeTrends, setHomeTrends] = useState({});
  const [visitRecords, setVisitRecords] = useState([]);
  const [visitPage, setVisitPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const [selectedView, setSelectedView] = useState('all');
  const trendChartRef = useRef(null);
  const trendChartInstance = useRef(null);

  const PAGE_MODULES = [
    { id: 'home', name: '首页', icon: '🏠', color: '#a855f7', paths: ['/', ''] },
    { id: 'blog', name: '博客', icon: '📝', color: '#3b82f6', paths: ['/blog'], detailPrefix: '/post/' },
    { id: 'news', name: '资讯', icon: '📰', color: '#22c55e', paths: ['/news'], detailPrefix: '/news/' },
    { id: 'portfolio', name: '作品', icon: '🎨', color: '#ec4899', paths: ['/portfolio'] },
    { id: 'tools', name: '工具箱', icon: '🔧', color: '#8b5cf6', paths: ['/tools'] },
    { id: 'about', name: '关于我', icon: '👤', color: '#6366f1', paths: ['/about'] },
    { id: 'contact', name: '联系我', icon: '📧', color: '#14b8a6', paths: ['/contact'] },
  ];

  const HOME_MODULES = [
    { id: 'home_blog', name: '博客', icon: '📝', color: '#3b82f6' },
    { id: 'home_news', name: '资讯', icon: '📰', color: '#22c55e' },
    { id: 'home_portfolio', name: '作品', icon: '🎨', color: '#ec4899' },
    { id: 'home_tools', name: '工具箱', icon: '🔧', color: '#8b5cf6' },
    { id: 'home_about', name: '关于我', icon: '👤', color: '#6366f1' },
    { id: 'home_contact', name: '联系我', icon: '📧', color: '#14b8a6' },
  ];

  // 根据 page_path 获取模块
  const getPageModuleByRecord = (record) => {
    const path = record.page_path || '/';
    if (path.startsWith('/#module-')) {
      const moduleId = path.substring(9);
      const mapping = { blog: 'home_blog', news: 'home_news', portfolio: 'home_portfolio', tools: 'home_tools', about: 'home_about', contact: 'home_contact' };
      const homeId = mapping[moduleId];
      if (homeId) return HOME_MODULES.find(m => m.id === homeId);
      return HOME_MODULES[0];
    }
    if (path === '/' || path === '') return PAGE_MODULES.find(m => m.id === 'home');
    if (path === '/blog' || path.startsWith('/post/')) return PAGE_MODULES.find(m => m.id === 'blog');
    if (path === '/news' || path.startsWith('/news/')) return PAGE_MODULES.find(m => m.id === 'news');
    if (path === '/portfolio' || path.startsWith('/portfolio/')) return PAGE_MODULES.find(m => m.id === 'portfolio');
    if (path === '/tools') return PAGE_MODULES.find(m => m.id === 'tools');
    if (path === '/about') return PAGE_MODULES.find(m => m.id === 'about');
    if (path === '/contact') return PAGE_MODULES.find(m => m.id === 'contact');
    return PAGE_MODULES[0];
  };

  const isHomeModuleRecord = (record) => {
    return (record.page_path || '').startsWith('/#module-');
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const { count: totalVisits } = await supabase
        .from('visit_logs')
        .select('*', { count: 'exact', head: true });

      const { data: rawVisits } = await supabase
        .from('visit_logs')
        .select('visitor_id, created_at, visit_type, page_path, resource_type')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const uniqueVisitors = new Set(rawVisits?.map(v => v.visitor_id) || []).size;
      const todayStart = new Date().toISOString().split('T')[0];
      const todayVisits = rawVisits?.filter(v => v.created_at.startsWith(todayStart)).length || 0;

      const now = new Date();
      const dayOfWeek = now.getDay() || 7;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek + 1);
      const weekVisits = rawVisits?.filter(v => v.created_at >= weekStart.toISOString().split('T')[0]).length || 0;

      const byDay = {};
      rawVisits?.forEach(v => {
        const day = v.created_at.split('T')[0];
        byDay[day] = (byDay[day] || 0) + 1;
      });

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        last7Days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, visits: byDay[dateStr] || 0 });
      }

      setStats({ totalVisits: totalVisits || 0, uniqueVisitors, todayVisits, weekVisits, last7Days });

      // 模块统计
      const pageModuleMap = {};
      PAGE_MODULES.forEach(m => { pageModuleMap[m.id] = { ...m, visits: 0, uniqueVisitors: new Set() }; });
      const homeModuleMap = {};
      HOME_MODULES.forEach(m => { homeModuleMap[m.id] = { ...m, visits: 0, uniqueVisitors: new Set() }; });

      rawVisits?.forEach(v => {
        const module = getPageModuleByRecord(v);
        if (isHomeModuleRecord(v)) {
          if (homeModuleMap[module.id]) {
            homeModuleMap[module.id].visits++;
            homeModuleMap[module.id].uniqueVisitors.add(v.visitor_id);
          }
        } else {
          if (pageModuleMap[module.id]) {
            pageModuleMap[module.id].visits++;
            pageModuleMap[module.id].uniqueVisitors.add(v.visitor_id);
          }
        }
      });

      setPageModuleStats(Object.values(pageModuleMap).map(m => ({ ...m, uniqueVisitors: m.uniqueVisitors.size })));
      setHomeModuleStats(Object.values(homeModuleMap).map(m => ({ ...m, uniqueVisitors: m.uniqueVisitors.size })));

      // 7日趋势
      const trends = {};
      PAGE_MODULES.forEach(module => {
        const moduleVisits = rawVisits?.filter(v => {
          const m = getPageModuleByRecord(v);
          return m.id === module.id && !isHomeModuleRecord(v);
        }) || [];
        const mByDay = {};
        moduleVisits.forEach(v => { const day = v.created_at.split('T')[0]; mByDay[day] = (mByDay[day] || 0) + 1; });
        const mLast7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const ds = d.toISOString().split('T')[0];
          mLast7.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, visits: mByDay[ds] || 0 });
        }
        trends[module.id] = mLast7;
      });
      setModuleTrends(trends);

      const homeT = {};
      HOME_MODULES.forEach(module => {
        const moduleVisits = rawVisits?.filter(v => {
          const m = getPageModuleByRecord(v);
          return m.id === module.id && isHomeModuleRecord(v);
        }) || [];
        const hByDay = {};
        moduleVisits.forEach(v => { const day = v.created_at.split('T')[0]; hByDay[day] = (hByDay[day] || 0) + 1; });
        const hLast7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const ds = d.toISOString().split('T')[0];
          hLast7.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, visits: hByDay[ds] || 0 });
        }
        homeT[module.id] = hLast7;
      });
      setHomeTrends(homeT);
    } catch (err) {
      console.error('Load stats error:', err);
    }
    setLoading(false);
  };

  // 加载访问记录
  const loadVisitRecords = async () => {
    const pageSize = 20;
    const from = (visitPage - 1) * pageSize;
    const { data } = await supabase
      .from('visit_logs')
      .select('visitor_id, page_path, visit_type, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    setVisitRecords(data || []);
  };

  // 更新趋势图表
  const updateTrendChart = () => {
    const chart = trendChartInstance.current;
    if (!chart || !stats?.last7Days) return;

    const last7DaysLabels = stats.last7Days.map(d => d.date);
    const series = [];

    const currentPageStats = selectedView === 'home' ? [] : pageModuleStats;
    const currentHomeStats = selectedView === 'pages' ? [] : homeModuleStats;

    if (selectedView !== 'home') {
      series.push({
        name: '总访问', type: chartType,
        data: stats.last7Days.map(d => d.visits),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#a855f7' }, { offset: 1, color: '#ec4899' },
          ]),
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
        },
        lineStyle: { color: '#a855f7', width: 3 },
        areaStyle: chartType === 'line' ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(168, 85, 247, 0.3)' },
            { offset: 1, color: 'rgba(168, 85, 247, 0)' },
          ]),
        } : undefined,
        smooth: chartType === 'line',
      });

      currentPageStats.slice(0, 4).forEach(module => {
        const trend = moduleTrends[module.id] || [];
        series.push({
          name: module.name, type: chartType,
          data: trend.map(d => d.visits),
          itemStyle: { color: module.color, borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0 },
          lineStyle: { color: module.color, width: 2 },
          smooth: chartType === 'line',
        });
      });
    }

    if (selectedView !== 'pages') {
      currentHomeStats.slice(0, 4).forEach(module => {
        const trend = homeTrends[module.id] || [];
        series.push({
          name: module.name, type: chartType,
          data: trend.map(d => d.visits),
          itemStyle: { color: module.color, borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0 },
          lineStyle: { color: module.color, width: 2 },
          smooth: chartType === 'line',
        });
      });
    }

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(26, 26, 46, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', textStyle: { color: '#fff' } },
      legend: { data: series.map(s => s.name), textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 }, top: 0, itemWidth: 16, itemHeight: 10 },
      grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
      xAxis: { type: 'category', data: last7DaysLabels, axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } }, axisLabel: { color: 'rgba(255, 255, 255, 0.6)' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } }, axisLabel: { color: 'rgba(255, 255, 255, 0.6)' }, splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } } },
      series,
    }, true);
  };

  // 初始化 ECharts
  useEffect(() => {
    if (!trendChartRef.current || trendChartInstance.current) return;
    
    console.log('[TrendChart] Initializing...');
    trendChartInstance.current = echarts.init(trendChartRef.current, 'dark');
    
    const handleResize = () => { trendChartInstance.current?.resize(); };
    window.addEventListener('resize', handleResize);
    
    // 如果数据已加载，立即更新
    if (stats?.last7Days) {
      console.log('[TrendChart] Data already loaded, updating chart');
      updateTrendChart();
    }
    
    return () => {
      console.log('[TrendChart] Cleaning up...');
      window.removeEventListener('resize', handleResize);
      trendChartInstance.current?.dispose();
      trendChartInstance.current = null;
    };
  }, [trendChartRef.current]);

  // 加载数据
  useEffect(() => { loadStats(); }, []);

  // 数据更新后更新图表
  useEffect(() => {
    if (!trendChartInstance.current || !stats?.last7Days) {
      console.log('[TrendChart] Skip update:', { hasInstance: !!trendChartInstance.current, hasData: !!stats?.last7Days });
      return;
    }
    console.log('[TrendChart] Updating with data:', stats.last7Days);
    updateTrendChart();
  }, [stats, chartType, selectedView, pageModuleStats, homeModuleStats, moduleTrends, homeTrends]);

  // 加载访问记录
  useEffect(() => { loadVisitRecords(); }, [visitPage]);

  const totalPageVisits = pageModuleStats.reduce((sum, m) => sum + m.visits, 0);
  const totalHomeVisits = homeModuleStats.reduce((sum, m) => sum + m.visits, 0);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
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
          {/* 概览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Activity className="w-5 h-5 text-purple-400" />, label: '总访问', value: stats?.totalVisits || 0 },
              { icon: <Users className="w-5 h-5 text-blue-400" />, label: '独立访客', value: stats?.uniqueVisitors || 0 },
              { icon: <Eye className="w-5 h-5 text-green-400" />, label: '今日访问', value: stats?.todayVisits || 0 },
              { icon: <TrendingUp className="w-5 h-5 text-pink-400" />, label: '本周访问', value: stats?.weekVisits || 0 },
            ].map((card, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  {card.icon}
                  <span className="text-xs text-white/40">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* 趋势图表 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <h3 className="text-lg font-semibold text-white">访问趋势（近7天）</h3>
              <div className="flex items-center gap-3">
                <div className="flex bg-white/5 rounded-lg p-1">
                  {['all', 'pages', 'home'].map(view => (
                    <button key={view} onClick={() => setSelectedView(view)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${selectedView === view ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}>
                      {{ all: '全部', pages: '页面', home: '首页模块' }[view]}
                    </button>
                  ))}
                </div>
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button onClick={() => setChartType('bar')} className={`px-3 py-1.5 rounded text-sm transition-colors ${chartType === 'bar' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}>柱状图</button>
                  <button onClick={() => setChartType('line')} className={`px-3 py-1.5 rounded text-sm transition-colors ${chartType === 'line' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}>折线图</button>
                </div>
              </div>
            </div>
            <div ref={trendChartRef} style={{ width: '100%', height: '400px' }} />
          </div>

          {/* 首页模块点击统计 */}
          {homeModuleStats.some(m => m.visits > 0) && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">首页模块点击统计</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {homeModuleStats.filter(m => m.visits > 0).map(module => {
                  const percentage = totalHomeVisits > 0 ? ((module.visits / totalHomeVisits) * 100).toFixed(1) : 0;
                  return (
                    <div key={module.id} className="rounded-xl p-3 transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: `${module.color}15`, border: `1px solid ${module.color}30` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{module.icon}</span>
                        <span className="text-white font-medium text-xs">{module.name}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold" style={{ color: module.color }}>{module.visits}</span>
                        <span className="text-white/40 text-xs">{percentage}%</span>
                      </div>
                      <MiniBarChart data={homeTrends[module.id] || []} color={module.color} height={32} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 详细统计表格 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">页面访问统计</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-white/60 text-sm">
                    <th className="px-4 py-3">模块</th>
                    <th className="px-4 py-3">访问次数</th>
                    <th className="px-4 py-3">独立访客</th>
                    <th className="px-4 py-3">占比</th>
                    <th className="px-4 py-3">7日趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {pageModuleStats.filter(m => m.visits > 0).map(module => {
                    const percentage = totalPageVisits > 0 ? ((module.visits / totalPageVisits) * 100).toFixed(1) : 0;
                    return (
                      <tr key={module.id} className="border-b border-white/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{module.icon}</span>
                            <span style={{ color: module.color }}>{module.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white font-medium">{module.visits}</td>
                        <td className="px-4 py-3 text-white/60">{module.uniqueVisitors}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: module.color }} />
                            </div>
                            <span className="text-white/40 text-xs">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 w-36">
                          <MiniBarChart data={moduleTrends[module.id] || []} color={module.color} height={32} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 最近访问记录 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">最近访问记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-white/60 text-sm">
                    <th className="px-4 py-3">访客ID</th>
                    <th className="px-4 py-3">页面路径</th>
                    <th className="px-4 py-3">类型</th>
                    <th className="px-4 py-3">访问时间</th>
                  </tr>
                </thead>
                <tbody>
                  {visitRecords.map((record, index) => {
                    const module = getPageModuleByRecord(record);
                    const isHome = isHomeModuleRecord(record);
                    return (
                      <tr key={index} className="border-b border-white/5">
                        <td className="px-4 py-3 text-white/60 text-sm font-mono">{record.visitor_id?.substring(0, 20)}...</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{module.icon}</span>
                            <span className="text-white text-sm">{record.page_path}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${isHome ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {isHome ? '模块点击' : '页面访问'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">{formatDate(record.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* 分页 */}
            <div className="flex justify-center mt-4 gap-2">
              <button onClick={() => setVisitPage(p => Math.max(1, p - 1))} disabled={visitPage <= 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 disabled:opacity-30">上一页</button>
              <span className="px-3 py-1.5 text-white/40 text-sm">第 {visitPage} 页</span>
              <button onClick={() => setVisitPage(p => p + 1)} disabled={visitRecords.length < 20}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 disabled:opacity-30">下一页</button>
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