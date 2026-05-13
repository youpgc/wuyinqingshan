import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import { newsService } from '../lib/dataService';

const News = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newsData, setNewsData] = useState({ categories: [] });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 从数据服务获取新闻
    const data = newsService.getAll();
    setNewsData(data);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const data = newsService.getAll();
      setNewsData(data);
      setIsRefreshing(false);
    }, 1000);
  };

  const formattedDate = currentTime.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <section id="news" className="relative py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* 标题 */}
        <ScrollReveal className="text-center mb-12">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Daily News
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            每日资讯
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            追踪技术前沿，掌握行业动态 📰
          </p>
        </ScrollReveal>

        {/* 日期和时间 */}
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
                <p className="text-white text-2xl font-mono font-bold">
                  {currentTime.toLocaleTimeString('zh-CN')}
                </p>
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

        {/* 新闻分类网格 */}
        <div className="grid md:grid-cols-2 gap-6">
          {newsData.categories.map((category, catIndex) => (
            <ScrollReveal key={catIndex} delay={catIndex * 0.1}>
              <GlassCard className="h-full" glowColor={`rgba(${catIndex === 0 ? '59, 130, 246' : catIndex === 1 ? '168, 85, 247' : catIndex === 2 ? '249, 115, 22' : '34, 197, 94'}, 0.2)`}>
                {/* 分类标题 */}
                <div className="flex items-center justify-between mb-6 p-6 pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                </div>

                {/* 新闻列表 */}
                <div className="px-6 pb-6 space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <motion.a
                      key={itemIndex}
                      href="#"
                      className="group block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium line-clamp-1 group-hover:text-purple-400 transition-colors">
                              {item.title}
                            </h4>
                            {item.hot && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                                <TrendingUp className="w-3 h-3" />
                                热
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-white/50">
                            <span>{item.source}</span>
                            <span>·</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* 提示信息 */}
        <ScrollReveal delay={0.5}>
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">关于资讯</h4>
                <p className="text-white/60 text-sm">
                  资讯基于每日技术动态研读整理，包含前端框架、AI编程、工程化工具、行业趋势等板块。每周一自动更新。
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
