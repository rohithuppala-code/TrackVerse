import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Layers,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  Sparkles
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal, AnimatedCard, AnimatedCounter } from '../components/ui';
import toast from 'react-hot-toast';

const Categories = () => {
  const { user } = useAuth();
  const {
    categories,
    products,
    fetchCategories,
    fetchProducts,
    createCategory,
    updateCategory,
    deleteCategory,
    loading
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCategories();
      fetchProducts();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchCategories, fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingCategory) {
      const result = await updateCategory(editingCategory._id, formData);
      if (result.success) {
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
        toast.success('Category updated successfully!');
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await createCategory(formData);
      if (result.success) {
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
        toast.success('Category created successfully!');
      } else {
        toast.error(result.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete ALL products associated with this category.')) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast.success('Category deleted successfully!');
      } else {
        toast.error(result.message);
      }
    }
  };

  // Calculate stats for each category
  const getCategoryStats = (categoryId) => {
    const categoryProducts = products.filter(p => p.category?._id === categoryId);
    const productCount = categoryProducts.length;
    const totalStock = categoryProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalValue = categoryProducts.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
    const lowStockCount = categoryProducts.filter(p => p.isLowStock).length;
    return { productCount, totalStock, totalValue, lowStockCount };
  };

  // Overall stats
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);

  const categoryColors = [
    { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'purple' },
    { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'blue' },
    { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'green' },
    { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'pink' },
    { gradient: 'from-rose-500 to-red-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'pink' },
    { gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'purple' },
  ];

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <GlassCard className="p-6 md:p-8" hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Categories</h1>
              <p className="text-white/60">
                Organize your products by category
                {categories.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 rounded-full text-xs text-emerald-300">
                    {categories.length} categories
                  </span>
                )}
              </p>
            </div>
            {user?.role === 'admin' && (
              <GlassButton variant="success" icon={Plus} onClick={openCreateModal}>
                Add Category
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Overview */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <GlassCard className="p-5" hoverable={false}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/20">
                <Layers className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Total Categories</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={totalCategories} duration={1} />
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" hoverable={false}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/20">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Total Products</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={totalProducts} duration={1} />
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" hoverable={false}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={totalInventoryValue} prefix="$" duration={1.5} />
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Search */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6" hoverable={false}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/10 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <AnimatePresence>
            {filteredCategories.map((category, index) => {
              const colorScheme = categoryColors[index % categoryColors.length];
              const stats = getCategoryStats(category._id);
              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <AnimatedCard className="p-6 h-full" glowColor={colorScheme.glow}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className={`p-4 rounded-2xl bg-gradient-to-br ${colorScheme.gradient} shadow-lg`}
                        >
                          <Tag className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{category.name}</h3>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(category.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(category)}
                            className="p-2 bg-white/5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(category._id)}
                            className="p-2 bg-white/5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {category.description && (
                      <p className="text-sm text-white/50 mb-5 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${colorScheme.bg} border ${colorScheme.border}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <Package className={`h-3 w-3 ${colorScheme.text}`} />
                          <span className="text-xs text-white/40">Products</span>
                        </div>
                        <p className="text-lg font-bold text-white">{stats.productCount}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${colorScheme.bg} border ${colorScheme.border}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className={`h-3 w-3 ${colorScheme.text}`} />
                          <span className="text-xs text-white/40">Stock</span>
                        </div>
                        <p className="text-lg font-bold text-white">{stats.totalStock}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${colorScheme.bg} border ${colorScheme.border}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className={`h-3 w-3 ${colorScheme.text}`} />
                          <span className="text-xs text-white/40">Value</span>
                        </div>
                        <p className="text-lg font-bold text-white">
                          ${stats.totalValue >= 1000
                            ? (stats.totalValue / 1000).toFixed(1) + 'k'
                            : stats.totalValue.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* Low Stock Warning */}
                    {stats.lowStockCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                      >
                        <Sparkles className="h-4 w-4 text-red-400" />
                        <span className="text-xs text-red-300">
                          {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} low on stock
                        </span>
                      </motion.div>
                    )}

                    {/* Empty State */}
                    {stats.productCount === 0 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-white/30">No products in this category yet</p>
                      </div>
                    )}
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <GlassCard className="p-12 text-center" hoverable={false}>
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                <Layers className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Categories Yet</h3>
              <p className="text-white/50 mb-6 max-w-md mx-auto">
                Categories help you organize your products. Create your first category to get started.
              </p>
              {user?.role === 'admin' && (
                <GlassButton variant="primary" icon={Plus} onClick={openCreateModal} size="lg">
                  Create Your First Category
                </GlassButton>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* No Search Results */}
        {!loading && categories.length > 0 && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <GlassCard className="p-12 text-center" hoverable={false}>
              <Search className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
              <p className="text-white/50">Try a different search term</p>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Category Name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Electronics, Clothing, Food"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe what products belong in this category..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="success">
              {editingCategory ? 'Update' : 'Create'} Category
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default Categories;
