import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { GlassCard, AnimatedCard, SkeletonStatCard } from '../components/ui';

const Dashboard = () => {
  const {
    dashboardStats,
    fetchDashboardStats,
    fetchLowStockProducts,
    fetchRecentActivities
  } = useInventory();

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchDashboardStats();
        const lowStock = await fetchLowStockProducts();
        const activities = await fetchRecentActivities();

        setLowStockProducts(lowStock || []);
        setRecentActivities(activities || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchDashboardStats();
        const lowStock = await fetchLowStockProducts();
        const activities = await fetchRecentActivities();

        setLowStockProducts(lowStock || []);
        setRecentActivities(activities || []);
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardStats, fetchLowStockProducts, fetchRecentActivities]);

  const stats = [
    {
      name: 'Total Products',
      value: dashboardStats.totalProducts || 0,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-neon-blue'
    },
    {
      name: 'Categories',
      value: dashboardStats.totalCategories || 0,
      icon: Layers,
      gradient: 'from-emerald-500 to-green-500',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]'
    },
    {
      name: 'Low Stock Items',
      value: dashboardStats.lowStockProducts || 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]'
    },
    {
      name: 'Total Value',
      value: `$${(dashboardStats.totalValue || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-yellow-500',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]'
    },
    {
      name: 'Recent Movements',
      value: dashboardStats.recentMovements || 0,
      icon: Activity,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-neon-purple'
    }
  ];

  const getMovementIcon = (type) => {
    switch (type) {
      case 'stock_in':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'stock_out':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'adjustment':
        return <Activity className="h-4 w-4 text-blue-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <GlassCard className="p-8" hoverable={false}>
            <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-white/10 rounded-lg animate-pulse mt-2" />
          </GlassCard>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <GlassCard className="p-6 md:p-8" hoverable={false}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-white/60">
            Monitor your inventory performance and key metrics
          </p>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AnimatedCard
                className="p-5"
                glowColor={stat.name === 'Low Stock Items' ? 'pink' : 'purple'}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.glow}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40" />
                </div>
                <motion.p
                  className="text-2xl md:text-3xl font-bold text-white mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-white/60">{stat.name}</p>
              </AnimatedCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-0 overflow-hidden" hoverable={false}>
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Low Stock Alert</h2>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="p-4">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/50">No low stock items</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {lowStockProducts.slice(0, 5).map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20"
                      >
                        <div>
                          <p className="font-medium text-white text-sm">{product.name}</p>
                          <p className="text-xs text-white/50">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-400">
                            {product.quantity} left
                          </p>
                          <p className="text-xs text-white/40">
                            Min: {product.lowStockThreshold}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {lowStockProducts.length > 5 && (
                    <button
                      onClick={() => navigate('/products')}
                      className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View all {lowStockProducts.length} items
                    </button>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-0 overflow-hidden" hoverable={false}>
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Activities</h2>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="p-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/50">No recent activities</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {recentActivities
                      .filter(activity => activity.product && activity.product.name)
                      .slice(0, 5)
                      .map((activity, index) => (
                        <motion.div
                          key={activity._id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="p-2 bg-white/10 rounded-lg">
                            {getMovementIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {activity.product?.name}
                            </p>
                            <p className="text-xs text-white/50 truncate">
                              {activity.type.replace('_', ' ').toUpperCase()} • {activity.reason}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              activity.type === 'stock_out' ? 'text-red-400' : 'text-emerald-400'
                            }`}>
                              {activity.type === 'stock_out' ? '-' : '+'}{activity.quantity}
                            </p>
                            <p className="text-xs text-white/40">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                  {recentActivities.length > 5 && (
                    <button
                      onClick={() => navigate('/stock-movements')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View all activities
                    </button>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
