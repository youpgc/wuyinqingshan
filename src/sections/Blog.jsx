import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import { postService, initializeData } from '../lib/dataService';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 初始化数据
    initializeData();
    // 获取已发布的文章
    const publishedPosts = postService.getPublished();
    setPosts(publishedPosts);
  }, []);

  return (
    <section id="blog" className="relative py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* 标题 */}
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

        {/* 博客文章网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <ScrollReveal key={post.id} delay={index * 0.1}>
              <GlassCard 
                className="group h-full flex flex-col"
                glowColor={post.color || 'rgba(168, 85, 247, 0.3)'}
              >
                {/* 图片 */}
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <motion.img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  {/* 分类标签 */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-black/50 backdrop-blur-sm text-white">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* 内容 */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* 元信息 */}
                  <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* 摘要 */}
                  <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  {/* 阅读更多 */}
                  <motion.a
                    href={`#/post/${post.id}`}
                    className="inline-flex items-center gap-2 text-purple-400 text-sm font-medium group/link"
                    whileHover={{ x: 5 }}
                  >
                    <span>阅读全文</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </motion.a>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* 查看更多 */}
        <ScrollReveal delay={0.6} className="text-center mt-12">
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="w-5 h-5" />
            <span>查看全部文章</span>
          </motion.button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Blog;
