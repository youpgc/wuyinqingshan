import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, ExternalLink, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ParticleBackground from '../components/ParticleBackground';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function NewsDetail() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id: newsId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (newsId) {
      loadNews();
    }
  }, [newsId]);

  const loadNews = async () => {
    try {
      const { data: newsData, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsId)
        .single();
      
      if (error || !newsData) {
        setError('资讯不存在');
        setLoading(false);
        return;
      }
      
      setNews(newsData);
    } catch (err) {
      setError('加载失败');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">{error || '资讯不存在'}</p>
          <button onClick={() => navigate('/news')} className="text-purple-400 hover:text-purple-300">
            返回资讯列表
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
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回资讯列表</span>
          </motion.button>

          {/* 资讯头部 */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* 分类和热度 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-400">
                {news.category || '技术动态'}
              </span>
              {news.hot > 80 && (
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-red-500/20 text-red-400">
                  <TrendingUp className="w-4 h-4" />
                  热门
                </span>
              )}
            </div>

            {/* 标题 */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {news.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-6 text-white/50 text-sm">
              <span className="flex items-center gap-2">
                <span className="text-white/80">{news.source || '未知来源'}</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatTime(news.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                热度: {news.hot || 0}
              </span>
            </div>
          </motion.header>

          {/* 资讯内容 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            {news.content ? (
              <div 
                className="text-white/80 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <div className="text-white/60 text-center py-12">
                <p>该资讯暂无详细内容</p>
                {news.url && (
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    查看原文
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4"
          >
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>查看原文</span>
              </a>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </button>
            </div>
          </motion.div>

          {/* 版权声明 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <p className="text-white/60 text-sm">
              <strong className="text-white">文章来源：</strong>
              {news.source || '互联网'} · {formatDate(news.created_at)}
            </p>
            <p className="text-white/40 text-xs mt-2">
              本文仅供学习交流，如有侵权请联系删除。
            </p>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
