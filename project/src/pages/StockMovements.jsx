import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Plus,
  TrendingUp,
  TrendingDown,
  Edit3,
  X,
  Package,
  RefreshCw
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal, SkeletonTable } from '../components/ui';
import toast from 'react-hot-toast';

const StockMovements = () => {
  const {
    products,
    stockMovements,
    fetchProducts,
    fetchStockMovements,
    adjustStock,
    loading
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'stock_in',
    quantity: 0,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchStockMovements();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
      fetchStockMovements();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchProducts, fetchStockMovements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.type === 'stock_out') {
      const selectedProduct = products.find(p => p._id === formData.productId);
      if (selectedProduct && selectedProduct.quantity < formData.quantity) {
        setWarningMessage(`Stock adjustment not possible. Current stock: ${selectedProduct.quantity}, but trying to remove: ${formData.quantity}. Insufficient stock available.`);
        return;
      }
    }

    setWarningMessage('');

    const result = await adjustStock(formData);

    if (result.success) {
      setShowModal(false);
      resetForm();
      toast.success('Stock adjusted successfully!');
      fetchStockMovements();
      fetchProducts();
    } else {
      toast.error(result.message);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'stock_in',
      quantity: 0,
      reason: '',
      notes: ''
    });
  };

  const openCreateModal = () => {
    const validProducts = products.filter(product => product && product.name);
    if (validProducts.length === 0) {
      toast.error('No products available for stock adjustment. Please add products first.');
      return;
    }
    resetForm();
    setWarningMessage('');
    setShowModal(true);
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'stock_in':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'stock_out':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'adjustment':
        return <Edit3 className="h-5 w-5 text-blue-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getMovementBadge = (type) => {
    switch (type) {
      case 'stock_in':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'stock_out':
        return 'bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'adjustment':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validStockMovements = stockMovements
    .filter(movement => movement.product && movement.product.name)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayedMovements = validStockMovements.slice(0, displayCount);
  const hasMoreMovements = validStockMovements.length > displayCount;

  const loadMoreMovements = () => {
    setDisplayCount(prev => prev + 50);
  };

  const showAllMovements = () => {
    setDisplayCount(validStockMovements.length);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <GlassCard className="p-6 md:p-8" hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Stock Movements
              </h1>
              <p className="text-white/60">
                Track all inventory changes and adjustments ({validStockMovements.length} total movements)
              </p>
            </div>
            <GlassButton
              variant="primary"
              icon={Plus}
              onClick={openCreateModal}
            >
              Adjust Stock
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-0 overflow-hidden" hoverable={false}>
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={8} columns={7} />
            </div>
          ) : validStockMovements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Stock Movements</h3>
              <p className="text-white/50 text-center max-w-md mb-6">
                No stock movements have been recorded yet. Create your first stock adjustment to get started.
              </p>
              <GlassButton variant="primary" icon={Plus} onClick={openCreateModal}>
                Create First Adjustment
              </GlassButton>
            </motion.div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Stock Change
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Performed By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {displayedMovements.map((movement, index) => (
                        <motion.tr
                          key={movement._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                                <Package className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {movement.product?.name}
                                </div>
                                <div className="text-xs text-white/40">
                                  SKU: {movement.product?.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getMovementIcon(movement.type)}
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getMovementBadge(movement.type)}`}>
                                {movement.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${
                              movement.type === 'stock_out' ? 'text-red-400' : 'text-emerald-400'
                            }`}>
                              {movement.type === 'stock_out' ? '-' : '+'}{movement.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <span className="text-white/40">{movement.previousQuantity}</span>
                              <span className="text-purple-400">→</span>
                              <span className="text-white font-medium">{movement.newQuantity}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate text-sm text-white/70" title={movement.reason}>
                              {movement.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                            {formatDate(movement.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-white/70">
                              {movement.performedBy?.name}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {hasMoreMovements && (
                <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-white/50">
                    Showing {displayedMovements.length} of {validStockMovements.length} movements
                  </p>
                  <div className="flex gap-3">
                    <GlassButton variant="secondary" size="sm" onClick={loadMoreMovements}>
                      Load More
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm" onClick={showAllMovements}>
                      Show All
                    </GlassButton>
                  </div>
                </div>
              )}
            </>
          )}
        </GlassCard>
      </motion.div>

      <GlassModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setWarningMessage('');
        }}
        title="Stock Adjustment"
        size="md"
      >
        <AnimatePresence>
          {warningMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded-xl mb-6"
            >
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-300">Insufficient Stock</h4>
                  <p className="text-sm text-yellow-300/80 mt-1">{warningMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Product <span className="text-pink-400">*</span>
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="" className="bg-gray-800">Select Product</option>
              {products.filter(product => product && product.name).map((product) => (
                <option key={product._id} value={product._id} className="bg-gray-800">
                  {product.name} (Current: {product.quantity || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Movement Type <span className="text-pink-400">*</span>
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="stock_in" className="bg-gray-800">Stock In</option>
              <option value="stock_out" className="bg-gray-800">Stock Out</option>
              <option value="adjustment" className="bg-gray-800">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Quantity <span className="text-pink-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
              value={formData.quantity === 0 ? '' : formData.quantity}
              onChange={e => {
                let val = e.target.value.replace(/^0+(?=\d)/, '');
                setFormData({ ...formData, quantity: val === '' ? 0 : parseInt(val) || 0 });
              }}
            />
            {formData.type === 'adjustment' && (
              <p className="text-xs text-white/50 mt-2">
                For adjustments, enter the new total quantity
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Reason <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., New shipment, Sale, Damaged goods"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Additional notes (optional)"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
            >
              Adjust Stock
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default StockMovements;
