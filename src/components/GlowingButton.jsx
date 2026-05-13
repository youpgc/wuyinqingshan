import { motion } from 'framer-motion';

const GlowingButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  className = '',
  href = null
}) => {
  const baseStyles = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 0 30px rgba(102, 126, 234, 0.5)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      boxShadow: '0 0 30px rgba(240, 147, 251, 0.5)',
    },
    accent: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      boxShadow: '0 0 30px rgba(79, 172, 254, 0.5)',
    },
    outline: {
      background: 'transparent',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
    }
  };

  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-full font-medium
        text-white transition-all duration-300
        ${sizeStyles[size]}
        ${className}
      `}
      style={baseStyles[variant]}
      whileHover={{ 
        scale: 1.05,
        boxShadow: variant === 'outline' 
          ? '0 0 30px rgba(255, 255, 255, 0.3)'
          : `${baseStyles[variant].boxShadow.replace('0.5', '0.8')}`,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* 光泽效果 */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        style={{ 
          backgroundSize: '200% 100%',
        }}
        whileHover={{
          opacity: 0.2,
          x: ['0%', '100%'],
        }}
        transition={{ duration: 0.6 }}
      />
      
      {/* 按钮文字 */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </Component>
  );
};

export default GlowingButton;
