import express from 'express';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { protect, adminOrStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/stock/adjust
// @desc    Adjust stock quantity
// @access  Private
router.post('/adjust', protect, adminOrStaff, async (req, res) => {
  try {
    const { productId, type, quantity, reason, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousQuantity = product.quantity;
    let newQuantity;

    switch (type) {
      case 'stock_in':
        newQuantity = previousQuantity + Math.abs(quantity);
        break;
      case 'stock_out':
        newQuantity = Math.max(0, previousQuantity - Math.abs(quantity));
        break;
      case 'adjustment':
        newQuantity = Math.max(0, quantity);
        break;
      default:
        return res.status(400).json({ message: 'Invalid adjustment type' });
    }

    // Update product quantity
    product.quantity = newQuantity;
    await product.save();

    // Create stock movement record
    const stockMovement = new StockMovement({
      product: productId,
      type,
      quantity: Math.abs(quantity),
      previousQuantity,
      newQuantity,
      reason,
      notes,
      performedBy: req.user._id
    });

    await stockMovement.save();

    const populatedMovement = await StockMovement.findById(stockMovement._id)
      .populate('product', 'name sku')
      .populate('performedBy', 'name');

    res.status(201).json({
      movement: populatedMovement,
      product: await Product.findById(productId).populate('category'),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/stock/movements
// @desc    Get stock movements
// @access  Private
router.get('/movements', protect, adminOrStaff, async (req, res) => {
  try {
    const { page = 1, limit = 10, productId } = req.query;
    
    let query = {};
    if (productId) {
      query.product = productId;
    }

    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await StockMovement.countDocuments(query);

    res.json({
      movements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;