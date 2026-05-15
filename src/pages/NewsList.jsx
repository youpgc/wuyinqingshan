import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { supabase } from '../lib/supabase';

const NEWS_PER_PAGE = 8;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalCount / NEWS_PER_PAGE);

  useEffect(() => {
    loadNews();
  }, [currentPage]);

  const loadNews = async () => {
    try {
      setLoading(true);
      // 获取总数
      const { count } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });
      setTotalCount(count || 0);

      // 获取分页数据
      const from = (currentPage - 1) * NEWS_PER_PAGE;
      const to = from + NEWS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('news')
        .select('id, title, source, category, url, views, created_at')
        .order('views', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      console.error('Load news error:', err);
    }
    setLoading(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <ParticleBackground />
      <Navigation />
      
      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* 页面标题 */}
          <ScrollReveal className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
              Daily News
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              每日资讯
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              追踪技术前沿，掌握行业动态，共 {totalCount} 条资讯
            </p>
          </ScrollReveal>

          {/* 资讯列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无资讯</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {news.map((item, index) => (
                  <ScrollReveal key={item.id} delay={index * 0.05}>
                    <GlassCard className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                              {item.category || '技术动态'}
                            </span>
                          </div>
                          <motion.h3 
                            onClick={() => navigate(`/news/${item.id}`)}
                            className="text-lg font-medium text-white hover:text-purple-400 transition-colors mb-2 cursor-pointer"
                            whileHover={{ x: 5 }}
                          >
                            {item.title}
                          </motion.h3>
                          <div className="flex items-center gap-3 text-sm text-white/50">
                            <span>{item.source || '未知来源'}</span>
                            <span>·</span>
                            <span>{formatTime(item.created_at)}</span>
                            <span>·</span>
                            <span>浏览: {item.views || 0}</span>
                            {item.url && (
                              <>
                                <span>·</span>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  原文 <ExternalLink className="w-3 h-3" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <ScrollReveal delay={0.3}>
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <motion.button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <motion.button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 text-white/60 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {page}
                        </motion.button>
                      );
                    })}

                    <motion.button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <p className="text-center text-white/40 text-sm mt-4">
                    第 {currentPage} / {totalPages} 页，共 {totalCount} 条资讯
                  </p>
                </ScrollReveal>
              )}
            </>
          )}

          {/* 返回首页 */}
          <div className="text-center mt-12">
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              whileHover={{ x: -5 }}
            >
              <ExternalLink className="w-4 h-4 rotate-180" />
              返回首页
            </motion.button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsList;
