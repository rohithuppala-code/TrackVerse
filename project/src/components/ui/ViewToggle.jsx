import { motion } from 'framer-motion';
import { List, LayoutGrid } from 'lucide-react';

export default function ViewToggle({ view, onChange, className = '' }) {
  const options = [
    { value: 'table', icon: List, label: 'Table' },
    { value: 'cards', icon: LayoutGrid, label: 'Cards' },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 ${className}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = view === option.value;

        return (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${isActive ? 'text-white' : 'text-white/50 hover:text-white/70'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="viewToggleActive"
                className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg border border-white/20"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10 hidden sm:inline">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
