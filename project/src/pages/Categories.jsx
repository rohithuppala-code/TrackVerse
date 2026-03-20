import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Layers
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal, AnimatedCard } from '../components/ui';
import toast from 'react-hot-toast';

const Categories = () => {
  const { user } = useAuth();
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loading
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCategories();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchCategories]);

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

  const categoryColors = [
    { gradient: 'from-purple-500 to-pink-500', glow: 'purple' },
    { gradient: 'from-blue-500 to-cyan-500', glow: 'blue' },
    { gradient: 'from-emerald-500 to-green-500', glow: 'green' },
    { gradient: 'from-amber-500 to-orange-500', glow: 'pink' },
    { gradient: 'from-rose-500 to-red-500', glow: 'pink' },
    { gradient: 'from-indigo-500 to-purple-500', glow: 'purple' },
  ];

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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Categories</h1>
              <p className="text-white/60">Organize your products by category</p>
            </div>
            {user?.role === 'admin' && (
              <GlassButton variant="success" icon={Plus} onClick={openCreateModal}>
                Add Category
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="w-12 h-12 bg-white/10 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <AnimatePresence>
            {categories.map((category, index) => {
              const colorScheme = categoryColors[index % categoryColors.length];
              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AnimatedCard className="p-6" glowColor={colorScheme.glow}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`p-3 rounded-xl bg-gradient-to-br ${colorScheme.gradient} shadow-lg`}
                        >
                          <Tag className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white truncate">{category.name}</h3>
                          <p className="text-xs text-white/40 mt-1">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-2 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(category)}
                            className="p-2 bg-white/10 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(category._id)}
                            className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {category.description && (
                      <p className="mt-4 text-sm text-white/60 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <GlassCard className="p-12 text-center" hoverable={false}>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="h-10 w-10 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Categories Yet</h3>
              <p className="text-white/50 mb-6">Create your first category to organize products</p>
              {user?.role === 'admin' && (
                <GlassButton variant="primary" icon={Plus} onClick={openCreateModal}>
                  Create Category
                </GlassButton>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>

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
              placeholder="Enter category name"
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
              placeholder="Enter description (optional)"
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
