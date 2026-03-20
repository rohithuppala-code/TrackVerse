import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCard({
  children,
  className = '',
  glowColor = 'purple',
  enableTilt = true,
  enableGlow = true,
  onClick,
}) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const glowColors = {
    purple: 'rgba(139, 92, 246, 0.4)',
    pink: 'rgba(236, 72, 153, 0.4)',
    blue: 'rgba(59, 130, 246, 0.4)',
    cyan: 'rgba(6, 182, 212, 0.4)',
    green: 'rgba(16, 185, 129, 0.4)',
  };

  const handleMouseMove = (e) => {
    if (!enableTilt || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -10;
    const rotateYValue = (mouseX / (rect.width / 2)) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative
        bg-gradient-to-br from-white/15 to-white/5
        backdrop-blur-xl
        border border-white/20
        rounded-2xl
        overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {enableGlow && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            boxShadow: `0 0 40px ${glowColors[glowColor]}, inset 0 0 40px ${glowColors[glowColor]}`,
          }}
        />
      )}

      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColors[glowColor]}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
