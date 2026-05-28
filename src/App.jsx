import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, HashRouter, useLocation } from 'react-router-dom';
import './styles/animations.css';
import ParticleBackground from './components/ParticleBackground';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import Portfolio from './sections/Portfolio';
import Blog from './sections/Blog';
import News from './sections/News';
import Contact from './sections/Contact';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './manage/Login';
import ManageApp from './manage/ManageApp';
import PostDetail from './pages/PostDetail';
import BlogList from './pages/BlogList';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import ScrollToTop from './components/ScrollToTop';
import { supabase } from './lib/supabase';

// 访问统计追踪组件 - 使用新的 visit_logs 表
function AnalyticsTracker() {
  const location = useLocation();
  
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const visitorId = localStorage.getItem('wuyinqingshan_visitor_id') || 
          'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('wuyinqingshan_visitor_id', visitorId);
        
        // 获取当前路径
        const path = location.pathname || '/';
        
        // 判断访问类型
        let visitType = 'platform';
        let resourceId = null;
        let resourceType = null;
        
        // 资源详情访问
        if (path.startsWith('/post/')) {
          visitType = 'resource';
          resourceType = 'post';
          resourceId = path.split('/')[2];
        } else if (path.startsWith('/news/')) {
          visitType = 'resource';
          resourceType = 'news';
          resourceId = path.split('/')[2];
        }
        
        // 记录到新的 visit_logs 表
        await supabase.from('visit_logs').insert({
          visitor_id: visitorId,
          visit_type: visitType,
          page_path: path,
          resource_id: resourceId,
          resource_type: resourceType,
          created_at: new Date().toISOString()
        });
        
        // 兼容旧表（可选）
        await supabase.from('visits').insert({
          visitor_id: visitorId,
          page: path.replace('/', '') || 'home'
        });
      } catch (err) {
        console.error('Visit record error:', err);
      }
    };
    
    recordVisit();
  }, [location]);
  
  return null;
}

// 滚动到锚点的组件
function ScrollToAnchor() {
  const location = useLocation();
  
  useEffect(() => {
    // 检查 URL 中是否有锚点（在 hash 之后的部分）
    const hash = window.location.hash;
    if (hash.includes('#/') && hash.includes('#', 2)) {
      // 格式: #/xxx#anchor
      const anchorIndex = hash.indexOf('#', 2);
      const anchor = hash.substring(anchorIndex + 1);
      const element = document.getElementById(anchor);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  
  return null;
}

// 前台主页
function Home() {
  const [modules, setModules] = useState(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'modules')
          .single();
        if (data?.value) {
          setModules(JSON.parse(data.value));
        }
      } catch (err) {
        console.error('Failed to load modules from API:', err);
      }
    };
    loadModules();
  }, []);

  const enabledModules = modules
    ? modules.filter(m => m.enabled).sort((a, b) => a.order - b.order)
    : null;

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <AnalyticsTracker />
      <ParticleBackground />
      <Navigation />
      <main className="relative z-10">
        <section id="home"><Hero /></section>
        {enabledModules ? enabledModules.map(mod => {
          switch(mod.id) {
            case 'about': return <About key="about" />;
            case 'portfolio': return <Portfolio key="portfolio" showCount={mod.showCount} />;
            case 'blog': return <Blog key="blog" showCount={mod.showCount} />;
            case 'news': return <News key="news" showCount={mod.showCount} />;
            case 'contact': return <Contact key="contact" />;
            default: return null;
          }
        }) : (
          <>
            <About />
            <Portfolio />
            <Blog />
            <News />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

// 受保护的管理后台路由
function ProtectedManage() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-white">加载中...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <ManageApp /> : <Navigate to="/manage/login" />;
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToAnchor />
        <Routes>
          {/* 前台路由 */}
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          
          {/* 后台管理路由 */}
          <Route path="/manage/login" element={<Login />} />
          <Route path="/manage/*" element={<ProtectedManage />} />
          
          {/* 兼容旧路由 */}
          <Route path="*" element={<Home />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
