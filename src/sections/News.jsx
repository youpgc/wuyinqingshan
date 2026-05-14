import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const categoryConfig = {
  '前端趋势': { icon: '🔥', color: 'from-blue-500 to-cyan-500', glowColor: 'rgba(59, 130, 246, 0.2)' },
  'AI编程': { icon: '🤖', color: 'from-purple-500 to-pink-500', glowColor: 'rgba(168, 85, 247, 0.2)' },
  '工程化': { icon: '⚙️', color: 'from-orange-500 to-yellow-500', glowColor: 'rgba(249, 115, 22, 0.2)' },
  '技术动态': { icon: '📡', color: 'from-green-500 to-emerald-500', glowColor: 'rgba(34, 197, 94, 0.2)' },
};

const News = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('hot', { ascending: false });
      
      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      console.error('Load news error:', err);
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNews().finally(() => setIsRefreshing(false));
  };

  // 按分类分组
  const grouped = {};
  news.forEach(item => {
    const cat = item.category || '技术动态';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const categories = Object.entries(grouped).map(([name, items]) => ({
    name,
    icon: categoryConfig[name]?.icon || '📡',
    color: categoryConfig[name]?.color || 'from-purple-500 to-pink-500',
    glowColor: categoryConfig[name]?.glowColor || 'rgba(168, 85, 247, 0.2)',
    items
  }));

  const formattedDate = currentTime.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  };

  return (
    <section id="news" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-12">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">Daily News</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">每日资讯</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">追踪技术前沿，掌握行业动态 📰</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">今日日期</p>
                <p className="text-white text-lg font-semibold">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white/60 text-sm">当前时间</p>
                <p className="text-white text-2xl font-mono font-bold">{currentTime.toLocaleTimeString('zh-CN')}</p>
              </div>
              <motion.button
                onClick={handleRefresh}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无资讯</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category, catIndex) => (
              <ScrollReveal key={catIndex} delay={catIndex * 0.1}>
                <GlassCard className="h-full" glowColor={category.glowColor}>
                  <div className="flex items-center justify-between mb-6 p-6 pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    </div>
                    <span className="text-white/40 text-sm">{category.items.length}条</span>
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <motion.a
                        key={item.id}
                        href={item.url || '#'}
                        target={item.url ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="group block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium line-clamp-1 group-hover:text-purple-400 transition-colors">
                                {item.title}
                              </h4>
                              {item.hot > 80 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                                  <TrendingUp className="w-3 h-3" />热
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/50">
                              <span>{item.source || '未知来源'}</span>
                              <span>·</span>
                              <span>{formatTime(item.created_at)}</span>
                            </div>
                          </div>
                          {item.url && <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors flex-shrink-0" />}
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal delay={0.5}>
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">关于资讯</h4>
                <p className="text-white/60 text-sm">
                  资讯由系统每日自动收集整理，包含前端框架、AI编程、工程化工具、行业趋势等板块。点击标题可查看原文。
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default News;
