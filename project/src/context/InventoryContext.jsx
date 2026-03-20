import { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

const InventoryContext = createContext();

const initialState = {
  products: [],
  categories: [],
  stockMovements: [],
  dashboardStats: {},
  loading: false,
  error: null
};

const inventoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, loading: false };
    case 'SET_STOCK_MOVEMENTS':
      return { ...state, stockMovements: action.payload, loading: false };
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload, loading: false };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product._id !== action.payload)
      };
    default:
      return state;
  }
};

export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  const API_BASE = '/api';

  // Products
  const fetchProducts = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_BASE}/products?${queryString}`);
      dispatch({ type: 'SET_PRODUCTS', payload: res.data.products });
      return res.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message });
    }
  };

  const createProduct = async (productData) => {
    try {
      const res = await axios.post(`${API_BASE}/products`, productData);
      dispatch({ type: 'ADD_PRODUCT', payload: res.data });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const res = await axios.put(`${API_BASE}/products/${id}`, productData);
      dispatch({ type: 'UPDATE_PRODUCT', payload: res.data });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  // Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      dispatch({ type: 'SET_CATEGORIES', payload: res.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message });
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const res = await axios.post(`${API_BASE}/categories`, categoryData);
      await fetchCategories(); // Refresh list
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const res = await axios.put(`${API_BASE}/categories/${id}`, categoryData);
      await fetchCategories(); // Refresh list
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      await fetchCategories(); // Refresh list
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  // Stock Movements
  const fetchStockMovements = async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_BASE}/stock/movements?${queryString}`);
      dispatch({ type: 'SET_STOCK_MOVEMENTS', payload: res.data.movements });
      return res.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message });
    }
  };

  const adjustStock = async (adjustmentData) => {
    try {
      const res = await axios.post(`${API_BASE}/stock/adjust`, adjustmentData);
      // Refresh products and movements
      await fetchProducts();
      await fetchStockMovements();
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  // Dashboard
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/stats`);
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: res.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message });
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/low-stock`);
      return res.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/recent-activities`);
      return res.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message });
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        fetchStockMovements,
        adjustStock,
        fetchDashboardStats,
        fetchLowStockProducts,
        fetchRecentActivities
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};