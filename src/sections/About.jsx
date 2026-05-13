import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, Code, Coffee, Heart } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import GradientBorder from '../components/GradientBorder';

const About = () => {
  const stats = [
    { number: '3+', label: '年开发经验', icon: Code },
    { number: '50+', label: '完成项目', icon: Coffee },
    { number: '100%', label: '热情投入', icon: Heart },
  ];

  const skills = [
    { name: 'React/Vue', level: 90, color: '#61dafb' },
    { name: 'TypeScript', level: 85, color: '#3178c6' },
    { name: 'Node.js', level: 80, color: '#339933' },
    { name: 'UI/UX设计', level: 85, color: '#ff6b6b' },
    { name: 'Three.js', level: 70, color: '#000000' },
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
            一个热爱技术与设计的创造者，致力于用代码实现创意，用设计传递价值
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧：个人信息 */}
          <ScrollReveal direction="left">
            <GradientBorder className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">张三</h3>
                    <p className="text-white/60">全栈开发工程师 / 创意设计师</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: MapPin, text: '中国 · 北京' },
                    { icon: Mail, text: 'your.email@example.com' },
                    { icon: Calendar, text: '3年+ 开发经验' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/70">
                      <item.icon className="w-5 h-5 text-purple-400" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-white/60 leading-relaxed">
                  我是一名充满激情的前端开发者，专注于创造美观且功能强大的Web应用。
                  我相信好的设计不仅仅是外表，更是用户体验的核心。
                  在工作之余，我喜欢探索新技术，参与开源项目，以及分享我的学习心得。
                </p>
              </div>
            </GradientBorder>
          </ScrollReveal>

          {/* 右侧：技能展示 */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-6">技能专长</h3>
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
