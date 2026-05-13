import { motion } from 'framer-motion';

const GradientBorder = ({ 
  children, 
  className = '',
  borderWidth = 2,
  borderRadius = '16px',
  gradient = 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #ff0080)'
}) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ borderRadius }}
    >
      {/* 渐变边框 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: gradient,
          backgroundSize: '300% 300%',
          borderRadius: 'inherit',
          padding: borderWidth,
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div 
          className="w-full h-full bg-[#0a0a0f]"
          style={{ borderRadius: `calc(${borderRadius} - ${borderWidth}px)` }}
        />
      </motion.div>
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GradientBorder;
