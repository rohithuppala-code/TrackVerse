import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Plus,
  TrendingUp,
  TrendingDown,
  Edit3,
  Package,
  BarChart3,
  Clock,
  List,
  Filter
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal, SkeletonTable, TimelineItem } from '../components/ui';
import { GlassBarChart, GlassPieChart } from '../components/charts';
import toast from 'react-hot-toast';

const StockMovements = () => {
  const {
    products,
    stockMovements,
    fetchProducts,
    fetchStockMovements,
    adjustStock,
    fetchStockTrends,
    fetchMovementSummary,
    loading
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  const [viewMode, setViewMode] = useState('table');
  const [filterType, setFilterType] = useState('all');
  const [stockTrends, setStockTrends] = useState([]);
  const [movementSummary, setMovementSummary] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [lastChartUpdate, setLastChartUpdate] = useState(Date.now());
  const [formData, setFormData] = useState({
    productId: '',
    type: 'stock_in',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const loadChartData = async () => {
    setChartsLoading(true);
    try {
      const [trends, summary] = await Promise.all([
        fetchStockTrends(7),
        fetchMovementSummary(7)
      ]);
      setStockTrends(trends || []);
      setMovementSummary(summary || []);
      setLastChartUpdate(Date.now());
    } catch (error) {
      console.error('Error loading chart data:', error);
      setStockTrends([]);
      setMovementSummary([]);
    } finally {
      setChartsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts({ limit: 'all' });
    fetchStockMovements({ limit: 'all' });
    loadChartData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts({ limit: 'all' });
      fetchStockMovements({ limit: 'all' });
      loadChartData();
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
      toast.success('Stock adjusted successfully!');
      loadChartData().catch(console.error);
      setShowModal(false);
      resetForm();
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
    .filter(movement => filterType === 'all' || movement.type === filterType)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayedMovements = validStockMovements.slice(0, displayCount);
  const hasMoreMovements = validStockMovements.length > displayCount;

  const loadMoreMovements = () => {
    setDisplayCount(prev => prev + 50);
  };

  const showAllMovements = () => {
    setDisplayCount(validStockMovements.length);
  };

  const filterTabs = [
    { id: 'all', label: 'All', count: stockMovements.filter(m => m.product?.name).length },
    { id: 'stock_in', label: 'Stock In', icon: TrendingUp, color: 'emerald' },
    { id: 'stock_out', label: 'Stock Out', icon: TrendingDown, color: 'red' },
    { id: 'adjustment', label: 'Adjustments', icon: Edit3, color: 'blue' },
  ];

  return (
    <div className="w-full pb-8">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <GlassCard className="p-6 md:p-8" hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Stock Movements
              </h1>
              <p className="text-white/60">
                Track all inventory changes and adjustments
                <span className="ml-2 px-2 py-0.5 bg-purple-500/20 rounded-full text-xs text-purple-300">
                  {validStockMovements.length} movements
                </span>
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

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
      >
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden" hoverable={false}>
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Movement History</h2>
              <p className="text-sm text-white/50">Last 7 days</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="p-4" style={{ minHeight: '240px' }}>
            {chartsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stockTrends.length > 0 ? (
              <GlassBarChart
                key={`bar-trends-${lastChartUpdate}`}
                data={stockTrends}
                bars={[
                  { dataKey: 'stockIn', color: '#10B981', name: 'Stock In' },
                  { dataKey: 'stockOut', color: '#EF4444', name: 'Stock Out' },
                  { dataKey: 'adjustment', color: '#3B82F6', name: 'Adjustment' }
                ]}
                xAxisKey="date"
                height={200}
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-white/50">
                No movement data available
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden" hoverable={false}>
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">By Type</h2>
              <p className="text-sm text-white/50">Distribution</p>
            </div>
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Activity className="h-4 w-4 text-pink-400" />
            </div>
          </div>
          <div className="p-4" style={{ minHeight: '240px' }}>
            {chartsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : movementSummary.length > 0 ? (
              <GlassPieChart
                key={`pie-summary-${lastChartUpdate}`}
                data={movementSummary}
                dataKey="value"
                nameKey="name"
                height={200}
                showLegend={false}
                colors={['#10B981', '#EF4444', '#3B82F6']}
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-white/50">
                No data available
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filter & View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <GlassCard className="p-4" hoverable={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter className="h-4 w-4 text-white/40 flex-shrink-0" />
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filterType === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                      transition-all duration-200
                      ${isActive
                        ? tab.color === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tab.color === 'red'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : tab.color === 'blue'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                <motion.button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'table' ? 'bg-purple-500/20 text-purple-300' : 'text-white/50 hover:text-white/70'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Table</span>
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'timeline' ? 'bg-purple-500/20 text-purple-300' : 'text-white/50 hover:text-white/70'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </motion.button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Movements List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <GlassCard className="p-6" hoverable={false}>
            <SkeletonTable rows={8} columns={7} />
          </GlassCard>
        ) : validStockMovements.length === 0 ? (
          <GlassCard className="p-12 text-center" hoverable={false}>
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Stock Movements</h3>
            <p className="text-white/50 mb-6">
              {filterType !== 'all'
                ? 'No movements match the selected filter'
                : 'No stock movements have been recorded yet'}
            </p>
            {filterType === 'all' && (
              <GlassButton variant="primary" icon={Plus} onClick={openCreateModal}>
                Create First Adjustment
              </GlassButton>
            )}
          </GlassCard>
        ) : viewMode === 'timeline' ? (
          <GlassCard className="p-6" hoverable={false}>
            <div className="relative">
              {displayedMovements.map((movement, index) => (
                <TimelineItem
                  key={movement._id}
                  movement={movement}
                  index={index}
                  formatDate={formatDate}
                />
              ))}
            </div>
            {hasMoreMovements && (
              <div className="mt-6 flex justify-center gap-3">
                <GlassButton variant="secondary" size="sm" onClick={loadMoreMovements}>
                  Load More
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={showAllMovements}>
                  Show All ({validStockMovements.length})
                </GlassButton>
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-0 overflow-hidden" hoverable={false}>
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
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div
                              className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-3"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Package className="h-5 w-5 text-purple-400" />
                            </motion.div>
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
                          <span className={`text-lg font-bold ${
                            movement.type === 'stock_out' ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {movement.type === 'stock_out' ? '-' : '+'}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-white/40 bg-white/5 px-2 py-1 rounded">{movement.previousQuantity}</span>
                            <span className="text-purple-400">→</span>
                            <span className="text-white font-medium bg-purple-500/20 px-2 py-1 rounded">{movement.newQuantity}</span>
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
                          <span className="text-sm text-white/70 px-2 py-1 bg-white/5 rounded-lg">
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
          </GlassCard>
        )}
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
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'stock_in', label: 'Stock In', icon: TrendingUp, color: 'emerald' },
                { value: 'stock_out', label: 'Stock Out', icon: TrendingDown, color: 'red' },
                { value: 'adjustment', label: 'Adjust', icon: Edit3, color: 'blue' },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = formData.type === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value })}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                      ${isSelected
                        ? option.color === 'emerald'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : option.color === 'red'
                          ? 'bg-red-500/20 border-red-500/50 text-red-300'
                          : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
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
    </div>
  );
};

export default StockMovements;
