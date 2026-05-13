import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '',
  hoverEffect = true,
  glowColor = 'rgba(102, 126, 234, 0.3)'
}) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        ${hoverEffect ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
      }}
      whileHover={hoverEffect ? {
        y: -8,
        boxShadow: `0 20px 60px ${glowColor}`,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      } : {}}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {/* 内部光泽 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, transparent 100%)',
        }}
      />
      
      {/* 角落装饰 */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            background: 'linear-gradient(225deg, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
