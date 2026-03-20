import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import StockMovements from './pages/StockMovements';
import './App.css';

const Background3D = lazy(() => import('./components/three/Background3D').then(module => ({ default: module.default })));

function GradientFallback() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
  );
}

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col min-h-screen w-full relative">
                      <Suspense fallback={<GradientFallback />}>
                        <Background3D />
                      </Suspense>

                      <div className="relative z-10 flex flex-col min-h-screen w-full">
                        <Navbar />
                        <main className="flex-1 w-full">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/stock-movements" element={<StockMovements />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
