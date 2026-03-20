import { motion } from 'framer-motion';
import { Package, Eye, Edit, Trash2, MapPin, Barcode } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import StatusBadge, { getStockStatus } from './StatusBadge';

export default function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  isAdmin = false,
  index = 0,
}) {
  const status = getStockStatus(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <AnimatedCard
        className="p-5 h-full"
        glowColor={status === 'low-stock' ? 'pink' : status === 'out-of-stock' ? 'pink' : 'purple'}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Package className="h-6 w-6 text-purple-400" />
          </div>
          <StatusBadge status={status} />
        </div>

        <h3 className="text-lg font-bold text-white mb-1 truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-white/40 mb-3">SKU: {product.sku}</p>

        {product.category && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-lg mb-3">
            <span className="text-xs text-purple-300">{product.category.name}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/50 mb-1">Stock</p>
            <p
              className={`text-xl font-bold ${
                status === 'out-of-stock'
                  ? 'text-red-400'
                  : status === 'low-stock'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {product.quantity}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/50 mb-1">Price</p>
            <p className="text-xl font-bold text-white">${product.unitPrice?.toFixed(2)}</p>
          </div>
        </div>

        {(product.location || product.barcode) && (
          <div className="flex flex-wrap gap-2 mb-4 text-xs text-white/40">
            {product.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {product.location}
              </span>
            )}
            {product.barcode && (
              <span className="flex items-center gap-1">
                <Barcode className="w-3 h-3" />
                {product.barcode}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(product)}
            className="flex-1 p-2 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">View</span>
          </motion.button>
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(product)}
                className="p-2 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(product._id)}
                className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </>
          )}
        </div>
      </AnimatedCard>
    </motion.div>
  );
}
