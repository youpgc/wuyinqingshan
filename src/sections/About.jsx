import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, Code, Coffee, Heart, Sparkles } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import GradientBorder from '../components/GradientBorder';

const About = () => {
  const stats = [
    { number: '5+', label: '年前端经验', icon: Code },
    { number: '30+', label: '完成项目', icon: Coffee },
    { number: '100%', label: '技术热情', icon: Heart },
  ];

  const skills = [
    { name: 'React / Next.js', level: 92, color: '#61dafb' },
    { name: 'TypeScript', level: 88, color: '#3178c6' },
    { name: 'Vue / Nuxt', level: 85, color: '#42b883' },
    { name: 'Tailwind CSS', level: 90, color: '#06b6d4' },
    { name: 'AI 辅助开发', level: 85, color: '#a855f7' },
  ];

  const techInterests = [
    { icon: '🤖', name: 'AI编程', desc: 'GitHub Copilot / Claude Code' },
    { icon: '⚡', name: '性能优化', desc: 'Core Web Vitals' },
    { icon: '🎨', name: '创意设计', desc: 'UI/UX Design' },
    { icon: '🔧', name: '工程化', desc: 'Vite / Turbopack' },
  ];

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* 标题 */}
        <ScrollReveal className="text-center mb-20">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            About Me
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            关于我
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            热爱技术，追逐前沿，在代码与设计之间寻找平衡
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧：个人信息 */}
          <ScrollReveal direction="left">
            <GradientBorder className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Yaron</h3>
                    <p className="text-white/60">前端开发者 / 技术博客作者</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: MapPin, text: '中国 · 北京' },
                    { icon: Mail, text: 'yaron@wuyinqingshan.com' },
                    { icon: Calendar, text: '2019年 - 至今' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/70">
                      <item.icon className="w-5 h-5 text-purple-400" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-white/60 leading-relaxed">
                  我是一名深耕前端领域多年的开发者，经历了从 jQuery 到 React/Vue 
                  的技术变革，见证了前端工程化从无到有的过程。目前专注于 React 生态、
                  TypeScript、以及 AI 辅助编程工具的研究与应用。
                </p>

                <p className="text-white/60 leading-relaxed">
                  热衷于分享技术心得，相信"输出是最好的输入"。在这个博客，我会记录
                  学习过程、分析技术趋势、分享实战经验，与你一起成长。
                </p>
              </div>
            </GradientBorder>
          </ScrollReveal>

          {/* 右侧：技能展示 */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-6">技术栈</h3>
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">{skill.name}</span>
                    <span className="text-white/60">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              ))}

              {/* 技术关注点 */}
              <div className="pt-6">
                <h4 className="text-lg font-medium text-white mb-4">当前关注</h4>
                <div className="grid grid-cols-2 gap-3">
                  {techInterests.map((item, index) => (
                    <GlassCard key={index} className="p-3" hoverEffect={false}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{item.name}</div>
                          <div className="text-white/40 text-xs">{item.desc}</div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* 统计数据 */}
        <ScrollReveal delay={0.4}>
          <div className="grid grid-cols-3 gap-6 mt-16">
            {stats.map((stat, index) => (
              <GlassCard 
                key={index} 
                className="p-6 text-center"
                glowColor={`rgba(${index === 0 ? '102, 126, 234' : index === 1 ? '240, 147, 251' : '79, 172, 254'}, 0.3)`}
              >
                <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default About;
