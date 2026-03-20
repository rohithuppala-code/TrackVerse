import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function GlassInput({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  min,
  max,
  step,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full
            ${Icon ? 'pl-10' : 'pl-4'}
            ${type === 'password' ? 'pr-10' : 'pr-4'}
            py-3
            bg-white/10
            backdrop-blur-md
            border
            ${error ? 'border-red-400/50' : isFocused ? 'border-purple-400/50' : 'border-white/20'}
            rounded-xl
            text-white
            placeholder-white/40
            transition-all duration-300
            focus:outline-none
            focus:bg-white/15
            focus:shadow-neon-purple
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
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
