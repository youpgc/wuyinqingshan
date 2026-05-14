import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ParticleBackground from '../components/ParticleBackground';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 从 URL 获取文章 ID
  const postId = window.location.hash.replace('#/post/', '');

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      
      // 增加浏览量
      if (data) {
        await supabase
          .from('posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', postId);
      }
      
      setPost(data);
    } catch (err) {
      setError('文章不存在');
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
    const words = content.length;
    const minutes = Math.ceil(words / 500);
    return `${minutes} 分钟`;
  };

  // 返回上一页
  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">{error || '文章不存在'}</p>
          <button onClick={goBack} className="text-purple-400 hover:text-purple-300">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <ParticleBackground />
      <Navigation />
      
      <main className="relative z-10 pt-24 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          {/* 返回按钮 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </motion.button>

          {/* 文章头部 */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* 分类 */}
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-400 mb-4">
              {post.category || '技术'}
            </span>

            {/* 标题 */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-6 text-white/50 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {calcReadTime(post.content)}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {(post.views || 0) + 1} 次阅读
              </span>
            </div>
          </motion.header>

          {/* 封面图 */}
          {post.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12 rounded-2xl overflow-hidden"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </motion.div>
          )}

          {/* 文章内容 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div 
              className="text-white/80 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: post.content?.replace(/\n/g, '<br />') || '' 
              }}
            />
          </motion.div>

          {/* 文章底部操作 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Bookmark className="w-4 h-4" />
                收藏
              </button>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
