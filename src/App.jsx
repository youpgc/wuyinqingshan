import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, HashRouter } from 'react-router-dom';
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

// 访问统计追踪组件
function AnalyticsTracker() {
  useEffect(() => {
    // 记录页面访问
    const trackVisit = () => {
      const analytics = JSON.parse(localStorage.getItem('wuyinqingshan_analytics') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const existingDay = analytics.find(a => a.date === today);
      
      if (existingDay) {
        existingDay.visits += 1;
        existingDay.pageViews += 1;
      } else {
        analytics.push({
          date: today,
          visits: 1,
          uniqueVisitors: 1,
          pageViews: 1
        });
      }
      
      localStorage.setItem('wuyinqingshan_analytics', JSON.stringify(analytics));
    };
    
    trackVisit();
  }, []);
  
  return null;
}

// 前台主页
function Home() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  // 处理404重定向
  useEffect(() => {
    if (redirect) {
      const decodedPath = decodeURIComponent(redirect);
      // 移除redirect参数并导航到目标路径
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      
      // 使用hash路由导航
      if (decodedPath.startsWith('/manage')) {
        window.location.hash = decodedPath;
      }
    }
  }, [redirect]);
  
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

// HashRouter包装器用于管理后台
function ManageRoutes() {
  return (
    <Routes>
      <Route path="/manage/login" element={<Login />} />
      <Route path="/manage/*" element={<ProtectedManage />} />
    </Routes>
  );
}

function App() {
  // 检测是否在管理后台路径
  const isManagePath = window.location.hash.startsWith('#/manage') || 
                       window.location.pathname.includes('/manage');
  
  return (
    <AuthProvider>
      {isManagePath ? (
        // 管理后台使用HashRouter
        <HashRouter>
          <ManageRoutes />
        </HashRouter>
      ) : (
        // 前台使用BrowserRouter
        <BrowserRouter basename="/wuyinqingshan">
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
