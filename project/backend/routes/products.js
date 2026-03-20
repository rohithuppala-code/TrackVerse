import express from 'express';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { protect, admin, adminOrStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', protect, adminOrStaff, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, lowStock } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, adminOrStaff, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('category', 'name');

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product and all associated stock movements
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // First, delete all stock movements associated with this product
    const deleteMovementsResult = await StockMovement.deleteMany({ product: productId });
    
    // Then, delete the product
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ 
      message: 'Product and associated stock movements deleted successfully',
      deletedMovements: deleteMovementsResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/bulk-adjust
// @desc    Bulk stock adjustment
// @access  Private (Admin only)
router.post('/bulk-adjust', protect, admin, async (req, res) => {
  try {
    const { adjustments } = req.body; // Array of { productId, quantity, type, reason }
    
    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ message: 'Adjustments array is required' });
    }

    const results = [];
    
    for (const adjustment of adjustments) {
      const { productId, quantity, type, reason } = adjustment;
      
      const product = await Product.findById(productId);
      if (!product) {
        results.push({ productId, success: false, message: 'Product not found' });
        continue;
      }

      const previousQuantity = product.quantity;
      let newQuantity = previousQuantity;

      switch (type) {
        case 'stock_in':
          newQuantity += quantity;
          break;
        case 'stock_out':
          newQuantity -= quantity;
          break;
        case 'adjustment':
          newQuantity = quantity;
          break;
        default:
          results.push({ productId, success: false, message: 'Invalid adjustment type' });
          continue;
      }

      if (newQuantity < 0) {
        results.push({ productId, success: false, message: 'Insufficient stock' });
        continue;
      }

      // Update product quantity
      product.quantity = newQuantity;
      await product.save();

      // Create stock movement record
      await StockMovement.create({
        product: productId,
        type,
        quantity: Math.abs(quantity),
        previousQuantity,
        newQuantity,
        reason,
        performedBy: req.user.id
      });

      results.push({ productId, success: true, newQuantity });
    }

    res.json({ 
      message: 'Bulk adjustment completed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/bulk-delete
// @desc    Bulk delete products
// @access  Private (Admin only)
router.post('/bulk-delete', protect, admin, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    // Delete all stock movements for these products
    const deleteMovementsResult = await StockMovement.deleteMany({
      product: { $in: productIds }
    });

    // Delete the products
    const deleteProductsResult = await Product.deleteMany({
      _id: { $in: productIds }
    });

    res.json({ 
      message: 'Bulk delete completed',
      deletedProducts: deleteProductsResult.deletedCount,
      deletedMovements: deleteMovementsResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;