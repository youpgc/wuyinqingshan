import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';

const Blog = () => {
  const posts = [
    {
      title: '2025前端复盘：AI重构生态，前端人的生存破局之路',
      excerpt: '深入分析React 19、Vue 3.6、Vite 6等主流框架的核心迭代，以及AI与前端深度融合的开发实践...',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
      date: '2026-05-13',
      readTime: '15 分钟',
      category: '前端趋势',
      color: 'rgba(168, 85, 247, 0.3)',
    },
    {
      title: 'TypeScript 6.0 正式发布：开发体验全面升级',
      excerpt: '详解 TypeScript 6.0 的新特性，包括 using 关键字、strict 默认开启、内置 Temporal 类型支持等重磅更新...',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=500&fit=crop',
      date: '2026-05-10',
      readTime: '12 分钟',
      category: 'TypeScript',
      color: 'rgba(49, 120, 198, 0.3)',
    },
    {
      title: 'Claude Code vs GitHub Copilot：AI编程助手深度对比',
      excerpt: '从实战角度对比两大AI编程工具，分析各自优势与适用场景，探讨AI如何重塑开发者工作流...',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
      date: '2026-05-08',
      readTime: '10 分钟',
      category: 'AI编程',
      color: 'rgba(79, 172, 254, 0.3)',
    },
    {
      title: 'Tailwind CSS 4.0：性能革命与设计新范式',
      excerpt: '体验 Tailwind CSS 4.0 的全新 Oxide 引擎带来的 5 倍构建速度提升，以及新特性的实际应用...',
      image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=500&fit=crop',
      date: '2026-05-05',
      readTime: '8 分钟',
      category: 'CSS',
      color: 'rgba(0, 242, 254, 0.3)',
    },
    {
      title: 'Vite 6.0 深度解析：Environment API 与性能优化',
      excerpt: '全面解析 Vite 6.0 的核心更新，包括 Environment API、多环境支持、与 Rolldown 集成等重大改进...',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop',
      date: '2026-05-03',
      readTime: '10 分钟',
      category: '工程化',
      color: 'rgba(83, 185, 83, 0.3)',
    },
    {
      title: '前端框架内卷落幕：2025技术趋势总结',
      excerpt: '从框架之争到AI赋能，回顾2025年前端生态的核心变革，展望2026年的技术发展方向...',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=500&fit=crop',
      date: '2026-04-28',
      readTime: '15 分钟',
      category: '前端趋势',
      color: 'rgba(245, 87, 108, 0.3)',
    },
  ];

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
            <ScrollReveal key={index} delay={index * 0.1}>
              <GlassCard 
                className="group h-full flex flex-col"
                glowColor={post.color}
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
                    href="#"
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
