import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, User, MessageSquare } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import GlassCard from '../components/GlassCard';
import { db } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await db.messages.create({
        name: formData.name,
        email: formData.email,
        content: formData.message
      });
      
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setLoading(false);
      setError(err.message || '提交失败，请稍后重试');
    }
  };

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Contact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            联系我
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            有任何问题或建议？欢迎留言交流
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <GlassCard className="p-8 md:p-12">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">发送成功！</h3>
                <p className="text-white/60">感谢您的留言，我会尽快回复</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">您的姓名</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                        placeholder="请输入姓名"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">邮箱地址</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">留言内容</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                      placeholder="请输入您想说的话..."
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      发送留言
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
