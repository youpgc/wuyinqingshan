import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';

const Blog = () => {
  const posts = [
    {
      title: '深入理解 React Hooks 原理',
      excerpt: '探索 React Hooks 背后的实现机制，了解 useState 和 useEffect 的工作原理...',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=500&fit=crop',
      date: '2024-01-15',
      readTime: '8 分钟',
      category: 'React',
      color: 'rgba(97, 218, 251, 0.3)',
    },
    {
      title: 'CSS Grid 布局完全指南',
      excerpt: '从基础到进阶，全面掌握 CSS Grid 布局的各种技巧和最佳实践...',
      image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=500&fit=crop',
      date: '2024-01-10',
      readTime: '12 分钟',
      category: 'CSS',
      color: 'rgba(38, 77, 228, 0.3)',
    },
    {
      title: 'TypeScript 高级类型体操',
      excerpt: '学习 TypeScript 的高级类型系统，掌握条件类型、映射类型等高级特性...',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=500&fit=crop',
      date: '2024-01-05',
      readTime: '15 分钟',
      category: 'TypeScript',
      color: 'rgba(49, 120, 198, 0.3)',
    },
    {
      title: '构建高性能的 Web 应用',
      excerpt: '分享前端性能优化的实战经验，从加载速度到运行时性能的全面优化...',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop',
      date: '2023-12-28',
      readTime: '10 分钟',
      category: '性能优化',
      color: 'rgba(255, 107, 107, 0.3)',
    },
    {
      title: 'Three.js 3D 网页开发入门',
      excerpt: '从零开始学习 Three.js，创建令人惊叹的 3D 网页效果和交互体验...',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
      date: '2023-12-20',
      readTime: '20 分钟',
      category: 'WebGL',
      color: 'rgba(0, 0, 0, 0.3)',
    },
    {
      title: '现代前端工程化实践',
      excerpt: '探讨现代前端工程化的最佳实践，包括构建工具、CI/CD 和工作流优化...',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
      date: '2023-12-15',
      readTime: '12 分钟',
      category: '工程化',
      color: 'rgba(83, 185, 83, 0.3)',
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
            分享学习心得、技术探索和开发经验
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
