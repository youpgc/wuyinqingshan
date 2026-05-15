import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Eye, Check, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ParticleBackground from '../components/ParticleBackground';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { id: postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (postId) {
      loadPost();
      checkBookmark();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      // 增加浏览量
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (!postData) {
        setError('文章不存在');
        setLoading(false);
        return;
      }
      
      // 增加浏览次数
      await supabase
        .from('posts')
        .update({ views: (postData.views || 0) + 1 })
        .eq('id', postId);
      
      setPost({ ...postData, views: (postData.views || 0) + 1 });
    } catch (err) {
      setError('加载失败');
    }
    setLoading(false);
  };

  const checkBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('wuyinqingshan_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(postId));
  };

  const toggleBookmark = async () => {
    const bookmarks = JSON.parse(localStorage.getItem('wuyinqingshan_bookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(id => id !== postId);
    } else {
      newBookmarks = [...bookmarks, postId];
      // 保存到数据库
      try {
        await supabase.from('bookmarks').upsert({
          user_id: localStorage.getItem('wuyinqingshan_visitor_id'),
          post_id: postId,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Bookmark save error:', err);
      }
    }
    
    localStorage.setItem('wuyinqingshan_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    const text = `${post?.title} - 雾隐青山博客`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToWeibo = () => {
    const text = `${post?.title} - 雾隐青山博客`;
    const url = window.location.href;
    window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
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

  // 渲染 Markdown 内容
  const renderContent = (content) => {
    if (!content) return '';
    
    // 简单转换 Markdown 为 HTML
    let html = content
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-white/5 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm text-green-400">$2</code></pre>')
      // 标题
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-10 mb-6">$1</h1>')
      // 列表
      .replace(/^\- (.*$)/gim, '<li class="ml-6 text-white/80 mb-2">$1</li>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-purple-400 hover:text-purple-300 underline">$1</a>')
      // 粗体
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      // 斜体
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      // 换行
      .replace(/\n\n/g, '</p><p class="text-white/80 leading-relaxed mb-4">')
      .replace(/\n/g, '<br/>');
    
    return `<p class="text-white/80 leading-relaxed mb-4">${html}</p>`;
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
          <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300">
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
            onClick={() => navigate('/')}
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
            {/* 分类和标签 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-400">
                {post.category || '技术'}
              </span>
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
                return tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/60">
                    {tag}
                  </span>
                ));
              })()}
            </div>

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
                {post.views} 次阅读
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
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />
          </motion.div>

          {/* 文章底部操作 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4"
          >
            {/* 分享按钮 */}
            <div className="relative">
              <motion.button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </motion.button>
              
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a2e] rounded-lg border border-white/10 shadow-xl overflow-hidden"
                >
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-white/5 transition-colors"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copySuccess ? '已复制!' : '复制链接'}</span>
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg">𝕏</span>
                    <span>分享到 Twitter</span>
                  </button>
                  <button
                    onClick={shareToWeibo}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg">📧</span>
                    <span>分享到微博</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* 收藏按钮 */}
            <motion.button
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? '已收藏' : '收藏'}</span>
            </motion.button>
          </motion.div>

          {/* 版权声明 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <p className="text-white/60 text-sm">
              <strong className="text-white">版权声明：</strong>
              本文来源互联网整理，仅供学习交流。如有侵权，请联系删除。
            </p>
            <p className="text-white/40 text-xs mt-2">
              最后更新：{formatDate(post.updated_at || post.created_at)}
            </p>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
