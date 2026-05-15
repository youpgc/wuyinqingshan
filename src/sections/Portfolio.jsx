import { motion } from 'framer-motion';
import { ExternalLink, Eye } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';

// 自定义GitHub图标
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const Portfolio = ({ showCount = 6 }) => {
  const projects = [
    {
      title: '创意电商平台',
      description: '一个具有独特视觉设计的现代电商网站，采用React和Tailwind CSS构建，支持商品展示、购物车、用户评论等功能',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      tags: ['React', 'Tailwind CSS', 'Framer Motion'],
      demoUrl: 'https://youpgc.github.io/wuyinqingshan/',
      githubUrl: 'https://github.com/youpgc/wuyinqingshan',
      color: 'rgba(102, 126, 234, 0.3)',
    },
    {
      title: 'AI 智能助手',
      description: '基于 Claude API 的智能对话应用，支持多轮对话、上下文理解和代码生成',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      tags: ['Next.js', 'Claude API', 'Tailwind CSS'],
      demoUrl: 'https://claude-demo.example.com',
      githubUrl: 'https://github.com/youpgc/claude-assistant',
      color: 'rgba(79, 172, 254, 0.3)',
    },
    {
      title: '数据可视化仪表盘',
      description: '实时数据监控仪表盘，支持多种图表类型、主题切换和数据导出功能',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      tags: ['Vue.js', 'D3.js', 'Node.js'],
      demoUrl: 'https://dashboard.example.com',
      githubUrl: 'https://github.com/youpgc/data-dashboard',
      color: 'rgba(240, 147, 251, 0.3)',
    },
    {
      title: '3D 产品展示',
      description: '使用Three.js创建的交互式3D产品展示页面，支持360度旋转和缩放',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
      tags: ['Three.js', 'React Three Fiber', 'GSAP'],
      demoUrl: 'https://3d-showcase.example.com',
      githubUrl: 'https://github.com/youpgc/3d-showcase',
      color: 'rgba(250, 112, 154, 0.3)',
    },
    {
      title: '社交媒体应用',
      description: '功能完整的社交平台，支持实时消息、图片分享、点赞评论等社交功能',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
      tags: ['React Native', 'Firebase', 'Redux'],
      demoUrl: 'https://social.example.com',
      githubUrl: 'https://github.com/youpgc/social-app',
      color: 'rgba(254, 225, 64, 0.3)',
    },
    {
      title: '个人博客系统',
      description: '本博客系统，支持Markdown编辑、代码高亮、评论互动和访问统计',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
      tags: ['React', 'Supabase', 'Framer Motion'],
      demoUrl: 'https://youpgc.github.io/wuyinqingshan/',
      githubUrl: 'https://github.com/youpgc/wuyinqingshan',
      color: 'rgba(48, 207, 208, 0.3)',
    },
  ];

  return (
    <section id="portfolio" className="relative py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* 标题 */}
        <ScrollReveal className="text-center mb-20">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Portfolio
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            精选作品
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            探索我的创意项目，每一个都是技术与艺术的结合
          </p>
        </ScrollReveal>

        {/* 项目网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, showCount).map((project, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <GlassCard 
                className="group overflow-hidden h-full"
                glowColor={project.color}
              >
                {/* 图片容器 */}
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  {/* 悬停遮罩 */}
                  <motion.div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <motion.a
                      href={project.demoUrl}
                      className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href={project.githubUrl}
                      className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GithubIcon className="w-5 h-5" />
                    </motion.a>
                  </motion.div>
                </div>

                {/* 内容 */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 text-white/70 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 底部装饰线 */}
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 w-0 group-hover:w-full"
                />
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* 查看更多按钮 */}
        <ScrollReveal delay={0.6} className="text-center mt-12">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <GithubIcon className="w-5 h-5" />
            <span>查看更多项目</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Portfolio;
