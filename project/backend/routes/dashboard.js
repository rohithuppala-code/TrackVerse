import express from 'express';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import Category from '../models/Category.js';
import { protect, adminOrStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, adminOrStaff, async (req, res) => {
  try {
    // Get basic counts
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments({ isActive: true });
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).countDocuments();

    // Get total inventory value
    const products = await Product.find({ isActive: true });
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.quantity * product.unitPrice);
    }, 0);

    // Get recent stock movements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMovements = await StockMovement.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalProducts,
      totalCategories,
      lowStockProducts,
      totalValue,
      recentMovements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', protect, adminOrStaff, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    })
    .populate('category', 'name')
    .sort({ quantity: 1 })
    .limit(10);

    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/recent-activities
// @desc    Get recent stock activities
// @access  Private
router.get('/recent-activities', protect, adminOrStaff, async (req, res) => {
  try {
    const recentActivities = await StockMovement.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentActivities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;