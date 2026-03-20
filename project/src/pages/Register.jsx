import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Lock, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassInput, GlassButton, GlassSelect } from '../components/ui';
import { Background3D } from '../components/three';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff', // Default to staff, but user can change
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name,
        email,
        password,
        role: formData.role, // Use the selected role
      });

      if (result.success) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'staff', label: 'Staff Member' },
    { value: 'admin', label: 'Administrator' },
  ];

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      <Background3D />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <GlassCard className="p-8" blur="xl" glow hoverable={false}>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-neon-purple"
            >
              <UserCircle className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-white/60">Join TrackVerse Inventory System</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <GlassInput
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
              autoComplete="name"
            />

            <GlassInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
              autoComplete="email"
            />

            <GlassInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              autoComplete="new-password"
            />

            <GlassInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              required
              autoComplete="new-password"
            />

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'staff' })}
                  className={`
                    relative p-4 rounded-xl border transition-all duration-300
                    ${role === 'staff'
                      ? 'bg-purple-500/30 border-purple-400/50 shadow-neon-purple'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className={`h-6 w-6 mx-auto mb-2 ${role === 'staff' ? 'text-purple-300' : 'text-white/60'}`} />
                  <span className={`block text-sm font-medium ${role === 'staff' ? 'text-white' : 'text-white/60'}`}>
                    Staff
                  </span>
                  <span className={`block text-xs mt-1 ${role === 'staff' ? 'text-purple-200' : 'text-white/40'}`}>
                    Basic access
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`
                    relative p-4 rounded-xl border transition-all duration-300
                    ${role === 'admin'
                      ? 'bg-pink-500/30 border-pink-400/50 shadow-neon-pink'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className={`h-6 w-6 mx-auto mb-2 ${role === 'admin' ? 'text-pink-300' : 'text-white/60'}`} />
                  <span className={`block text-sm font-medium ${role === 'admin' ? 'text-white' : 'text-white/60'}`}>
                    Admin
                  </span>
                  <span className={`block text-xs mt-1 ${role === 'admin' ? 'text-pink-200' : 'text-white/40'}`}>
                    Full access
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <GlassButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Create Account
              </GlassButton>

              <GlassButton
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Cancel
              </GlassButton>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-purple-400 hover:text-purple-300 transition duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Register;
