import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Edit, Package, User, Clock } from 'lucide-react';

const typeConfig = {
  stock_in: {
    color: 'emerald',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: TrendingUp,
    label: 'Stock In',
    dotColor: 'bg-emerald-500',
  },
  stock_out: {
    color: 'red',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: TrendingDown,
    label: 'Stock Out',
    dotColor: 'bg-red-500',
  },
  adjustment: {
    color: 'blue',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: Edit,
    label: 'Adjustment',
    dotColor: 'bg-blue-500',
  },
};

export default function TimelineItem({ movement, index = 0, formatDate }) {
  const config = typeConfig[movement.type] || typeConfig.adjustment;
  const Icon = config.icon;

  const quantityDisplay =
    movement.type === 'stock_in'
      ? `+${movement.quantity}`
      : movement.type === 'stock_out'
      ? `-${movement.quantity}`
      : movement.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />

      {/* Timeline dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05 + 0.1, type: 'spring', stiffness: 500 }}
        className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full ${config.dotColor} -translate-x-1/2 shadow-[0_0_10px_currentColor]`}
        style={{ color: config.dotColor.replace('bg-', '') }}
      />

      {/* Content card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
              <Icon className={`h-4 w-4 ${config.text}`} />
            </div>
            <div>
              <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Package className="h-3 w-3 text-white/40" />
                <span className="text-white font-medium text-sm">
                  {movement.product?.name || 'Unknown Product'}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`text-lg font-bold ${
              movement.type === 'stock_in'
                ? 'text-emerald-400'
                : movement.type === 'stock_out'
                ? 'text-red-400'
                : 'text-blue-400'
            }`}
          >
            {quantityDisplay}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate ? formatDate(movement.createdAt) : new Date(movement.createdAt).toLocaleString()}
            </span>
            {movement.performedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {movement.performedBy.name}
              </span>
            )}
          </div>
          <span className="text-white/30">
            {movement.previousQuantity} → {movement.newQuantity}
          </span>
        </div>

        {movement.reason && (
          <p className="mt-2 text-sm text-white/60 bg-white/5 rounded-lg p-2">{movement.reason}</p>
        )}
      </div>
    </motion.div>
  );
}
