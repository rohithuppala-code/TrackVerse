import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  X
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal, SkeletonTable } from '../components/ui';
import toast from 'react-hot-toast';

const Products = () => {
  const { user } = useAuth();
  const {
    products,
    categories,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    loading
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    quantity: '',
    lowStockThreshold: '',
    unitPrice: '',
    location: '',
    barcode: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showModal) return;
    const interval = setInterval(() => {
      fetchProducts();
      fetchCategories();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchProducts, fetchCategories, showModal]);

  const handleSearch = () => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterCategory) params.category = filterCategory;
    if (showLowStock) params.lowStock = 'true';
    fetchProducts(params);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filterCategory, showLowStock]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = editingProduct
      ? await updateProduct(editingProduct._id, formData)
      : await createProduct(formData);

    if (result.success) {
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
      toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
    } else {
      toast.error(result.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category._id,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      unitPrice: product.unitPrice,
      location: product.location || '',
      barcode: product.barcode || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        fetchProducts();
        toast.success('Product deleted successfully!');
      } else {
        toast.error(result.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      quantity: '',
      lowStockThreshold: '',
      unitPrice: '',
      location: '',
      barcode: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <GlassCard className="p-6 md:p-8" hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Products</h1>
              <p className="text-white/60">Manage your product inventory</p>
            </div>
            {user?.role === 'admin' && (
              <GlassButton variant="primary" icon={Plus} onClick={openCreateModal}>
                Add Product
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-4 md:p-6" hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:shadow-neon-purple transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 transition-all"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="" className="bg-gray-800">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id} className="bg-gray-800">
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-white/70">Low Stock Only</span>
              </label>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-0 overflow-hidden" hoverable={false}>
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={8} columns={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                              <Package className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{product.name}</span>
                                {product.isLowStock && (
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                              <span className="text-xs text-white/40">SKU: {product.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">{product.category?.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                            product.isLowStock
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          ${product.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setViewingProduct(product)}
                              className="p-2 bg-white/10 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            {user?.role === 'admin' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(product)}
                                  className="p-2 bg-white/10 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(product._id)}
                                  className="p-2 bg-white/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>

      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Product Name <span className="text-pink-400">*</span></label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">SKU <span className="text-pink-400">*</span></label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Category <span className="text-pink-400">*</span></label>
            <select
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 transition-all"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" className="bg-gray-800">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id} className="bg-gray-800">{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Quantity <span className="text-pink-400">*</span></label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Low Stock Threshold <span className="text-pink-400">*</span></label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Unit Price <span className="text-pink-400">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Barcode</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary">
              {editingProduct ? 'Update' : 'Create'} Product
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      <GlassModal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        title="Product Details"
        size="lg"
      >
        {viewingProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Product Name</label>
                <p className="text-lg font-medium text-white">{viewingProduct.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">SKU</label>
                <p className="text-lg font-medium text-white">{viewingProduct.sku}</p>
              </div>
            </div>

            {viewingProduct.description && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Description</label>
                <p className="text-white/80">{viewingProduct.description}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Category</label>
              <p className="text-lg font-medium text-white">{viewingProduct.category?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-xs font-medium text-white/50 mb-1">Current Stock</label>
                <p className={`text-2xl font-bold ${viewingProduct.isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                  {viewingProduct.quantity} <span className="text-sm font-normal text-white/50">units</span>
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-xs font-medium text-white/50 mb-1">Low Stock Threshold</label>
                <p className="text-2xl font-bold text-white">{viewingProduct.lowStockThreshold}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-xs font-medium text-white/50 mb-1">Unit Price</label>
                <p className="text-2xl font-bold text-white">${viewingProduct.unitPrice.toFixed(2)}</p>
              </div>
            </div>

            {(viewingProduct.location || viewingProduct.barcode) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewingProduct.location && (
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Location</label>
                    <p className="text-white">{viewingProduct.location}</p>
                  </div>
                )}
                {viewingProduct.barcode && (
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Barcode</label>
                    <p className="text-white font-mono">{viewingProduct.barcode}</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Created</label>
                  <p className="text-white/70">{new Date(viewingProduct.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Last Updated</label>
                  <p className="text-white/70">{new Date(viewingProduct.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default Products;
