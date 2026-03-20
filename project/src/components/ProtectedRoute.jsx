import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX } from 'lucide-react';
import { Background3D } from './three';
import { GlassCard, GlassButton } from './ui';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Background3D />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
          />
          <p className="text-white/70 mt-4 text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4">
        <Background3D />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassCard className="p-8 text-center" blur="xl" glow hoverable={false}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              <ShieldX className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-white/60 mb-6">
              You don't have permission to access this page.
              <br />
              <span className="text-white/40 text-sm">Required role: {requiredRole}</span>
            </p>
            <GlassButton
              variant="secondary"
              onClick={() => window.history.back()}
              fullWidth
            >
              Go Back
            </GlassButton>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
