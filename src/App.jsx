import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
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
import { analyticsAPI } from './lib/apiService';

// 访问统计追踪组件 - 记录真实访问数据
function AnalyticsTracker() {
  useEffect(() => {
    // 生成访客ID
    const visitorId = localStorage.getItem('wuyinqingshan_visitor_id') || 
      'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('wuyinqingshan_visitor_id', visitorId);
    
    // 记录真实访问
    analyticsAPI.recordVisit(visitorId, 'home').catch(() => {});
  }, []);
  
  return null;
}

// 前台主页
function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <AnalyticsTracker />
      <ParticleBackground />
      <Navigation />
      <main className="relative z-10">
        <section id="home"><Hero /></section>
        <About />
        <Portfolio />
        <Blog />
        <News />
        <Contact />
      </main>
      <Footer />
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
  // 检测是否在管理后台路径（hash 路由）
  const isManagePath = window.location.hash.startsWith('#/manage');
  
  return (
    <AuthProvider>
      {isManagePath ? (
        // 管理后台使用 HashRouter
        <HashRouter>
          <Routes>
            <Route path="/manage/login" element={<Login />} />
            <Route path="/manage/*" element={<ProtectedManage />} />
          </Routes>
        </HashRouter>
      ) : (
        // 前台使用 BrowserRouter（无 basename，适配 Netlify）
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage/login" element={<Login />} />
            <Route path="/manage/*" element={<ProtectedManage />} />
          </Routes>
        </BrowserRouter>
      )}
    </AuthProvider>
  );
}

export default App;
