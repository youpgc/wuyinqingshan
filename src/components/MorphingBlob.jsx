import { motion } from 'framer-motion';

const MorphingBlob = ({ 
  className = '', 
  colors = ['#667eea', '#764ba2', '#f093fb'],
  size = 400,
  duration = 20
}) => {
  return (
    <div 
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        filter: 'blur(60px)',
        opacity: 0.6,
      }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${colors.join(', ')})`,
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        }}
        animate={{
          borderRadius: [
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '30% 60% 70% 40% / 50% 60% 30% 60%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
          ],
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default MorphingBlob;
