import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Code2, Palette } from 'lucide-react';
import TextReveal from '../components/TextReveal';
import GlowingButton from '../components/GlowingButton';
import MorphingBlob from '../components/MorphingBlob';

const Hero = () => {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" />
      
      {/* 变形Blob背景 */}
      <MorphingBlob 
        className="top-20 -left-20" 
        colors={['#667eea', '#764ba2', '#f093fb']}
        size={500}
        duration={25}
      />
      <MorphingBlob 
        className="bottom-20 -right-20" 
        colors={['#4facfe', '#00f2fe', '#667eea']}
        size={400}
        duration={20}
      />
      <MorphingBlob 
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" 
        colors={['#f5576c', '#fa709a', '#fee140']}
        size={600}
        duration={30}
      />

      {/* 网格背景 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 主内容 */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* 标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white/70">欢迎来到我的创意空间</span>
        </motion.div>

        {/* 主标题 */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
          <span className="block text-white mb-2">
            <TextReveal text="创意开发者" delay={0.2} />
          </span>
          <span className="block">
            <TextReveal 
              text="& 设计师" 
              delay={0.5}
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            />
          </span>
        </h1>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12"
        >
          用代码编织梦想，用设计诠释美学
          <br />
          在这里记录技术成长与创意灵感
        </motion.p>

        {/* 技能标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { icon: Code2, text: '前端开发' },
            { icon: Palette, text: 'UI/UX设计' },
            { icon: Sparkles, text: '创意编程' },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <item.icon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/80">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <GlowingButton href="#portfolio" size="large">
            查看作品
          </GlowingButton>
          <GlowingButton variant="outline" href="#about" size="large">
            了解更多
          </GlowingButton>
        </motion.div>
      </div>

      {/* 滚动提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={scrollToAbout}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-sm">向下滚动</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  );
};

export default Hero;
