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

// @route   GET /api/dashboard/stock-trends
// @desc    Get stock movement trends for charts
// @access  Private
router.get('/stock-trends', protect, adminOrStaff, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1)); // Include today in the range
    startDate.setHours(0, 0, 0, 0);

    const movements = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          total: { $sum: '$quantity' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Generate all dates in range (including today) using LOCAL date strings
    const dateMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      // Use local date components to create YYYY-MM-DD string
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dateMap[dateStr] = { date: dateStr, stockIn: 0, stockOut: 0, adjustment: 0 };
    }

    // Fill in the data
    movements.forEach(m => {
      if (dateMap[m._id.date]) {
        if (m._id.type === 'stock_in') {
          dateMap[m._id.date].stockIn = m.total;
        } else if (m._id.type === 'stock_out') {
          dateMap[m._id.date].stockOut = m.total;
        } else if (m._id.type === 'adjustment') {
          dateMap[m._id.date].adjustment = Math.abs(m.total);
        }
      }
    });

    // Convert to array and format dates for display
    const result = Object.values(dateMap).map(item => ({
      ...item,
      date: new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/category-distribution
// @desc    Get product distribution by category
// @access  Private
router.get('/category-distribution', protect, adminOrStaff, async (req, res) => {
  try {
    const distribution = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          productCount: 1,
          totalValue: { $round: ['$totalValue', 2] },
          totalQuantity: 1,
          value: '$productCount'
        }
      },
      {
        $sort: { productCount: -1 }
      }
    ]);

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/movement-summary
// @desc    Get movement summary by type
// @access  Private
router.get('/movement-summary', protect, adminOrStaff, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1)); // Include today
    startDate.setHours(0, 0, 0, 0);

    const summary = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Format for pie chart
    const typeLabels = {
      stock_in: 'Stock In',
      stock_out: 'Stock Out',
      adjustment: 'Adjustments'
    };

    const result = summary.map(item => ({
      name: typeLabels[item._id] || item._id,
      value: item.count,
      quantity: item.totalQuantity
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;