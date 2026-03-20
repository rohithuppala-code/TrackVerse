import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  BarChart3,
  Activity,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Layers
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['admin', 'staff'] },
      { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'staff'] },
      { name: 'Categories', href: '/categories', icon: Layers, roles: ['admin', 'staff'] },
      { name: 'Stock Movements', href: '/stock-movements', icon: Activity, roles: ['admin', 'staff'] }
    ];

    return baseItems.filter(item => item.roles.includes(user?.role));
  };

  const navigation = getNavigationItems();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'staff':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-glass"
    >
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-neon-purple"
              >
                <Package className="h-6 w-6 text-white" />
              </motion.div>
              <span className="ml-3 text-xl font-bold text-white hidden sm:block">
                TrackVerse
              </span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative px-4 py-2 rounded-xl group"
                  >
                    <span className={`
                      flex items-center gap-2 text-sm font-medium transition-colors
                      ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}
                    `}>
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(user?.role)}`}>
                  {user?.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {user?.role}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium text-sm hover:from-red-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-red-500/25"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navigation.length * 0.1 }}
                className="pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(user?.role)}`}>
                      {user?.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
