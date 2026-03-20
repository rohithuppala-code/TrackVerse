import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';

const statusConfig = {
  'in-stock': {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    icon: CheckCircle,
    label: 'In Stock',
  },
  'low-stock': {
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    icon: AlertTriangle,
    label: 'Low Stock',
  },
  'out-of-stock': {
    bg: 'bg-red-500/20',
    text: 'text-red-300',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    icon: XCircle,
    label: 'Out of Stock',
  },
  'stock-in': {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    icon: Package,
    label: 'Stock In',
  },
  'stock-out': {
    bg: 'bg-red-500/20',
    text: 'text-red-300',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    icon: Package,
    label: 'Stock Out',
  },
  adjustment: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    icon: Package,
    label: 'Adjustment',
  },
};

export default function StatusBadge({
  status,
  showIcon = true,
  animate = true,
  size = 'md',
  customLabel = null,
}) {
  const config = statusConfig[status] || statusConfig['in-stock'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <motion.span
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${sizeClasses[size]}
        ${config.bg} ${config.text} ${config.border} ${config.glow}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {customLabel || config.label}
    </motion.span>
  );
}

export function getStockStatus(product) {
  if (product.quantity === 0) return 'out-of-stock';
  if (product.quantity <= product.lowStockThreshold) return 'low-stock';
  return 'in-stock';
}
