import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Load posts error:', err);
    }
    setLoading(false);
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 计算阅读时间
  const calcReadTime = (content) => {
    if (!content) return '3 分钟';
    const words = content.length;
    const minutes = Math.ceil(words / 500);
    return `${minutes} 分钟`;
  };

  return (
    <section id="blog" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-20">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Blog
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            技术博客
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            追踪技术前沿，分享学习心得，记录成长点滴
          </p>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无文章，请稍后再来</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.1}>
                <GlassCard className="group h-full flex flex-col">
                  {/* 图片 */}
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <motion.img
                      src={post.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute top-4 left-4">
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

                    <motion.button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="inline-flex items-center gap-2 text-purple-400 text-sm font-medium group/link cursor-pointer"
                      whileHover={{ x: 5 }}
                    >
                      <span>阅读全文</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </motion.button>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
