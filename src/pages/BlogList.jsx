import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { supabase } from '../lib/supabase';

const POSTS_PER_PAGE = 6;

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // 获取总数
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      setTotalCount(count || 0);

      // 获取分页数据
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, excerpt, content, category, image, views, created_at, tags')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Load posts error:', err);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcReadTime = (content) => {
    if (!content) return '3 分钟';
    const minutes = Math.ceil(content.length / 500);
    return `${minutes} 分钟`;
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
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              技术博客
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              追踪技术前沿，分享学习心得，共 {totalCount} 篇文章
            </p>
          </ScrollReveal>

          {/* 文章列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无文章</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={index * 0.1}>
                    <GlassCard className="group h-full flex flex-col cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                      {/* 图片 */}
                      <div className="relative h-48 overflow-hidden rounded-t-2xl">
                        <motion.img
                          src={post.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-black/50 backdrop-blur-sm text-white">
                            {post.category || '技术'}
                          </span>
                        </div>
                      </div>

                      {/* 内容 */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {calcReadTime(post.content)}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-1">
                          {post.excerpt || post.content?.substring(0, 100)}
                        </p>

                        {/* 标签和浏览量 */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              let tags = post.tags;
                              if (typeof tags === 'string') {
                                try {
                                  tags = JSON.parse(tags);
                                } catch {
                                  tags = tags.split(',').map(t => t.trim());
                                }
                              }
                              if (!Array.isArray(tags)) tags = [];
                              return tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                                  {tag}
                                </span>
                              ));
                            })()}
                          </div>
                          <span className="flex items-center gap-1 text-white/40 text-sm">
                            <Eye className="w-4 h-4" />
                            {post.views || 0}
                          </span>
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

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    ))}

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
                    第 {currentPage} / {totalPages} 页，共 {totalCount} 篇文章
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
              <ArrowRight className="w-4 h-4 rotate-180" />
              返回首页
            </motion.button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogList;
