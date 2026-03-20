import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function GlassSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  label,
  icon: Icon,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-white/80 mb-2"
        >
          {label}
          {required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 z-10 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full
            ${Icon ? 'pl-10' : 'pl-4'}
            pr-10
            py-3
            bg-white/10
            backdrop-blur-md
            border
            ${error ? 'border-red-400/50' : isFocused ? 'border-purple-400/50' : 'border-white/20'}
            rounded-xl
            text-white
            appearance-none
            cursor-pointer
            transition-all duration-300
            focus:outline-none
            focus:bg-white/15
            focus:shadow-neon-purple
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <option value="" className="bg-gray-800 text-white">
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-gray-800 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isFocused ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
