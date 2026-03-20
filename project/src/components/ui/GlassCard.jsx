import { motion } from 'framer-motion';

const blurVariants = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
};

const paddingVariants = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export default function GlassCard({
  children,
  className = '',
  blur = 'lg',
  padding = 'lg',
  glow = false,
  hoverable = true,
  animate = true,
  delay = 0,
  onClick,
}) {
  const baseClasses = `
    bg-white/10
    ${blurVariants[blur]}
    border border-white/20
    rounded-2xl
    shadow-glass
    ${paddingVariants[padding]}
    ${glow ? 'shadow-neon-purple' : ''}
    ${hoverable ? 'hover:bg-white/15 hover:shadow-glass-lg hover:border-white/30' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    transition-all duration-300
    ${className}
  `;

  if (!animate) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hoverable ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
