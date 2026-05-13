import './styles/animations.css';
import ParticleBackground from './components/ParticleBackground';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import Portfolio from './sections/Portfolio';
import Blog from './sections/Blog';
import News from './sections/News';

function App() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* 粒子背景 */}
      <ParticleBackground />
      
      {/* 导航 */}
      <Navigation />
      
      {/* 主内容 */}
      <main className="relative z-10">
        <section id="home">
          <Hero />
        </section>
        <About />
        <Portfolio />
        <Blog />
        <News />
      </main>
      
      {/* 页脚 */}
      <Footer />
    </div>
  );
}

export default App;
