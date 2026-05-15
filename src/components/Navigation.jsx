import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [enabledModuleIds, setEnabledModuleIds] = useState(null);

  const allNavItems = [
    { name: '首页', id: 'home' },
    { name: '关于', id: 'about' },
    { name: '作品', id: 'portfolio' },
    { name: '博客', id: 'blog' },
    { name: '资讯', id: 'news' },
  ];

  // 从 localStorage 读取模块配置，动态过滤导航项
  useEffect(() => {
    const saved = localStorage.getItem('wuyinqingshan_modules');
    if (saved) {
      try {
        const modules = JSON.parse(saved);
        const enabledIds = modules.filter(m => m.enabled).map(m => m.id);
        setEnabledModuleIds(enabledIds);
      } catch {}
    }
  }, []);

  // 根据模块配置过滤导航项（首页始终显示）
  const navItems = enabledModuleIds
    ? allNavItems.filter(item => item.id === 'home' || enabledModuleIds.includes(item.id))
    : allNavItems;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // 检测当前活动区域
      for (let i = navItems.length - 1; i >= 0; i--) {
        const section = navItems[i].id;
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.a
              href="#/"
              className="flex items-center gap-2 text-white font-bold text-xl"
              whileHover={{ scale: 1.05 }}
              onClick={(e) => handleNavClick(e, 'home')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block">雾隐青山</span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </motion.a>
              ))}
            </div>

            {/* CTA Button */}
            {(!enabledModuleIds || enabledModuleIds.includes('contact')) && (
            <div className="hidden md:block">
              <motion.a
                href="#contact"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                联系我
              </motion.a>
            </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-20 left-4 right-4 bg-[#12121a]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </div>

              {(!enabledModuleIds || enabledModuleIds.includes('contact')) && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <motion.a
                  href="#contact"
                  className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center font-medium"
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleNavClick(e, 'contact')}
                >
                  联系我
                </motion.a>
              </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
