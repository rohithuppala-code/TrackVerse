import { motion } from 'framer-motion';

const shimmerAnimation = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: {
    repeat: Infinity,
    duration: 1.5,
    ease: 'linear',
  },
};

function SkeletonBase({ className = '', children }) {
  return (
    <div className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={shimmerAnimation.initial}
        animate={shimmerAnimation.animate}
        transition={shimmerAnimation.transition}
      />
      {children}
    </div>
  );
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return <SkeletonBase className={`${sizes[size]} rounded-full ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white/5 rounded-2xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1">
          <SkeletonBase className="h-4 w-1/2 mb-2" />
          <SkeletonBase className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonStatCard({ className = '' }) {
  return (
    <div className={`bg-white/5 rounded-2xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <SkeletonBase className="w-10 h-10 rounded-lg" />
        <SkeletonBase className="h-3 w-16" />
      </div>
      <SkeletonBase className="h-8 w-24 mb-2" />
      <SkeletonBase className="h-3 w-32" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 5, className = '' }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBase className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, columns = 5, className = '' }) {
  return (
    <div className={`bg-white/5 rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <SkeletonBase className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SkeletonLoader({ variant = 'text', ...props }) {
  const variants = {
    text: SkeletonText,
    avatar: SkeletonAvatar,
    card: SkeletonCard,
    'stat-card': SkeletonStatCard,
    'table-row': SkeletonTableRow,
    table: SkeletonTable,
  };

  const Component = variants[variant] || SkeletonText;
  return <Component {...props} />;
}
