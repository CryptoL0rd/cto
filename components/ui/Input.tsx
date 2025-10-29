import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300 mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-slate-900/50 backdrop-blur-sm border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
            error
              ? 'border-nebula-500 focus:border-nebula-500 focus:ring-nebula-500/50'
              : 'border-slate-700/50 focus:border-cosmic-500 focus:ring-cosmic-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:border-cosmic-400/50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-nebula-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
